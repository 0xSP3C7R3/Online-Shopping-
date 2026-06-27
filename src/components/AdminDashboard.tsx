import React, { useState, useMemo } from 'react';
import { Product, Order, User } from '../types';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  DollarSign,
  Plus,
  Truck,
  CheckCircle,
  Clock,
  ArrowRight,
  LogOut,
  Calendar,
  Layers,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Edit2,
  Trash2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line
} from 'recharts';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateStock: (productId: string, newStock: number) => void;
  onUpdateOrderStatus: (orderId: string, status: 'Pending' | 'Delivered' | 'Cancelled') => void;
  onLogout: () => void;
  currentUser: User;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onDeleteOrder: (orderId: string) => void;
  onResetOrders: () => void;
  onResetSystem: () => void;
}

export default function AdminDashboard({
  products,
  orders,
  onAddProduct,
  onUpdateStock,
  onUpdateOrderStatus,
  onLogout,
  currentUser,
  onEditProduct,
  onDeleteProduct,
  onDeleteOrder,
  onResetOrders,
  onResetSystem
}: AdminDashboardProps) {
  // Navigation Tabs for Admin
  const [activeTab, setActiveTab] = useState<'summary' | 'orders' | 'inventory'>('summary');
  
  // Sales Period filter for the chart in Summary
  const [salesPeriod, setSalesPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  // Form states for adding new product
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductStock, setNewProductStock] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('Gadgets & Tech');
  const [newProductImage, setNewProductImage] = useState('');

  // Form states for editing a product
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editProductName, setEditProductName] = useState('');
  const [editProductDescription, setEditProductDescription] = useState('');
  const [editProductPrice, setEditProductPrice] = useState('');
  const [editProductStock, setEditProductStock] = useState('');
  const [editProductCategory, setEditProductCategory] = useState('Gadgets & Tech');
  const [editProductImage, setEditProductImage] = useState('');

  // Inventory Search and Filter
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('All');

  // Orders Search and Status Filter
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');

  // Custom Date Range filter for Sales summary
  const [dateFilterFrom, setDateFilterFrom] = useState('2026-06-01');
  const [dateFilterTo, setDateFilterTo] = useState('2026-06-26');

  // Custom Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
    onConfirm: () => void;
  } | null>(null);

  const requestConfirmation = (
    title: string,
    message: string,
    onConfirm: () => void,
    isDanger = true,
    confirmText = 'Sigurado ako',
    cancelText = 'Kanselahin'
  ) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      isDanger,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog(null);
      }
    });
  };

  // Quick preset image selector for adding items
  const IMAGE_PRESETS = [
    { name: 'Gadgets', url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&auto=format&fit=crop&q=80' },
    { name: 'Apparel', url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&auto=format&fit=crop&q=80' },
    { name: 'Home/Furniture', url: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=500&auto=format&fit=crop&q=80' },
    { name: 'Cosmetics', url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop&q=80' }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Masyadong malaki ang larawan! Mangyaring pumili ng larawan na mas mababa sa 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (isEdit) {
          setEditProductImage(base64String);
        } else {
          setNewProductImage(base64String);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper date parsing (Local reference is 2026-06-26)
  const baseDate = useMemo(() => new Date('2026-06-26T12:00:00'), []);

  // 1. COMPUTED SALES SUMMARY (Daily, Weekly, Monthly, Yearly)
  const summaries = useMemo(() => {
    const deliveredOrders = orders.filter(o => o.status === 'Delivered');

    let dailyTotal = 0;
    let dailyCount = 0;
    let weeklyTotal = 0;
    let weeklyCount = 0;
    let monthlyTotal = 0;
    let monthlyCount = 0;
    let yearlyTotal = 0;
    let yearlyCount = 0;

    const oneDayMs = 24 * 60 * 60 * 1000;

    deliveredOrders.forEach(order => {
      const orderDate = new Date(order.date);
      const timeDiff = baseDate.getTime() - orderDate.getTime();
      const daysAgo = timeDiff / oneDayMs;

      // Daily: Same Calendar Day (June 26, 2026)
      if (
        orderDate.getFullYear() === 2026 &&
        orderDate.getMonth() === 5 && // June (0-indexed)
        orderDate.getDate() === 26
      ) {
        dailyTotal += order.totalAmount;
        dailyCount += 1;
      }

      // Weekly: Within last 7 days (June 20 - June 26)
      if (daysAgo >= 0 && daysAgo <= 7) {
        weeklyTotal += order.totalAmount;
        weeklyCount += 1;
      }

      // Monthly: June 2026 (Month 5 of 2026)
      if (orderDate.getFullYear() === 2026 && orderDate.getMonth() === 5) {
        monthlyTotal += order.totalAmount;
        monthlyCount += 1;
      }

      // Yearly: Year 2026
      if (orderDate.getFullYear() === 2026) {
        yearlyTotal += order.totalAmount;
        yearlyCount += 1;
      }
    });

    return {
      daily: { amount: dailyTotal, count: dailyCount },
      weekly: { amount: weeklyTotal, count: weeklyCount },
      monthly: { amount: monthlyTotal, count: monthlyCount },
      yearly: { amount: yearlyTotal, count: yearlyCount }
    };
  }, [orders, baseDate]);

  // Compute Custom Date Range Sales Summary
  const customRangeSummary = useMemo(() => {
    const deliveredOrders = orders.filter(o => o.status === 'Delivered');
    let totalIncome = 0;
    let orderCount = 0;
    const itemsSoldMap: { [key: string]: { name: string, qty: number, amount: number } } = {};

    deliveredOrders.forEach(order => {
      const orderDate = new Date(order.date);
      // Format as YYYY-MM-DD
      const year = orderDate.getFullYear();
      const month = String(orderDate.getMonth() + 1).padStart(2, '0');
      const day = String(orderDate.getDate()).padStart(2, '0');
      const orderDateStr = `${year}-${month}-${day}`;

      const matchesFrom = !dateFilterFrom || orderDateStr >= dateFilterFrom;
      const matchesTo = !dateFilterTo || orderDateStr <= dateFilterTo;

      if (matchesFrom && matchesTo) {
        totalIncome += order.totalAmount;
        orderCount += 1;
        
        order.items.forEach(item => {
          if (!itemsSoldMap[item.productId]) {
            itemsSoldMap[item.productId] = { name: item.name, qty: 0, amount: 0 };
          }
          itemsSoldMap[item.productId].qty += item.quantity;
          itemsSoldMap[item.productId].amount += item.price * item.quantity;
        });
      }
    });

    const topSellingItems = Object.values(itemsSoldMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    return {
      amount: totalIncome,
      count: orderCount,
      topSellingItems
    };
  }, [orders, dateFilterFrom, dateFilterTo]);

  // 2. CHART DATA DYNAMICS
  const chartData = useMemo(() => {
    const deliveredOrders = orders.filter(o => o.status === 'Delivered');

    if (salesPeriod === 'daily') {
      // Last 7 days chart (June 20 to June 26)
      const days = ['Sab', 'Lin', 'Lun', 'Mar', 'Miy', 'Huw', 'Biy']; // Sat to Fri (June 20-26, 2026 is Sat to Fri)
      const dayTotals = Array(7).fill(0);
      const dayCounts = Array(7).fill(0);

      deliveredOrders.forEach(o => {
        const oDate = new Date(o.date);
        const diffMs = baseDate.getTime() - oDate.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 7) {
          // diffDays = 0 is Today (Friday, Biy), diffDays = 1 is Yesterday (Thursday, Huw)
          const index = 6 - diffDays;
          if (index >= 0 && index < 7) {
            dayTotals[index] += o.totalAmount;
            dayCounts[index] += 1;
          }
        }
      });

      return days.map((day, idx) => ({
        name: day,
        'Benta (₱)': dayTotals[idx],
        'Mga Order': dayCounts[idx]
      }));
    }

    if (salesPeriod === 'weekly') {
      // Last 4 weeks of sales summary
      const weeks = ['Wiki 1 (Mas Maaga)', 'Wiki 2', 'Wiki 3', 'Wiki 4 (Ngayon)'];
      const weekTotals = Array(4).fill(0);
      const weekCounts = Array(4).fill(0);

      deliveredOrders.forEach(o => {
        const oDate = new Date(o.date);
        const diffMs = baseDate.getTime() - oDate.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays >= 0 && diffDays < 28) {
          const weekIndex = 3 - Math.floor(diffDays / 7);
          if (weekIndex >= 0 && weekIndex < 4) {
            weekTotals[weekIndex] += o.totalAmount;
            weekCounts[weekIndex] += 1;
          }
        }
      });

      return weeks.map((w, idx) => ({
        name: w,
        'Benta (₱)': weekTotals[idx],
        'Mga Order': weekCounts[idx]
      }));
    }

    if (salesPeriod === 'yearly') {
      // Yearly sales chart (2025 vs 2026)
      const years = ['Taong 2025', 'Taong 2026'];
      const yearTotals = [0, 0];
      const yearCounts = [0, 0];

      deliveredOrders.forEach(o => {
        const year = new Date(o.date).getFullYear();
        if (year === 2025) {
          yearTotals[0] += o.totalAmount;
          yearCounts[0] += 1;
        } else if (year === 2026) {
          yearTotals[1] += o.totalAmount;
          yearCounts[1] += 1;
        }
      });

      return years.map((y, idx) => ({
        name: y,
        'Benta (₱)': yearTotals[idx],
        'Mga Order': yearCounts[idx]
      }));
    }

    // Default: 'monthly' for 2026 (Jan to June)
    const months = ['Ene', 'Peb', 'Mar', 'Abr', 'May', 'Hun'];
    const monthTotals = Array(6).fill(0);
    const monthCounts = Array(6).fill(0);

    deliveredOrders.forEach(o => {
      const oDate = new Date(o.date);
      if (oDate.getFullYear() === 2026) {
        const m = oDate.getMonth(); // 0 is Jan, 5 is June
        if (m >= 0 && m < 6) {
          monthTotals[m] += o.totalAmount;
          monthCounts[m] += 1;
        }
      }
    });

    return months.map((month, idx) => ({
      name: month,
      'Benta (₱)': monthTotals[idx],
      'Mga Order': monthCounts[idx]
    }));
  }, [orders, salesPeriod, baseDate]);

  // Handle Add Product Submit
  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductPrice || !newProductStock) {
      alert('Mangyaring punan ang pangalan, presyo, at stock!');
      return;
    }

    const priceNum = parseFloat(newProductPrice);
    const stockNum = parseInt(newProductStock);

    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Dapat wasto at mas mataas sa 0 ang presyo!');
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      alert('Dapat wasto at hindi bababa sa 0 ang stock!');
      return;
    }

    // Use selected preset or default image if none provided
    const finalImage = newProductImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';

    onAddProduct({
      name: newProductName,
      description: newProductDescription || 'Walang deskripsyon.',
      price: priceNum,
      stock: stockNum,
      image: finalImage,
      category: newProductCategory
    });

    // Reset Form
    setNewProductName('');
    setNewProductDescription('');
    setNewProductPrice('');
    setNewProductStock('');
    setNewProductImage('');
    setShowAddModal(false);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProductId(prod.id);
    setEditProductName(prod.name);
    setEditProductDescription(prod.description);
    setEditProductPrice(prod.price.toString());
    setEditProductStock(prod.stock.toString());
    setEditProductCategory(prod.category);
    setEditProductImage(prod.image);
    setShowEditModal(true);
  };

  const handleEditProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProductId || !editProductName || !editProductPrice || !editProductStock) {
      alert('Mangyaring punan ang pangalan, presyo, at stock!');
      return;
    }

    const priceNum = parseFloat(editProductPrice);
    const stockNum = parseInt(editProductStock);

    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Dapat wasto at mas mataas sa 0 ang presyo!');
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      alert('Dapat wasto at hindi bababa sa 0 ang stock!');
      return;
    }

    onEditProduct({
      id: editingProductId,
      name: editProductName,
      description: editProductDescription || 'Walang deskripsyon.',
      price: priceNum,
      stock: stockNum,
      image: editProductImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
      category: editProductCategory
    });

    setShowEditModal(false);
    setEditingProductId(null);
  };

  const handleDeleteProductClick = (productId: string, productName: string) => {
    requestConfirmation(
      'Burahin ang Produkto',
      `Sigurado ka bang nais mong burahin ang produktong "${productName}"? Hindi na ito mababawi sa system at mawawala sa listahan ng mamimili.`,
      () => onDeleteProduct(productId),
      true,
      'Oo, Burahin',
      'Huwag Muna'
    );
  };

  // Filter Products for Inventory
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                            p.description.toLowerCase().includes(inventorySearch.toLowerCase());
      const matchesCategory = inventoryCategoryFilter === 'All' || p.category === inventoryCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, inventorySearch, inventoryCategoryFilter]);

  // Filter Orders for Order Management
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = o.userName.toLowerCase().includes(orderSearch.toLowerCase()) ||
                            o.id.toLowerCase().includes(orderSearch.toLowerCase());
      const matchesStatus = orderStatusFilter === 'All' || o.status === orderStatusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Latest first
  }, [orders, orderSearch, orderStatusFilter]);

  // Count items with low stock (< 10)
  const lowStockCount = useMemo(() => {
    return products.filter(p => p.stock < 10).length;
  }, [products]);

  // Count pending orders
  const pendingOrdersCount = useMemo(() => {
    return orders.filter(o => o.status === 'Pending').length;
  }, [orders]);

  return (
    <div id="admin-dashboard" className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Navigation Panel */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-600 text-white p-2 rounded-lg">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">Online Shopping</h1>
                <p className="text-xs text-slate-500 font-medium">Sistemang Pamamahala ng Negosyo</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 bg-slate-100 rounded-full">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span className="text-xs font-semibold text-slate-700">{currentUser.name} (Admin)</span>
              </div>
              <button
                id="admin-logout-btn"
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3.5 py-1.5 border border-slate-200 hover:border-red-200 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                Mag-logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 mb-8 overflow-x-auto whitespace-nowrap">
          <button
            id="tab-summary-btn"
            onClick={() => setActiveTab('summary')}
            className={`pb-4 px-6 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'summary'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Ulat sa Sales & Summary
          </button>
          <button
            id="tab-orders-btn"
            onClick={() => setActiveTab('orders')}
            className={`pb-4 px-6 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 relative ${
              activeTab === 'orders'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Truck className="w-4 h-4" />
            Pamahalaan ang mga Order
            {pendingOrdersCount > 0 && (
              <span className="absolute top-1 right-1 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {pendingOrdersCount}
              </span>
            )}
          </button>
          <button
            id="tab-inventory-btn"
            onClick={() => setActiveTab('inventory')}
            className={`pb-4 px-6 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'inventory'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            Imbentaryo ng Produkto
            {lowStockCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1">
                {lowStockCount} critical
              </span>
            )}
          </button>
        </div>

        {/* 1. SALES SUMMARY AND ANALYTICS TAB */}
        {activeTab === 'summary' && (
          <div className="space-y-8 animate-fade-in">
            {/* Custom Date Range Filter & Sales Analysis Panel */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl shadow-md text-white border border-slate-800">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-400" />
                    Suriin ang Benta ayon sa Petsa (Sales by Specific Date Range)
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">Pumili ng panimula at katapusang petsa para makita ang kabuuang kita at mga nabentang item.</p>
                </div>

                {/* Quick Date Shortcuts */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setDateFilterFrom('2026-06-26');
                      setDateFilterTo('2026-06-26');
                    }}
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-lg text-xs font-semibold transition"
                  >
                    Ngayong Araw (June 26)
                  </button>
                  <button
                    onClick={() => {
                      setDateFilterFrom('2026-06-20');
                      setDateFilterTo('2026-06-26');
                    }}
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-lg text-xs font-semibold transition"
                  >
                    Huling 7 Araw
                  </button>
                  <button
                    onClick={() => {
                      setDateFilterFrom('2026-06-01');
                      setDateFilterTo('2026-06-26');
                    }}
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-lg text-xs font-semibold transition"
                  >
                    Hunyo 2026
                  </button>
                  <button
                    onClick={() => {
                      setDateFilterFrom('');
                      setDateFilterTo('');
                    }}
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-lg text-xs font-semibold transition text-indigo-300"
                  >
                    I-clear (Ipakita Lahat)
                  </button>
                </div>
              </div>

              {/* Date Inputs & Summary Dashboard Card */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6 pt-6 border-t border-slate-800">
                
                {/* Date Selection Controls */}
                <div className="md:col-span-4 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Simulang Petsa (From Date)</label>
                    <input
                      type="date"
                      value={dateFilterFrom}
                      onChange={(e) => setDateFilterFrom(e.target.value)}
                      className="w-full bg-slate-900/80 border border-slate-700 text-white text-sm font-semibold rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Katapusang Petsa (To Date)</label>
                    <input
                      type="date"
                      value={dateFilterTo}
                      onChange={(e) => setDateFilterTo(e.target.value)}
                      className="w-full bg-slate-900/80 border border-slate-700 text-white text-sm font-semibold rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition cursor-pointer"
                    />
                  </div>

                  {/* Filter range label indicator */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
                    <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Kasalukuyang Saklaw (Selected Filter Range)</span>
                    <span className="text-xs font-medium text-slate-300">
                      {dateFilterFrom && dateFilterTo ? (
                        <>Mula <span className="text-indigo-400 font-semibold">{dateFilterFrom}</span> hanggang <span className="text-indigo-400 font-semibold">{dateFilterTo}</span></>
                      ) : dateFilterFrom ? (
                        <>Mula <span className="text-indigo-400 font-semibold">{dateFilterFrom}</span> hanggang sa kasalukuyan</>
                      ) : dateFilterTo ? (
                        <>Hanggang sa <span className="text-indigo-400 font-semibold">{dateFilterTo}</span></>
                      ) : (
                        <span className="text-amber-400 font-semibold">Ipinapakita ang lahat ng petsa (All-time data)</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Filter Output Box */}
                <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Performance Statistics Card */}
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider">Kabuuang Kita sa Saklaw na Ito</span>
                      <h4 className="text-3xl font-extrabold text-white mt-1">₱{customRangeSummary.amount.toLocaleString()}</h4>
                      <p className="text-xs text-slate-400 mt-2 font-medium">
                        Mayroong <span className="text-indigo-400 font-bold">{customRangeSummary.count} order</span> ang matagumpay na naihatid.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center">
                      <span className="text-[11px] text-slate-500">Katayuan: Delivered Only</span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Active
                      </span>
                    </div>
                  </div>

                  {/* Top Items Sold in Range Card */}
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider">Pinakabentang Produkto sa Saklaw na Ito</span>
                      
                      {customRangeSummary.topSellingItems.length > 0 ? (
                        <div className="space-y-2.5 mt-3">
                          {customRangeSummary.topSellingItems.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs">
                              <span className="text-slate-300 truncate max-w-[150px] font-medium">
                                {idx + 1}. {item.name}
                              </span>
                              <span className="text-slate-400 font-semibold text-[11px]">
                                {item.qty} pcs <span className="text-indigo-400">(₱{item.amount.toLocaleString()})</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center py-6 text-xs text-slate-500 italic">
                          Walang benta sa napiling saklaw ng petsa.
                        </div>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Daily Sales Card */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase mb-1">Benta Ngayong Araw (Daily)</p>
                  <h3 className="text-2xl font-bold text-slate-900">₱{summaries.daily.amount.toLocaleString()}</h3>
                  <p className="text-xs text-slate-500 mt-2 font-medium">
                    <span className="text-indigo-600 font-semibold">{summaries.daily.count} order</span> ang nakompleto
                  </p>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>

              {/* Weekly Sales Card */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase mb-1">Benta ngayong Linggo (Weekly)</p>
                  <h3 className="text-2xl font-bold text-slate-900">₱{summaries.weekly.amount.toLocaleString()}</h3>
                  <p className="text-xs text-slate-500 mt-2 font-medium">
                    <span className="text-indigo-600 font-semibold">{summaries.weekly.count} order</span> sa huling 7 araw
                  </p>
                </div>
                <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>

              {/* Monthly Sales Card */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase mb-1">Benta ngayong Buwan (Monthly)</p>
                  <h3 className="text-2xl font-bold text-slate-900">₱{summaries.monthly.amount.toLocaleString()}</h3>
                  <p className="text-xs text-slate-500 mt-2 font-medium">
                    <span className="text-indigo-600 font-semibold">{summaries.monthly.count} order</span> ngayong Hunyo
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <ShoppingBag className="w-6 h-6" />
                </div>
              </div>

              {/* Yearly Sales Card */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase mb-1">Benta ngayong Taon (Yearly)</p>
                  <h3 className="text-2xl font-bold text-slate-900">₱{summaries.yearly.amount.toLocaleString()}</h3>
                  <p className="text-xs text-slate-500 mt-2 font-medium">
                    <span className="text-indigo-600 font-semibold">{summaries.yearly.count} kabuuang benta</span> sa 2026
                  </p>
                </div>
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Sales Chart Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Visual Ulat sa Kita (Sales Trend Chart)</h3>
                  <p className="text-xs text-slate-500">I-visualize ang graphical breakdown ng inyong kabuuang benta</p>
                </div>
                
                {/* Sales Filter Period buttons */}
                <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
                  {(['daily', 'weekly', 'monthly', 'yearly'] as const).map(period => (
                    <button
                      key={period}
                      onClick={() => setSalesPeriod(period)}
                      className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-lg capitalize transition-all ${
                        salesPeriod === period
                          ? 'bg-white text-indigo-600 shadow-sm'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {period === 'daily' ? 'Arawan (Daily)' :
                       period === 'weekly' ? 'Lingguhan (Weekly)' :
                       period === 'monthly' ? 'Buwanan (Monthly)' : 'Taunan (Yearly)'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {salesPeriod === 'daily' ? (
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₱${val}`} />
                      <Tooltip formatter={(value) => [`₱${value.toLocaleString()}`, 'Benta']} />
                      <Legend />
                      <Bar dataKey="Benta (₱)" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : salesPeriod === 'weekly' ? (
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₱${val}`} />
                      <Tooltip formatter={(value) => [`₱${value.toLocaleString()}`, 'Benta']} />
                      <Legend />
                      <Line type="monotone" dataKey="Benta (₱)" stroke="#0d9488" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                    </LineChart>
                  ) : salesPeriod === 'yearly' ? (
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₱${val}`} />
                      <Tooltip formatter={(value) => [`₱${value.toLocaleString()}`, 'Benta']} />
                      <Legend />
                      <Bar dataKey="Benta (₱)" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={60} />
                    </BarChart>
                  ) : (
                    // Monthly Area Chart
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₱${val}`} />
                      <Tooltip formatter={(value) => [`₱${value.toLocaleString()}`, 'Benta']} />
                      <Legend />
                      <Area type="monotone" dataKey="Benta (₱)" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Insights List (Best Sellers & Order Status Overview) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Best Selling Products */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Mabilis Maubos & Sikat na Produkto
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-500 uppercase font-semibold">
                        <th className="py-3 px-2">Larawan & Pangalan</th>
                        <th className="py-3 px-2">Kategorya</th>
                        <th className="py-3 px-2">Presyo</th>
                        <th className="py-3 px-2 text-right">Natitirang Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-medium">
                      {products.slice(0, 5).map(prod => (
                        <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-2 flex items-center gap-3">
                            <img src={prod.image} alt={prod.name} className="w-9 h-9 rounded-lg object-cover" />
                            <span className="font-semibold text-slate-800 line-clamp-1">{prod.name}</span>
                          </td>
                          <td className="py-3 px-2 text-slate-500">{prod.category}</td>
                          <td className="py-3 px-2 text-slate-900 font-bold">₱{prod.price.toLocaleString()}</td>
                          <td className="py-3 px-2 text-right">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              prod.stock < 10
                                ? 'bg-red-50 text-red-600 border border-red-100'
                                : prod.stock < 20
                                ? 'bg-amber-50 text-amber-600 border border-amber-100'
                                : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            }`}>
                              {prod.stock} left
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Status Breakdown */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    Katayuan ng mga Order (Status)
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                          <Clock className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-semibold text-slate-700">Pending Orders</span>
                      </div>
                      <span className="text-lg font-bold text-amber-600">
                        {orders.filter(o => o.status === 'Pending').length}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-semibold text-slate-700">Delivered Orders</span>
                      </div>
                      <span className="text-lg font-bold text-emerald-600">
                        {orders.filter(o => o.status === 'Delivered').length}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-semibold text-slate-700">Cancelled Orders</span>
                      </div>
                      <span className="text-lg font-bold text-red-500">
                        {orders.filter(o => o.status === 'Cancelled').length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 text-center">
                  <button
                    id="summary-go-to-orders"
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 justify-center mx-auto"
                  >
                    I-update ang mga status sa Order Manager
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. ORDERS MANAGEMENT TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fade-in">
            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative w-full md:max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="order-search-input"
                  type="text"
                  placeholder="Maghanap ng Customer o ID ng Order..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  id="order-filter-status"
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="w-full md:w-auto text-sm border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="All">Lahat ng Status</option>
                  <option value="Pending">Pending Lamang</option>
                  <option value="Delivered">Delivered Lamang</option>
                  <option value="Cancelled">Cancelled Lamang</option>
                </select>
              </div>
            </div>

            {/* Orders List Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-200">
                      <th className="py-4 px-6">ID ng Order / Petsa</th>
                      <th className="py-4 px-6">Customer</th>
                      <th className="py-4 px-6">Mga Binili</th>
                      <th className="py-4 px-6">Bayarin & Payment</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-center">Aksyon (Update Status)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-medium">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-slate-500">
                          Walang nahanap na order.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map(order => (
                        <tr key={order.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-4 px-6">
                            <span className="font-mono text-xs font-bold text-indigo-600 block">{order.id}</span>
                            <span className="text-xs text-slate-500 mt-1 block">
                              {new Date(order.date).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-900 font-semibold">{order.userName}</td>
                          <td className="py-4 px-6">
                            <div className="max-w-xs space-y-1">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-xs text-slate-700">
                                  <span className="line-clamp-1 mr-2">{item.name}</span>
                                  <span className="text-slate-400 shrink-0 font-bold">x{item.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-bold text-slate-900 block">₱{order.totalAmount.toLocaleString()}</span>
                            <span className="text-xs text-slate-500 block font-normal">{order.paymentMethod}</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                              order.status === 'Pending'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : order.status === 'Delivered'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              {order.status === 'Pending' ? '⏳ Pending' : order.status === 'Delivered' ? '✅ Delivered' : '❌ Cancelled'}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex justify-center items-center gap-2">
                              {order.status === 'Pending' ? (
                                <>
                                  <button
                                    id={`deliver-order-${order.id}`}
                                    onClick={() => onUpdateOrderStatus(order.id, 'Delivered')}
                                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    I-deliver Na
                                  </button>
                                  <button
                                    id={`cancel-order-${order.id}`}
                                    onClick={() => onUpdateOrderStatus(order.id, 'Cancelled')}
                                    className="px-2.5 py-2 border border-slate-200 hover:border-red-200 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold transition"
                                  >
                                    I-cancel
                                  </button>
                                </>
                              ) : (
                                <span className="text-xs text-slate-400 font-normal italic flex items-center gap-1">
                                  Tapos na {order.status === 'Delivered' ? '(Naihatid)' : '(I-kinansela)'}
                                </span>
                              )}
                              <button
                                onClick={() => {
                                  requestConfirmation(
                                    'Burahin ang Order',
                                    `Sigurado ka bang nais mong burahin ang order na ${order.id}? Hindi na ito makikita sa listahan ng transaksyon.`,
                                    () => onDeleteOrder(order.id),
                                    true,
                                    'Oo, Burahin',
                                    'Huwag Muna'
                                  );
                                }}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition shrink-0"
                                title="Burahin ang Order na ito"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. PRODUCT INVENTORY MANAGEMENT TAB */}
        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-fade-in">
            {/* Inventory Controls bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4 items-center w-full md:max-w-2xl">
                <div className="relative w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="inventory-search-input"
                    type="text"
                    placeholder="Maghanap ng pangalan o kategorya ng produkto..."
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
                  <Layers className="w-4 h-4 text-slate-400" />
                  <select
                    id="inventory-filter-category"
                    value={inventoryCategoryFilter}
                    onChange={(e) => setInventoryCategoryFilter(e.target.value)}
                    className="w-full sm:w-auto text-sm border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="All">Lahat ng Kategorya</option>
                    <option value="Gadgets & Tech">Gadgets & Tech</option>
                    <option value="Apparel & Fashion">Apparel & Fashion</option>
                    <option value="Home & Living">Home & Living</option>
                    <option value="Cosmetics & Beauty">Cosmetics & Beauty</option>
                  </select>
                </div>
              </div>

              <button
                id="add-product-modal-btn"
                onClick={() => setShowAddModal(true)}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition duration-200"
              >
                <Plus className="w-4 h-4" />
                Magdagdag ng Produkto
              </button>
            </div>

            {/* Low stock alert */}
            {lowStockCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-xs font-semibold">
                  Babala: Mayroon kayong <span className="underline font-bold">{lowStockCount} item</span> na kritikal ang stock (mas mababa sa 10 piraso). Mangyaring dagdagan ang stock.
                </p>
              </div>
            )}

            {/* Inventory Product Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(prod => (
                <div key={prod.id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between">
                  <div className="relative">
                    <img src={prod.image} alt={prod.name} className="w-full h-48 object-cover" />
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                      {prod.category}
                    </span>
                    {prod.stock < 10 && (
                      <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm uppercase tracking-wider animate-pulse">
                        Low Stock
                      </span>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base line-clamp-1">{prod.name}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">{prod.description}</p>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <div>
                        <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Presyo</span>
                        <span className="text-lg font-bold text-slate-950 font-sans">₱{prod.price.toLocaleString()}</span>
                      </div>
                      
                      {/* Manage Stock input */}
                      <div className="text-right">
                        <label className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider mb-1">Stock Level</label>
                        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1">
                          <input
                            id={`stock-input-${prod.id}`}
                            type="number"
                            min="0"
                            value={prod.stock}
                            onChange={(e) => onUpdateStock(prod.id, parseInt(e.target.value) || 0)}
                            className="w-12 text-center bg-transparent border-none text-sm font-bold text-slate-800 focus:outline-none"
                          />
                          <span className="text-[10px] text-slate-500 font-bold pr-1">pcs</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Edit and Delete actions row */}
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        id={`edit-btn-${prod.id}`}
                        onClick={() => handleOpenEditModal(prod)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 rounded-lg text-xs font-bold text-indigo-600 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        I-edit Item
                      </button>
                      <button
                        type="button"
                        id={`delete-btn-${prod.id}`}
                        onClick={() => handleDeleteProductClick(prod.id, prod.name)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 border border-slate-200 hover:border-red-300 hover:bg-red-50/50 rounded-lg text-xs font-bold text-red-600 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        I-delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. ADD PRODUCT MODAL */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 animate-slide-up">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-600" />
                  Magdagdag ng Bagong Produkto
                </h3>
                <button
                  id="close-add-product-modal"
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-lg"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleAddProductSubmit} className="p-6 space-y-4">
                <div>
                  <label htmlFor="prod-name" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Pangalan ng Item / Produkto
                  </label>
                  <input
                    id="prod-name"
                    type="text"
                    required
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder="Hal. Ultimate Bass Waterproof Speaker"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="prod-price" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Presyo (₱ PHP)
                    </label>
                    <input
                      id="prod-price"
                      type="number"
                      required
                      min="1"
                      value={newProductPrice}
                      onChange={(e) => setNewProductPrice(e.target.value)}
                      placeholder="Hal. 2500"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="prod-stock" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Stock / Bilang
                    </label>
                    <input
                      id="prod-stock"
                      type="number"
                      required
                      min="0"
                      value={newProductStock}
                      onChange={(e) => setNewProductStock(e.target.value)}
                      placeholder="Hal. 50"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="prod-category" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Kategorya
                    </label>
                    <select
                      id="prod-category"
                      value={newProductCategory}
                      onChange={(e) => setNewProductCategory(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Gadgets & Tech">Gadgets & Tech</option>
                      <option value="Apparel & Fashion">Apparel & Fashion</option>
                      <option value="Home & Living">Home & Living</option>
                      <option value="Cosmetics & Beauty">Cosmetics & Beauty</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="prod-image" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Larawan / Image URL
                    </label>
                    <input
                      id="prod-image"
                      type="text"
                      value={newProductImage}
                      onChange={(e) => setNewProductImage(e.target.value)}
                      placeholder="Opsyonal (o mamili sa ibaba)"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    📁 O Mag-upload ng Sariling Larawan (Upload Image)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, false)}
                      className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer w-full"
                    />
                    {newProductImage && (
                      <div className="shrink-0 relative">
                        <img src={newProductImage} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-slate-200" />
                        <button
                          type="button"
                          onClick={() => setNewProductImage('')}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 text-[9px] flex items-center justify-center shadow-sm font-bold hover:bg-red-600"
                          title="Tanggalin"
                        >
                          &times;
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick preset images */}
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Mabilisang Larawan Presets (I-click para Piliin):
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {IMAGE_PRESETS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setNewProductImage(p.url)}
                        className={`border rounded-lg overflow-hidden p-0.5 hover:border-indigo-600 transition ${
                          newProductImage === p.url ? 'border-2 border-indigo-600 ring-2 ring-indigo-100' : 'border-slate-200'
                        }`}
                      >
                        <img src={p.url} alt={p.name} className="w-full h-10 object-cover rounded-md" />
                        <span className="text-[10px] text-slate-500 font-semibold block text-center truncate mt-0.5">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="prod-desc" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Deskripsyon ng Item
                  </label>
                  <textarea
                    id="prod-desc"
                    rows={3}
                    value={newProductDescription}
                    onChange={(e) => setNewProductDescription(e.target.value)}
                    placeholder="Isulat ang detalye o deskripsyon ng produkto dito..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  ></textarea>
                </div>

                <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
                  <button
                    id="cancel-add-product-btn"
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg"
                  >
                    Kanselahin
                  </button>
                  <button
                    id="submit-add-product-btn"
                    type="submit"
                    className="px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
                  >
                    I-save ang Produkto
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 5. EDIT PRODUCT MODAL */}
        {showEditModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 animate-slide-up">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-indigo-600" />
                  I-edit ang Produkto
                </h3>
                <button
                  id="close-edit-product-modal"
                  onClick={() => setShowEditModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-lg"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleEditProductSubmit} className="p-6 space-y-4">
                <div>
                  <label htmlFor="edit-prod-name" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Pangalan ng Item / Produkto
                  </label>
                  <input
                    id="edit-prod-name"
                    type="text"
                    required
                    value={editProductName}
                    onChange={(e) => setEditProductName(e.target.value)}
                    placeholder="Hal. Ultimate Bass Waterproof Speaker"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-prod-price" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Presyo (₱ PHP)
                    </label>
                    <input
                      id="edit-prod-price"
                      type="number"
                      required
                      min="1"
                      value={editProductPrice}
                      onChange={(e) => setEditProductPrice(e.target.value)}
                      placeholder="Hal. 2500"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-prod-stock" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Stock / Bilang
                    </label>
                    <input
                      id="edit-prod-stock"
                      type="number"
                      required
                      min="0"
                      value={editProductStock}
                      onChange={(e) => setEditProductStock(e.target.value)}
                      placeholder="Hal. 50"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-prod-category" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Kategorya
                    </label>
                    <select
                      id="edit-prod-category"
                      value={editProductCategory}
                      onChange={(e) => setEditProductCategory(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Gadgets & Tech">Gadgets & Tech</option>
                      <option value="Apparel & Fashion">Apparel & Fashion</option>
                      <option value="Home & Living">Home & Living</option>
                      <option value="Cosmetics & Beauty">Cosmetics & Beauty</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="edit-prod-image" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Larawan / Image URL
                    </label>
                    <input
                      id="edit-prod-image"
                      type="text"
                      value={editProductImage}
                      onChange={(e) => setEditProductImage(e.target.value)}
                      placeholder="Opsyonal (o mamili sa ibaba)"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    📁 O Mag-upload ng Sariling Larawan (Upload Image)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, true)}
                      className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer w-full"
                    />
                    {editProductImage && (
                      <div className="shrink-0 relative">
                        <img src={editProductImage} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-slate-200" />
                        <button
                          type="button"
                          onClick={() => setEditProductImage('')}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 text-[9px] flex items-center justify-center shadow-sm font-bold hover:bg-red-600"
                          title="Tanggalin"
                        >
                          &times;
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick preset images */}
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Mabilisang Larawan Presets (I-click para Piliin):
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {IMAGE_PRESETS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setEditProductImage(p.url)}
                        className={`border rounded-lg overflow-hidden p-0.5 hover:border-indigo-600 transition ${
                          editProductImage === p.url ? 'border-2 border-indigo-600 ring-2 ring-indigo-100' : 'border-slate-200'
                        }`}
                      >
                        <img src={p.url} alt={p.name} className="w-full h-10 object-cover rounded-md" />
                        <span className="text-[10px] text-slate-500 font-semibold block text-center truncate mt-0.5">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="edit-prod-desc" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Deskripsyon ng Item
                  </label>
                  <textarea
                    id="edit-prod-desc"
                    rows={3}
                    value={editProductDescription}
                    onChange={(e) => setEditProductDescription(e.target.value)}
                    placeholder="Isulat ang detalye o deskripsyon ng produkto dito..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  ></textarea>
                </div>

                <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
                  <button
                    id="cancel-edit-product-btn"
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg"
                  >
                    Kanselahin
                  </button>
                  <button
                    id="submit-edit-product-btn"
                    type="submit"
                    className="px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
                  >
                    I-save ang Pagbabago
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Custom Confirmation Dialog Modal */}
        {confirmDialog?.isOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-100 animate-slide-up p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl shrink-0 ${confirmDialog.isDanger ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">{confirmDialog.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{confirmDialog.message}</p>
                </div>
              </div>

              <div className="flex gap-2.5 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmDialog(null)}
                  className="px-4 py-2 text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition"
                >
                  {confirmDialog.cancelText || 'Kanselahin'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    confirmDialog.onConfirm();
                  }}
                  className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition ${
                    confirmDialog.isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {confirmDialog.confirmText || 'Kumpirmahin'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
