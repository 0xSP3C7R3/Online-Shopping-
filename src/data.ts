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

export const INITIAL_ORDERS: Order[] = [];
