import React, { useState, useMemo } from 'react';
import { Product, Order, User, OrderItem } from '../types';
import {
  ShoppingBag,
  ShoppingCart,
  User as UserIcon,
  Search,
  Filter,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Plus,
  Minus,
  Trash2,
  LogOut,
  ChevronRight,
  Sparkles,
  Home,
  Check
} from 'lucide-react';

interface UserDashboardProps {
  products: Product[];
  orders: Order[];
  currentUser: User;
  onUpdateProfile: (updatedProfile: User) => void;
  onPlaceOrder: (items: OrderItem[], paymentMethod: string) => void;
  onLogout: () => void;
}

export default function UserDashboard({
  products,
  orders,
  currentUser,
  onUpdateProfile,
  onPlaceOrder,
  onLogout
}: UserDashboardProps) {
  // Navigation Tabs for User
  const [activeTab, setActiveTab] = useState<'shop' | 'orders' | 'profile'>('shop');

  // Search and Filter for shopping catalog
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Product detail view state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Profile Edit fields
  const [editName, setEditName] = useState(currentUser.name);
  const [editPhone, setEditPhone] = useState(currentUser.phone);
  const [editAddress, setEditAddress] = useState(currentUser.address);
  const [editAvatar, setEditAvatar] = useState(currentUser.avatar);
  const [isSavedMessage, setIsSavedMessage] = useState(false);

  // Local Shopping Cart State
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('GCash');
  const [orderCompletedSuccess, setOrderCompletedSuccess] = useState(false);

  // Categories
  const categories = ['All', 'Gadgets & Tech', 'Apparel & Fashion', 'Home & Living', 'Cosmetics & Beauty'];

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Filter orders for the current user
  const userOrders = useMemo(() => {
    return orders
      .filter(o => o.userId === currentUser.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [orders, currentUser.id]);

  // Calculate cart calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const totalItemsInCart = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // Cart actions
  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert('Sori! Out of stock na ang produktong ito.');
      return;
    }

    setCart(prevCart => {
      const existing = prevCart.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`Hanggang ${product.stock} piraso lamang ang magagamit na stock.`);
          return prevCart;
        }
        return prevCart.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          // check stock limit
          if (newQty > item.product.stock) {
            alert(`Sapat lamang sa ${item.product.stock} ang stock ng item na ito.`);
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean) as { product: Product; quantity: number }[];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  // Checkout submit
  const handleCheckout = () => {
    if (cart.length === 0) return;

    const orderItems: OrderItem[] = cart.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.image
    }));

    onPlaceOrder(orderItems, paymentMethod);
    setCart([]); // Clear cart
    setShowCart(false);
    setOrderCompletedSuccess(true);
    setActiveTab('orders'); // Jump to transactions
    setTimeout(() => setOrderCompletedSuccess(false), 6000);
  };

  // Profile Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...currentUser,
      name: editName,
      phone: editPhone,
      address: editAddress,
      avatar: editAvatar
    });
    setIsSavedMessage(true);
    setTimeout(() => setIsSavedMessage(false), 4000);
  };

  return (
    <div id="user-dashboard" className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Header Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 text-white p-2 rounded-lg">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900 font-sans block">Online Shopping</span>
                <span className="text-[10px] text-slate-500 font-medium block">De-kalidad at Mabilisang Serbisyo</span>
              </div>
            </div>

            {/* Middle Nav Desktop tabs */}
            <nav className="hidden md:flex space-x-1">
              <button
                id="nav-shop"
                onClick={() => { setActiveTab('shop'); setSelectedProduct(null); }}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  activeTab === 'shop' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mag-browse ng Produkto
              </button>
              <button
                id="nav-orders"
                onClick={() => { setActiveTab('orders'); setSelectedProduct(null); }}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'orders' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Aking mga Order ({userOrders.length})
              </button>
              <button
                id="nav-profile"
                onClick={() => { setActiveTab('profile'); setSelectedProduct(null); }}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  activeTab === 'profile' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Aking Profile
              </button>
            </nav>

            {/* Right controls */}
            <div className="flex items-center gap-3">
              {/* Cart Toggle button */}
              <button
                id="cart-toggle-btn"
                onClick={() => setShowCart(!showCart)}
                className="relative p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition"
              >
                <ShoppingCart className="w-6 h-6" />
                {totalItemsInCart > 0 && (
                  <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                    {totalItemsInCart}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-indigo-200"
                />
                <button
                  id="user-logout-btn"
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                  title="Mag-logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation sub-tabs */}
        <div className="flex border-t border-slate-200 md:hidden bg-slate-50 justify-around text-xs font-semibold py-2">
          <button
            id="mobile-nav-shop"
            onClick={() => { setActiveTab('shop'); setSelectedProduct(null); }}
            className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'shop' ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}
          >
            <Home className="w-4.5 h-4.5" />
            Bumili
          </button>
          <button
            id="mobile-nav-orders"
            onClick={() => { setActiveTab('orders'); setSelectedProduct(null); }}
            className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'orders' ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}
          >
            <Clock className="w-4.5 h-4.5" />
            Mga Order ({userOrders.length})
          </button>
          <button
            id="mobile-nav-profile"
            onClick={() => { setActiveTab('profile'); setSelectedProduct(null); }}
            className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'profile' ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}
          >
            <UserIcon className="w-4.5 h-4.5" />
            Profile
          </button>
        </div>
      </header>

      {/* Checkout Order Success banner */}
      {orderCompletedSuccess && (
        <div className="bg-emerald-50 border-y border-emerald-200 text-emerald-800 p-4 text-center text-sm font-semibold animate-fade-in flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          Mabuhay! Matagumpay na naipadala ang inyong order. Maaari ninyong subaybayan ang katayuan (status) nito sa ibaba.
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
        
        {/* Left Side: Dynamic tabs layout */}
        <div className="flex-1 min-w-0">
          
          {/* TAB 1: SHOPPING CATALOG */}
          {activeTab === 'shop' && !selectedProduct && (
            <div className="space-y-6 animate-fade-in">
              {/* Promo Banner Card */}
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-md">
                <div className="relative z-10 max-w-lg">
                  <span className="bg-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Eksklusibong Alok sa Araw na ito
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black mt-3 tracking-tight">Mag-order Ngayon, Libreng Hatid Bukas!</h2>
                  <p className="text-xs sm:text-sm text-indigo-100 mt-2">
                    Tangkilikin ang pinakamahusay na karanasan sa pagbili ng mga gadget, damit, at kagamitan sa bahay dito sa Aura Bazaar.
                  </p>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-12 translate-y-6 pointer-events-none">
                  <ShoppingBag className="w-72 h-72" />
                </div>
              </div>

              {/* Search & Filters */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="search-shop-input"
                    type="text"
                    placeholder="Maghanap ng mga produkto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none py-1">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                        selectedCategory === cat
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Products Catalog Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.length === 0 ? (
                  <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-slate-100">
                    <p className="text-slate-500 font-medium">Walang nahanap na tugmang produkto.</p>
                  </div>
                ) : (
                  filteredProducts.map(prod => (
                    <div
                      key={prod.id}
                      className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between"
                    >
                      <div className="relative cursor-pointer" onClick={() => setSelectedProduct(prod)}>
                        <img src={prod.image} alt={prod.name} className="w-full h-48 object-cover hover:scale-105 transition duration-300" />
                        <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                          {prod.category}
                        </span>
                        {prod.stock === 0 && (
                          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
                            <span className="bg-red-600 text-white text-xs font-black px-4 py-1.5 rounded-lg shadow-sm uppercase tracking-wide">
                              Out of Stock
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <h4
                            onClick={() => setSelectedProduct(prod)}
                            className="font-bold text-slate-900 text-base hover:text-indigo-600 cursor-pointer line-clamp-1"
                          >
                            {prod.name}
                          </h4>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1">{prod.description}</p>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Presyo</span>
                            <span className="text-lg font-bold text-slate-900">₱{prod.price.toLocaleString()}</span>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider mb-1">Stock</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                              prod.stock <= 5 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                            }`}>
                              {prod.stock} left
                            </span>
                          </div>
                        </div>

                        <div className="pt-2">
                          {prod.stock > 0 ? (
                            <button
                              id={`add-to-cart-${prod.id}`}
                              onClick={() => handleAddToCart(prod)}
                              className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                              Idagdag sa Cart
                            </button>
                          ) : (
                            <button
                              disabled
                              className="w-full py-2.5 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold cursor-not-allowed"
                            >
                              Out of Stock
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* SINGLE PRODUCT DETAIL MODAL/VIEW */}
          {selectedProduct && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 animate-fade-in">
              <button
                id="back-to-shop"
                onClick={() => setSelectedProduct(null)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 mb-6 inline-flex items-center gap-1"
              >
                &larr; Bumalik sa listahan ng mga produkto
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="rounded-2xl overflow-hidden shadow-sm">
                  <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-80 object-cover" />
                </div>

                <div className="flex flex-col justify-between space-y-6">
                  <div>
                    <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {selectedProduct.category}
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 mt-3 tracking-tight">{selectedProduct.name}</h3>
                    <p className="text-lg font-black text-indigo-600 mt-2">₱{selectedProduct.price.toLocaleString()}</p>
                    
                    <div className="border-t border-b border-slate-100 py-4 my-4">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Mga Detalye & Deskripsyon</p>
                      <p className="text-sm text-slate-600 leading-relaxed">{selectedProduct.description}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-semibold">Kasulukuyang Stock:</span>
                      <span className={`font-bold px-2.5 py-1 rounded-full text-xs ${
                        selectedProduct.stock <= 5 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {selectedProduct.stock} left in stock
                      </span>
                    </div>

                    {selectedProduct.stock > 0 ? (
                      <button
                        id={`detail-add-to-cart-${selectedProduct.id}`}
                        onClick={() => {
                          handleAddToCart(selectedProduct);
                          setSelectedProduct(null);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm transition"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Idagdag sa Cart ang Item na ito
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-3 bg-slate-100 text-slate-400 rounded-xl text-sm font-bold cursor-not-allowed"
                      >
                        Walang Stock sa Kasalukuyan
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY ORDERS & TRANSACTION TRACKER */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Aking mga Order & Transactions</h3>
                <p className="text-xs text-slate-500 mt-0.5">Subaybayan ang katayuan ng inyong mga binili sa Aura Bazaar.</p>
              </div>

              {userOrders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center space-y-4">
                  <div className="p-3 bg-slate-50 text-slate-400 rounded-full">
                    <Clock className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Wala ka pang order</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                      Mag-browse sa aming katalogo at ilagay ang iyong unang order ngayon!
                    </p>
                  </div>
                  <button
                    id="order-empty-go-shop"
                    onClick={() => setActiveTab('shop')}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                  >
                    Bumili Ngayon
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {userOrders.map(order => (
                    <div key={order.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                      {/* Order Header info */}
                      <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">ID ng Order:</span>
                            <span className="font-mono text-xs font-bold text-indigo-600">{order.id}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Inorder noong:{' '}
                            <span className="font-semibold text-slate-700">
                              {new Date(order.date).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Status:</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 ${
                            order.status === 'Pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-100'
                              : order.status === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-red-50 text-red-700 border border-red-100'
                          }`}>
                            {order.status === 'Pending' ? (
                              <>
                                <Clock className="w-3.5 h-3.5 animate-spin" />
                                Pending Order (Hinahanda pa)
                              </>
                            ) : order.status === 'Delivered' ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5" />
                                delivered (Naihatid na)
                              </>
                            ) : (
                              'I-kinansela'
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Items in this order */}
                      <div className="p-6 divide-y divide-slate-50">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                            <div className="flex items-center gap-3.5">
                              <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover border border-slate-100" />
                              <div>
                                <h5 className="font-bold text-slate-900 text-sm line-clamp-1">{item.name}</h5>
                                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                                  ₱{item.price.toLocaleString()} x {item.quantity}
                                </p>
                              </div>
                            </div>
                            <span className="font-bold text-slate-900 text-sm shrink-0">
                              ₱{(item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Summary & Shipping details */}
                      <div className="bg-slate-50/30 px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 text-xs font-semibold text-slate-600">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>Address: {currentUser.address}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>Phone: {currentUser.phone}</span>
                          </div>
                        </div>

                        <div className="text-right sm:border-l sm:pl-6 border-slate-200">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Paraan ng Pagbayad: {order.paymentMethod}</span>
                          <span className="text-base font-black text-slate-900 block mt-1">
                            Kabuuan: ₱{order.totalAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: USER PROFILE VIEW/EDIT */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 animate-fade-in">
              <div className="mb-6">
                <h3 className="text-xl font-extrabold text-slate-900">Aking Profile ng Customer</h3>
                <p className="text-xs text-slate-500 mt-0.5">I-update ang iyong personal na detalye at address para sa mabilis na paghahatid.</p>
              </div>

              {isSavedMessage && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs font-bold mb-6 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Matagumpay na nai-save ang iyong profile!
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-5">
                {/* Avatar select */}
                <div className="flex flex-col sm:flex-row items-center gap-5 pb-4 border-b border-slate-100">
                  <img src={editAvatar} alt="Profile Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-indigo-100" />
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pumili ng Avatar</label>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
                        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
                        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
                      ].map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setEditAvatar(url)}
                          className={`w-9 h-9 rounded-full overflow-hidden border-2 transition ${
                            editAvatar === url ? 'border-indigo-600 scale-110' : 'border-transparent'
                          }`}
                        >
                          <img src={url} alt="preset avatar" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="prof-name" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pangalan</label>
                    <input
                      id="prof-name"
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="prof-phone" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Numero ng Telepono</label>
                    <input
                      id="prof-phone"
                      type="text"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="prof-email" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email (Hindi nae-edit)</label>
                  <input
                    id="prof-email"
                    type="email"
                    disabled
                    value={currentUser.email}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 bg-slate-50 text-slate-400 rounded-lg cursor-not-allowed"
                  />
                </div>

                <div>
                  <label htmlFor="prof-addr" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Detalyadong Address ng Paghahatid (Delivery Address)</label>
                  <textarea
                    id="prof-addr"
                    rows={3}
                    required
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="Ilagay ang saktong address (Street, Barangay, City, Province)..."
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  ></textarea>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    id="save-profile-btn"
                    type="submit"
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                  >
                    I-save ang mga Pagbabago
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Right Side: Persistent Cart Summary (only visible on Desktop if Cart is opened or has items) */}
        {showCart && (
          <div className="w-80 shrink-0 bg-white rounded-3xl border border-slate-100 p-6 shadow-md flex flex-col justify-between h-[560px] sticky top-24 animate-fade-in">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                  <ShoppingCart className="w-4 h-4 text-indigo-600" />
                  Cart ng Pagbili
                </h3>
                <button
                  id="close-cart-btn"
                  onClick={() => setShowCart(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  &times;
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="py-24 text-center text-slate-400">
                  <ShoppingCart className="w-12 h-12 text-slate-200 mx-auto mb-3 animate-pulse" />
                  <p className="text-xs font-bold">Walang laman ang cart.</p>
                  <p className="text-[11px] mt-1 text-slate-400">Pumili ng produkto sa kaliwa.</p>
                </div>
              ) : (
                <div className="overflow-y-auto max-h-[280px] divide-y divide-slate-50 pr-1 scrollbar-thin">
                  {cart.map(item => (
                    <div key={item.product.id} className="py-3 flex justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <img src={item.product.image} alt={item.product.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-slate-900 line-clamp-1">{item.product.name}</p>
                          <p className="text-[11px] text-indigo-600 font-semibold">₱{item.product.price.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg p-0.5 border border-slate-200">
                          <button
                            id={`qty-minus-${item.product.id}`}
                            onClick={() => handleUpdateQuantity(item.product.id, -1)}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-white rounded"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold px-1 text-slate-800">{item.quantity}</span>
                          <button
                            id={`qty-plus-${item.product.id}`}
                            onClick={() => handleUpdateQuantity(item.product.id, 1)}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-white rounded"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          id={`remove-item-${item.product.id}`}
                          onClick={() => handleRemoveFromCart(item.product.id)}
                          className="text-[10px] text-red-500 hover:text-red-700 hover:underline flex items-center gap-0.5 font-semibold"
                        >
                          <Trash2 className="w-3 h-3" /> I-delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-4 bg-white">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Address ng Pagpapadala:</span>
                    <span className="text-slate-700 font-bold max-w-[140px] truncate text-right" title={currentUser.address}>
                      {currentUser.address}
                    </span>
                  </div>
                  
                  {/* Select Payment Method */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Paraan ng Pagbayad</label>
                    <select
                      id="select-payment-method"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg p-2 font-semibold text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="GCash">GCash e-Wallet</option>
                      <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                      <option value="Bank Transfer">Bank Transfer (BDO/BPI)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm font-black pt-1">
                  <span className="text-slate-800">Kabuuang Halaga:</span>
                  <span className="text-lg text-indigo-600">₱{cartSubtotal.toLocaleString()}</span>
                </div>

                <button
                  id="checkout-submit-btn"
                  onClick={handleCheckout}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm hover:shadow"
                >
                  Ipasa at I-checkout ang Order
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
