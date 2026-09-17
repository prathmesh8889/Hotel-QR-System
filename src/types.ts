export type UserRole = 'admin' | 'kitchen';

export interface AuthState {
  isLoggedIn: boolean;
  role: UserRole | null;
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

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled';

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

export interface HotelSettings {
  name: string;
  address: string;
  phone: string;
  currency: string;
  taxRate: number;
}
