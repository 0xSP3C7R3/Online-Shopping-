import { useState, useEffect } from 'react';
import { User, Product, Order, OrderItem } from './types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, DEFAULT_USERS } from './data';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import { RefreshCw } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize state from LocalStorage on mount
  useEffect(() => {
    try {
      const storedProducts = localStorage.getItem('aura_bazaar_products');
      const storedOrders = localStorage.getItem('aura_bazaar_orders');
      const storedUsers = localStorage.getItem('aura_bazaar_users');
      const storedSession = localStorage.getItem('aura_bazaar_active_session');

      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      } else {
        setProducts(INITIAL_PRODUCTS);
        localStorage.setItem('aura_bazaar_products', JSON.stringify(INITIAL_PRODUCTS));
      }

      if (storedOrders) {
        setOrders(JSON.parse(storedOrders));
      } else {
        setOrders(INITIAL_ORDERS);
        localStorage.setItem('aura_bazaar_orders', JSON.stringify(INITIAL_ORDERS));
      }

      if (storedUsers) {
        const parsedUsers = JSON.parse(storedUsers);
        const hasAdminClark = parsedUsers.some((u: User) => u.id === 'adminclark');
        if (!hasAdminClark) {
          const adminUser = DEFAULT_USERS.find((u: User) => u.id === 'adminclark');
          const updatedUsers = adminUser ? [...parsedUsers, adminUser] : parsedUsers;
          setUsers(updatedUsers);
          localStorage.setItem('aura_bazaar_users', JSON.stringify(updatedUsers));
        } else {
          setUsers(parsedUsers);
        }
      } else {
        setUsers(DEFAULT_USERS);
        localStorage.setItem('aura_bazaar_users', JSON.stringify(DEFAULT_USERS));
      }

      if (storedSession) {
        setCurrentUser(JSON.parse(storedSession));
      }
    } catch (e) {
      console.error('Error initializing state from localStorage', e);
      // Fallback
      setProducts(INITIAL_PRODUCTS);
      setOrders(INITIAL_ORDERS);
      setUsers(DEFAULT_USERS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync helpers
  const saveProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    localStorage.setItem('aura_bazaar_products', JSON.stringify(updatedProducts));
  };

  const saveOrders = (updatedOrders: Order[]) => {
    setOrders(updatedOrders);
    localStorage.setItem('aura_bazaar_orders', JSON.stringify(updatedOrders));
  };

  const saveUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    localStorage.setItem('aura_bazaar_users', JSON.stringify(updatedUsers));
  };

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
    const updated = [productWithId, ...products];
    saveProducts(updated);
  };

  // 2. Admin Update Stock
  const handleUpdateStock = (productId: string, newStock: number) => {
    const updated = products.map(p => (p.id === productId ? { ...p, stock: Math.max(0, newStock) } : p));
    saveProducts(updated);
  };

  // Admin Edit Product
  const handleEditProduct = (updatedProduct: Product) => {
    const updated = products.map(p => (p.id === updatedProduct.id ? updatedProduct : p));
    saveProducts(updated);
  };

  // Admin Delete Product
  const handleDeleteProduct = (productId: string) => {
    const updated = products.filter(p => p.id !== productId);
    saveProducts(updated);
  };

  // 3. Admin Update Order Status (Pending -> Delivered / Cancelled)
  const handleUpdateOrderStatus = (orderId: string, status: 'Pending' | 'Delivered' | 'Cancelled') => {
    const updated = orders.map(o => (o.id === orderId ? { ...o, status } : o));
    saveOrders(updated);
  };

  // 4. User Place Order (reduces stock, registers order)
  const handlePlaceOrder = (items: OrderItem[], paymentMethod: string) => {
    if (!currentUser) return;

    // Reduce product stocks
    const updatedProducts = products.map(p => {
      const purchasedItem = items.find(item => item.productId === p.id);
      if (purchasedItem) {
        return { ...p, stock: Math.max(0, p.stock - purchasedItem.quantity) };
      }
      return p;
    });
    saveProducts(updatedProducts);

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

    const updatedOrders = [newOrder, ...orders];
    saveOrders(updatedOrders);
  };

  // 5. User Update Profile
  const handleUpdateProfile = (updatedProfile: User) => {
    // Update active session
    setCurrentUser(updatedProfile);
    localStorage.setItem('aura_bazaar_active_session', JSON.stringify(updatedProfile));

    // Update global users list
    const updatedUsers = users.map(u => (u.id === updatedProfile.id ? updatedProfile : u));
    saveUsers(updatedUsers);

    // Also update order history userName matching if changed
    const updatedOrders = orders.map(o => (o.userId === updatedProfile.id ? { ...o, userName: updatedProfile.name } : o));
    saveOrders(updatedOrders);
  };

  // 6. Register User
  const handleRegister = (newUser: User) => {
    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);
  };

  // System Reset (For testing and restore initial dataset)
  const handleResetSystem = () => {
    if (window.confirm('Sigurado ka bang nais mong i-reset ang Online Shopping sa default na data? Mabubura ang lahat ng ginawang pagbabago.')) {
      localStorage.removeItem('aura_bazaar_products');
      localStorage.removeItem('aura_bazaar_orders');
      localStorage.removeItem('aura_bazaar_users');
      localStorage.removeItem('aura_bazaar_active_session');
      setProducts(INITIAL_PRODUCTS);
      setOrders(INITIAL_ORDERS);
      setUsers(DEFAULT_USERS);
      setCurrentUser(null);
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
