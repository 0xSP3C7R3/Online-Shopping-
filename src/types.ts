export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  avatar: string;
  phone: string;
  address: string;
  joinedDate: string;
  password?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'Pending' | 'Delivered' | 'Cancelled';
  date: string; // ISO string format
  paymentMethod: string;
}

export interface Transaction {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  amount: number;
  date: string;
  status: 'Completed' | 'Pending';
}
