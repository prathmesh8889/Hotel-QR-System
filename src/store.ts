import { MenuItem, Table, TableStatus, Order, OrderStatus, HotelSettings } from './types';

const STORAGE_KEYS = {
  MENU: 'hotel_menu_v2',
  TABLES: 'hotel_tables_v2',
  ORDERS: 'hotel_orders_v2',
  SETTINGS: 'hotel_settings_v2',
};

// Default menu items with more variety
const defaultMenuItems: MenuItem[] = [
  { id: '1', name: 'Classic Burger', description: 'Juicy beef patty with lettuce, tomato, and special sauce', price: 12.99, category: 'Main Course', imageUrl: '🍔', available: true },
  { id: '2', name: 'Caesar Salad', description: 'Fresh romaine lettuce with parmesan and croutons', price: 8.99, category: 'Starters', imageUrl: '🥗', available: true },
  { id: '3', name: 'Margherita Pizza', description: 'Classic pizza with mozzarella, tomato, and basil', price: 14.99, category: 'Main Course', imageUrl: '🍕', available: true },
  { id: '4', name: 'Grilled Salmon', description: 'Fresh Atlantic salmon with lemon butter sauce', price: 22.99, category: 'Main Course', imageUrl: '🐟', available: true },
  { id: '5', name: 'French Fries', description: 'Crispy golden fries with sea salt', price: 5.99, category: 'Sides', imageUrl: '🍟', available: true },
  { id: '6', name: 'Chicken Wings', description: 'Spicy buffalo wings with ranch dip', price: 10.99, category: 'Starters', imageUrl: '🍗', available: true },
  { id: '7', name: 'Chocolate Cake', description: 'Rich dark chocolate layer cake', price: 7.99, category: 'Desserts', imageUrl: '🍰', available: true },
  { id: '8', name: 'Fresh Lemonade', description: 'Hand-squeezed lemonade with mint', price: 4.99, category: 'Beverages', imageUrl: '🍋', available: true },
  { id: '9', name: 'Iced Coffee', description: 'Cold brew coffee with cream', price: 5.49, category: 'Beverages', imageUrl: '☕', available: true },
  { id: '10', name: 'Pasta Carbonara', description: 'Creamy pasta with bacon and parmesan', price: 15.99, category: 'Main Course', imageUrl: '🍝', available: true },
  { id: '11', name: 'Mushroom Soup', description: 'Creamy wild mushroom soup with herbs', price: 6.99, category: 'Starters', imageUrl: '🍄', available: true },
  { id: '12', name: 'Tiramisu', description: 'Classic Italian coffee-flavored dessert', price: 8.99, category: 'Desserts', imageUrl: '🍮', available: true },
  { id: '13', name: 'Mojito', description: 'Classic Cuban cocktail with fresh mint', price: 9.99, category: 'Beverages', imageUrl: '🍸', available: true },
  { id: '14', name: 'Bruschetta', description: 'Toasted bread with tomatoes, garlic, and basil', price: 7.99, category: 'Starters', imageUrl: '🥖', available: true },
  { id: '15', name: 'Onion Rings', description: 'Crispy battered onion rings with dipping sauce', price: 6.49, category: 'Sides', imageUrl: '🧅', available: true },
  { id: '16', name: 'Ice Cream Sundae', description: 'Three scoops with chocolate sauce and whipped cream', price: 6.99, category: 'Desserts', imageUrl: '🍨', available: true },
];

const defaultTables: Table[] = Array.from({ length: 10 }, (_, i) => ({
  id: `table-${i + 1}`,
  number: i + 1,
  qrCode: `table-${i + 1}`,
  status: 'available' as TableStatus,
}));

const defaultSettings: HotelSettings = {
  name: 'The Grand Kitchen',
  address: '123 Culinary Street, Food District',
  phone: '+1 (555) 123-4567',
  currency: '$',
  taxRate: 10,
};

function initializeData() {
  if (!localStorage.getItem(STORAGE_KEYS.MENU)) {
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(defaultMenuItems));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TABLES)) {
    localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(defaultTables));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
  }
}

initializeData();

// ============ MENU OPERATIONS ============
export function getMenuItems(): MenuItem[] {
  const data = localStorage.getItem(STORAGE_KEYS.MENU);
  return data ? JSON.parse(data) : [];
}

export function addMenuItem(item: Omit<MenuItem, 'id'>): MenuItem {
  const items = getMenuItems();
  const newItem: MenuItem = { ...item, id: Date.now().toString() };
  items.push(newItem);
  localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(items));
  notifyListeners();
  return newItem;
}

export function updateMenuItem(id: string, updates: Partial<MenuItem>): MenuItem | null {
  const items = getMenuItems();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;
  items[index] = { ...items[index], ...updates };
  localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(items));
  notifyListeners();
  return items[index];
}

export function deleteMenuItem(id: string): boolean {
  const items = getMenuItems();
  const filtered = items.filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(filtered));
  notifyListeners();
  return filtered.length < items.length;
}

export function toggleMenuItemAvailability(id: string): MenuItem | null {
  const items = getMenuItems();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;
  items[index].available = !items[index].available;
  localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(items));
  notifyListeners();
  return items[index];
}

// ============ TABLE OPERATIONS ============
export function getTables(): Table[] {
  const data = localStorage.getItem(STORAGE_KEYS.TABLES);
  return data ? JSON.parse(data) : [];
}

export function addTable(number: number): Table {
  const tables = getTables();
  const newTable: Table = {
    id: `table-${Date.now()}`,
    number,
    qrCode: `table-${number}`,
    status: 'available',
  };
  tables.push(newTable);
  localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
  notifyListeners();
  return newTable;
}

export function deleteTable(id: string): boolean {
  const tables = getTables();
  const filtered = tables.filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(filtered));
  notifyListeners();
  return filtered.length < tables.length;
}

export function updateTableStatus(id: string, status: TableStatus): Table | null {
  const tables = getTables();
  const index = tables.findIndex((t) => t.id === id);
  if (index === -1) return null;
  tables[index].status = status;
  localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
  notifyListeners();
  return tables[index];
}

// ============ ORDER OPERATIONS ============
export function getOrders(): Order[] {
  const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
  return data ? JSON.parse(data) : [];
}

export function getActiveOrders(): Order[] {
  return getOrders().filter((o) => ['pending', 'preparing', 'ready'].includes(o.status));
}

export function placeOrder(tableNumber: number, items: Order['items'], totalAmount: number, customerNote?: string): Order {
  const orders = getOrders();
  const newOrder: Order = {
    id: `ORD-${Date.now()}`,
    tableNumber,
    items,
    totalAmount,
    status: 'pending',
    timestamp: Date.now(),
    customerNote,
  };
  orders.unshift(newOrder);
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  
  // Update table status
  const tables = getTables();
  const tableIndex = tables.findIndex((t) => t.number === tableNumber);
  if (tableIndex !== -1) {
    tables[tableIndex].status = 'occupied';
    localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
  }
  
  notifyListeners();
  return newOrder;
}

export function updateOrderStatus(orderId: string, status: OrderStatus): Order | null {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index === -1) return null;
  orders[index].status = status;
  
  // If order is paid/served, free up the table
  if (status === 'paid') {
    const order = orders[index];
    const tables = getTables();
    const tableIndex = tables.findIndex((t) => t.number === order.tableNumber);
    if (tableIndex !== -1) {
      tables[tableIndex].status = 'dirty';
      localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
    }
  }
  
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  notifyListeners();
  return orders[index];
}

// ============ SETTINGS ============
export function getSettings(): HotelSettings {
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return data ? JSON.parse(data) : defaultSettings;
}

export function updateSettings(settings: Partial<HotelSettings>): HotelSettings {
  const current = getSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  return updated;
}

// ============ DASHBOARD STATS ============
export function getDashboardStats() {
  const orders = getOrders();
  const tables = getTables();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayOrders = orders.filter((o) => o.timestamp >= today.getTime());
  const activeOrders = orders.filter((o) => ['pending', 'preparing', 'ready'].includes(o.status));
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const occupiedTables = tables.filter((t) => t.status === 'occupied').length;
  
  return {
    totalOrders: todayOrders.length,
    activeOrders: activeOrders.length,
    todayRevenue,
    occupiedTables,
    totalTables: tables.length,
    pendingOrders: orders.filter((o) => o.status === 'pending').length,
  };
}

// ============ CATEGORIES ============
export function getCategories(): string[] {
  const items = getMenuItems();
  const categories = [...new Set(items.map((item) => item.category))];
  return categories.sort();
}

// ============ EVENT SYSTEM (Simulates Socket.io) ============
type Listener = () => void;
const listeners: Set<Listener> = new Set();

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

export function notify(): void {
  notifyListeners();
}
