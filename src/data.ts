import { Product, Order, User } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'AeroSound Pro Wireless Headphones',
    description: 'Immersive sound quality with industry-leading hybrid active noise cancellation, 40-hour battery life, and ultra-comfortable memory foam earcups.',
    price: 4999,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
    category: 'Gadgets & Tech'
  },
  {
    id: 'p2',
    name: 'Chronos Smartwatch Fit v2',
    description: 'Sleek fitness tracker with 24/7 heart rate monitoring, built-in GPS, sleep quality score, oxygen saturation (SpO2) level tracking, and up to 10 days of battery.',
    price: 3200,
    stock: 18,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80',
    category: 'Gadgets & Tech'
  },
  {
    id: 'p3',
    name: 'Heritage Explorer Waterproof Backpack',
    description: 'Heavy-duty 1000D water-resistant canvas backpack with a 15.6-inch padded laptop sleeve, multiple organizer pockets, and genuine leather strap details.',
    price: 2450,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=80',
    category: 'Apparel & Fashion'
  },
  {
    id: 'p4',
    name: 'Velocity Swiftknit Running Shoes',
    description: 'Featherlight breathable knit running shoes with premium high-rebound cushioning, responsive performance plate, and durable grip outsoles.',
    price: 3890,
    stock: 15,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80',
    category: 'Apparel & Fashion'
  },
  {
    id: 'p5',
    name: 'AromaTherapy Organic Scented Candle',
    description: 'Hand-poured 100% natural soy wax candle infused with lavender, sandalwood, and chamomile essential oils. Clean burn for over 50 hours of relaxation.',
    price: 750,
    stock: 45,
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=500&auto=format&fit=crop&q=80',
    category: 'Home & Living'
  },
  {
    id: 'p6',
    name: 'Nordic Minimalist Timber Desk Lamp',
    description: 'Architectural table lamp with solid natural oak wood accents, fully adjustable pivoting neck, and an energy-efficient warm-glowing LED bulb included.',
    price: 1890,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=80',
    category: 'Home & Living'
  },
  {
    id: 'p7',
    name: 'HydraGlow Vitamin C Face Serum',
    description: 'Intense hydrating and brightening face serum formulated with pure 15% Vitamin C, hyaluronic acid, and vitamin E to restore radiant, youthful-looking skin.',
    price: 1250,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=80',
    category: 'Cosmetics & Beauty'
  }
];

export const DEFAULT_USERS: User[] = [
  {
    id: 'u1',
    email: 'clarkjustin_algarme@smccnasipit.edu.ph',
    name: 'Clark Justin Algarme',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    phone: '09123456789',
    address: 'SMCC, Nasipit, Agusan del Norte, Philippines',
    joinedDate: '2026-01-15',
    password: 'password123'
  },
  {
    id: 'adminclark',
    email: 'adminclark',
    name: 'Clark Admin',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    phone: '09998887776',
    address: 'Nasipit, Agusan del Norte, Philippines',
    joinedDate: '2026-06-26',
    password: 'admin@2026-2027'
  },
  {
    id: 'u2',
    email: 'admin@tindahan.com',
    name: 'Admin Boss',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    phone: '09998887776',
    address: 'Main Corporate Office, Manila, Philippines',
    joinedDate: '2025-01-01',
    password: 'password123'
  }
];

// Helper to generate a date relative to 2026-06-26
function getRelativeDateStr(daysAgo: number, hoursAgo = 12): string {
  const baseDate = new Date('2026-06-26T12:00:00');
  baseDate.setDate(baseDate.getDate() - daysAgo);
  baseDate.setHours(baseDate.getHours() - hoursAgo);
  return baseDate.toISOString();
}

export const INITIAL_ORDERS: Order[] = [
  // Deliberately spreading orders to build a convincing chart of daily, weekly, monthly, and yearly sales
  
  // Year 2025 (to show yearly compare)
  {
    id: 'ord-2025-1',
    userId: 'u1',
    userName: 'Clark Justin Algarme',
    items: [
      { productId: 'p1', name: 'AeroSound Pro Wireless Headphones', price: 4999, quantity: 2, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150' }
    ],
    totalAmount: 9998,
    status: 'Delivered',
    date: '2025-10-15T14:30:00.000Z',
    paymentMethod: 'GCash'
  },
  {
    id: 'ord-2025-2',
    userId: 'u3',
    userName: 'Juan Dela Cruz',
    items: [
      { productId: 'p3', name: 'Heritage Explorer Waterproof Backpack', price: 2450, quantity: 1, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=150' },
      { productId: 'p5', name: 'AromaTherapy Organic Scented Candle', price: 750, quantity: 2, image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=150' }
    ],
    totalAmount: 3950,
    status: 'Delivered',
    date: '2025-12-20T10:15:00.000Z',
    paymentMethod: 'Bank Transfer'
  },

  // 2026, Months: Jan - June
  // Jan 2026
  {
    id: 'ord-jan-1',
    userId: 'u4',
    userName: 'Maria Clara',
    items: [
      { productId: 'p2', name: 'Chronos Smartwatch Fit v2', price: 3200, quantity: 1, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150' }
    ],
    totalAmount: 3200,
    status: 'Delivered',
    date: '2026-01-20T11:00:00.000Z',
    paymentMethod: 'Cash on Delivery'
  },
  // Feb 2026
  {
    id: 'ord-feb-1',
    userId: 'u1',
    userName: 'Clark Justin Algarme',
    items: [
      { productId: 'p6', name: 'Nordic Minimalist Timber Desk Lamp', price: 1890, quantity: 1, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=150' },
      { productId: 'p7', name: 'HydraGlow Vitamin C Face Serum', price: 1250, quantity: 2, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=150' }
    ],
    totalAmount: 4390,
    status: 'Delivered',
    date: '2026-02-14T18:45:00.000Z',
    paymentMethod: 'GCash'
  },
  // Mar 2026
  {
    id: 'ord-mar-1',
    userId: 'u5',
    userName: 'Jose Rizal',
    items: [
      { productId: 'p1', name: 'AeroSound Pro Wireless Headphones', price: 4999, quantity: 1, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150' },
      { productId: 'p4', name: 'Velocity Swiftknit Running Shoes', price: 3890, quantity: 1, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150' }
    ],
    totalAmount: 8889,
    status: 'Delivered',
    date: '2026-03-10T09:15:00.000Z',
    paymentMethod: 'Bank Transfer'
  },
  // Apr 2026
  {
    id: 'ord-apr-1',
    userId: 'u4',
    userName: 'Maria Clara',
    items: [
      { productId: 'p3', name: 'Heritage Explorer Waterproof Backpack', price: 2450, quantity: 2, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=150' }
    ],
    totalAmount: 4900,
    status: 'Delivered',
    date: '2026-04-18T15:20:00.000Z',
    paymentMethod: 'Cash on Delivery'
  },
  // May 2026
  {
    id: 'ord-may-1',
    userId: 'u1',
    userName: 'Clark Justin Algarme',
    items: [
      { productId: 'p2', name: 'Chronos Smartwatch Fit v2', price: 3200, quantity: 2, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150' },
      { productId: 'p7', name: 'HydraGlow Vitamin C Face Serum', price: 1250, quantity: 1, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=150' }
    ],
    totalAmount: 7650,
    status: 'Delivered',
    date: '2026-05-25T13:40:00.000Z',
    paymentMethod: 'GCash'
  },

  // June 2026 (Current Month)
  // Weeks 1-3 of June
  {
    id: 'ord-jun-w1',
    userId: 'u3',
    userName: 'Juan Dela Cruz',
    items: [
      { productId: 'p4', name: 'Velocity Swiftknit Running Shoes', price: 3890, quantity: 2, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150' }
    ],
    totalAmount: 7780,
    status: 'Delivered',
    date: getRelativeDateStr(20, 4), // ~June 6
    paymentMethod: 'GCash'
  },
  {
    id: 'ord-jun-w2',
    userId: 'u5',
    userName: 'Jose Rizal',
    items: [
      { productId: 'p1', name: 'AeroSound Pro Wireless Headphones', price: 4999, quantity: 1, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150' },
      { productId: 'p5', name: 'AromaTherapy Organic Scented Candle', price: 750, quantity: 4, image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=150' }
    ],
    totalAmount: 7999,
    status: 'Delivered',
    date: getRelativeDateStr(14, 2), // ~June 12
    paymentMethod: 'Bank Transfer'
  },
  {
    id: 'ord-jun-w3',
    userId: 'u4',
    userName: 'Maria Clara',
    items: [
      { productId: 'p6', name: 'Nordic Minimalist Timber Desk Lamp', price: 1890, quantity: 2, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=150' },
      { productId: 'p7', name: 'HydraGlow Vitamin C Face Serum', price: 1250, quantity: 3, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=150' }
    ],
    totalAmount: 7530,
    status: 'Delivered',
    date: getRelativeDateStr(8, 6), // ~June 18
    paymentMethod: 'Cash on Delivery'
  },

  // Daily orders in the last week (June 19 to June 26)
  {
    id: 'ord-day-5',
    userId: 'u1',
    userName: 'Clark Justin Algarme',
    items: [
      { productId: 'p3', name: 'Heritage Explorer Waterproof Backpack', price: 2450, quantity: 1, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=150' }
    ],
    totalAmount: 2450,
    status: 'Delivered',
    date: getRelativeDateStr(5, 3), // June 21
    paymentMethod: 'GCash'
  },
  {
    id: 'ord-day-4',
    userId: 'u3',
    userName: 'Juan Dela Cruz',
    items: [
      { productId: 'p2', name: 'Chronos Smartwatch Fit v2', price: 3200, quantity: 1, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150' },
      { productId: 'p5', name: 'AromaTherapy Organic Scented Candle', price: 750, quantity: 1, image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=150' }
    ],
    totalAmount: 3950,
    status: 'Delivered',
    date: getRelativeDateStr(4, 5), // June 22
    paymentMethod: 'Cash on Delivery'
  },
  {
    id: 'ord-day-3',
    userId: 'u4',
    userName: 'Maria Clara',
    items: [
      { productId: 'p7', name: 'HydraGlow Vitamin C Face Serum', price: 1250, quantity: 2, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=150' }
    ],
    totalAmount: 2500,
    status: 'Delivered',
    date: getRelativeDateStr(3, 1), // June 23
    paymentMethod: 'GCash'
  },
  {
    id: 'ord-day-2',
    userId: 'u1',
    userName: 'Clark Justin Algarme',
    items: [
      { productId: 'p1', name: 'AeroSound Pro Wireless Headphones', price: 4999, quantity: 1, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150' }
    ],
    totalAmount: 4999,
    status: 'Pending',
    date: getRelativeDateStr(2, 4), // June 24
    paymentMethod: 'GCash'
  },
  {
    id: 'ord-day-1',
    userId: 'u5',
    userName: 'Jose Rizal',
    items: [
      { productId: 'p4', name: 'Velocity Swiftknit Running Shoes', price: 3890, quantity: 1, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150' },
      { productId: 'p5', name: 'AromaTherapy Organic Scented Candle', price: 750, quantity: 2, image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=150' }
    ],
    totalAmount: 5390,
    status: 'Pending',
    date: getRelativeDateStr(1, 2), // June 25
    paymentMethod: 'Bank Transfer'
  },
  {
    id: 'ord-today-1',
    userId: 'u1',
    userName: 'Clark Justin Algarme',
    items: [
      { productId: 'p2', name: 'Chronos Smartwatch Fit v2', price: 3200, quantity: 1, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150' }
    ],
    totalAmount: 3200,
    status: 'Pending',
    date: getRelativeDateStr(0, 1), // June 26 (Today)
    paymentMethod: 'GCash'
  }
];
