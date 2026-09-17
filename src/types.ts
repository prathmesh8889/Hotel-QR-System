export type UserRole = 'admin' | 'kitchen' | null;

export interface AuthState {
  isLoggedIn: boolean;
  role: UserRole;
  username: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  available: boolean;
}

export type TableStatus = 'available' | 'occupied' | 'dirty' | 'reserved';

export interface Table {
  id: string;
  number: number;
  qrCode: string;
  status: TableStatus;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'paid';

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Order {
  id: string;
  tableNumber: number;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  timestamp: number;
  customerNote?: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface HotelSettings {
  name: string;
  address: string;
  phone: string;
  currency: string;
  taxRate: number;
}
