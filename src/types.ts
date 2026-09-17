export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  available: boolean;
}

export interface Table {
  id: string;
  number: number;
  qrCode: string;
  status: 'available' | 'occupied';
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
