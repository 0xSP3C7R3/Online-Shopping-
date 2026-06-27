import { useState, useEffect } from 'react';
import { User, Product, Order, OrderItem } from './types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, DEFAULT_USERS } from './data';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import { RefreshCw } from 'lucide-react';
import {
  seedDatabaseIfEmpty,
  subscribeToProducts,
  subscribeToOrders,
  subscribeToUsers,
  saveProductToFirestore,
  deleteProductFromFirestore,
  saveOrderToFirestore,
  updateOrderStatusInFirestore,
  deleteOrderFromFirestore,
  saveUserToFirestore,
  resetOrdersInFirestore,
  resetSystemInFirestore
} from './firebase';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize state from LocalStorage & Firebase on mount
  useEffect(() => {
    // 1. Initial load from LocalStorage for immediate UI paint
    try {
      const storedProducts = localStorage.getItem('aura_bazaar_products');
      const storedOrders = localStorage.getItem('aura_bazaar_orders');
      const storedUsers = localStorage.getItem('aura_bazaar_users');
      const storedSession = localStorage.getItem('aura_bazaar_active_session');

      if (storedProducts) setProducts(JSON.parse(storedProducts));
      if (storedOrders) setOrders(JSON.parse(storedOrders));
      if (storedUsers) setUsers(JSON.parse(storedUsers));
      if (storedSession) setCurrentUser(JSON.parse(storedSession));
    } catch (e) {
      console.error('Error loading initial cache:', e);
    }

    // 2. Setup Firebase real-time subscriptions and seeding
    let isSubscribed = true;
    let unsubProducts: (() => void) | undefined;
    let unsubOrders: (() => void) | undefined;
    let unsubUsers: (() => void) | undefined;

    async function initFirebase() {
      // Seed default items if empty
      await seedDatabaseIfEmpty(INITIAL_PRODUCTS, DEFAULT_USERS);

      if (!isSubscribed) return;

      // Subscribe to Products
      unsubProducts = subscribeToProducts((fbProducts) => {
        if (fbProducts.length > 0) {
          setProducts(fbProducts);
          localStorage.setItem('aura_bazaar_products', JSON.stringify(fbProducts));
        } else {
          setProducts(INITIAL_PRODUCTS);
        }
      });

      // Subscribe to Orders
      unsubOrders = subscribeToOrders((fbOrders) => {
        setOrders(fbOrders);
        localStorage.setItem('aura_bazaar_orders', JSON.stringify(fbOrders));
      });

      // Subscribe to Users
      unsubUsers = subscribeToUsers((fbUsers) => {
        if (fbUsers.length > 0) {
          setUsers(fbUsers);
          localStorage.setItem('aura_bazaar_users', JSON.stringify(fbUsers));
        }
      });

      setIsLoading(false);
    }

    initFirebase();

    return () => {
      isSubscribed = false;
      if (unsubProducts) unsubProducts();
      if (unsubOrders) unsubOrders();
      if (unsubUsers) unsubUsers();
    };
  }, []);

  // Auth Handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('aura_bazaar_active_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('aura_bazaar_active_session');
  };

  // 1. Admin Add Product
  const handleAddProduct = (newProduct: Omit<Product, 'id'>) => {
    const id = `p-${Date.now()}`;
    const productWithId: Product = { ...newProduct, id };
    saveProductToFirestore(productWithId);
  };

  // 2. Admin Update Stock
  const handleUpdateStock = (productId: string, newStock: number) => {
    const p = products.find(prod => prod.id === productId);
    if (p) {
      saveProductToFirestore({ ...p, stock: Math.max(0, newStock) });
    }
  };

  // Admin Edit Product
  const handleEditProduct = (updatedProduct: Product) => {
    saveProductToFirestore(updatedProduct);
  };

  // Admin Delete Product
  const handleDeleteProduct = (productId: string) => {
    deleteProductFromFirestore(productId);
  };

  // 3. Admin Update Order Status (Pending -> Delivered / Cancelled)
  const handleUpdateOrderStatus = (orderId: string, status: 'Pending' | 'Delivered' | 'Cancelled') => {
    updateOrderStatusInFirestore(orderId, status);
  };

  const handleDeleteOrder = (orderId: string) => {
    deleteOrderFromFirestore(orderId);
  };

  const handleResetOrders = () => {
    resetOrdersInFirestore();
  };

  // 4. User Place Order (reduces stock, registers order)
  const handlePlaceOrder = (items: OrderItem[], paymentMethod: string) => {
    if (!currentUser) return;

    // Reduce product stocks in Firestore
    items.forEach(item => {
      const p = products.find(prod => prod.id === item.productId);
      if (p) {
        const updatedProduct = { ...p, stock: Math.max(0, p.stock - item.quantity) };
        saveProductToFirestore(updatedProduct);
      }
    });

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Create unique order object
    const newOrder: Order = {
      id: `ord-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      items,
      totalAmount,
      status: 'Pending',
      date: new Date().toISOString(),
      paymentMethod
    };

    saveOrderToFirestore(newOrder);
  };

  // 5. User Update Profile
  const handleUpdateProfile = (updatedProfile: User) => {
    // Update active session
    setCurrentUser(updatedProfile);
    localStorage.setItem('aura_bazaar_active_session', JSON.stringify(updatedProfile));

    // Save to Firestore
    saveUserToFirestore(updatedProfile);
  };

  // 6. Register User
  const handleRegister = (newUser: User) => {
    saveUserToFirestore(newUser);
  };

  // 7. Update Password (Forgot Password)
  const handleUpdatePassword = (email: string, newPassword: string): boolean => {
    const matchedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() || u.id.toLowerCase() === email.toLowerCase());
    if (!matchedUser) return false;
    const updatedUser = { ...matchedUser, password: newPassword };
    saveUserToFirestore(updatedUser);
    return true;
  };

  // System Reset (For testing and restore initial dataset)
  const handleResetSystem = () => {
    if (window.confirm('Sigurado ka bang nais mong i-reset ang Online Shopping sa default na data? Mabubura ang lahat ng ginawang pagbabago.')) {
      localStorage.removeItem('aura_bazaar_products');
      localStorage.removeItem('aura_bazaar_orders');
      localStorage.removeItem('aura_bazaar_users');
      localStorage.removeItem('aura_bazaar_active_session');
      setCurrentUser(null);
      resetSystemInFirestore(INITIAL_PRODUCTS, DEFAULT_USERS);
      alert('Matagumpay na nai-reset ang system!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
        <span className="text-sm font-semibold text-slate-500">I-niloload ang Online Shopping...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Universal Quick State Reset link for developers, placed elegantly in the header absolute margin */}
      <div className="absolute top-2 left-2 z-50 text-[10px] text-slate-400 font-medium">
        <button
          onClick={handleResetSystem}
          className="flex items-center gap-1 opacity-40 hover:opacity-100 hover:text-indigo-600 bg-white/80 border border-slate-200 px-2.5 py-1 rounded-md transition shadow-xs"
        >
          <RefreshCw className="w-3 h-3" />
          Reset System Data
        </button>
      </div>

      {!currentUser ? (
        <Login
          users={users}
          onLoginSuccess={handleLoginSuccess}
          onRegister={handleRegister}
          onUpdatePassword={handleUpdatePassword}
        />
      ) : currentUser.role === 'admin' ? (
        <AdminDashboard
          products={products}
          orders={orders}
          onAddProduct={handleAddProduct}
          onUpdateStock={handleUpdateStock}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onLogout={handleLogout}
          currentUser={currentUser}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
          onDeleteOrder={handleDeleteOrder}
          onResetOrders={handleResetOrders}
          onResetSystem={handleResetSystem}
        />
      ) : (
        <UserDashboard
          products={products}
          orders={orders}
          currentUser={currentUser}
          onUpdateProfile={handleUpdateProfile}
          onPlaceOrder={handlePlaceOrder}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
