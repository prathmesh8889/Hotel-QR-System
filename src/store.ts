import { MenuItem, Table, TableStatus, Order, OrderStatus, HotelSettings, Staff, UserRole } from './types';

const STORAGE_KEYS = {
  MENU: 'hotel_menu_v3',
  TABLES: 'hotel_tables_v3',
  ORDERS: 'hotel_orders_v3',
  SETTINGS: 'hotel_settings_v3',
  STAFF: 'hotel_staff_v3',
};

const defaultMenuItems: MenuItem[] = [
  { id: '1', name: 'Classic Burger', description: 'Juicy beef patty with lettuce, tomato, and special sauce', price: 249, category: 'Main Course', imageUrl: '🍔', available: true },
  { id: '2', name: 'Caesar Salad', description: 'Fresh romaine lettuce with parmesan and croutons', price: 189, category: 'Starters', imageUrl: '🥗', available: true },
  { id: '3', name: 'Margherita Pizza', description: 'Classic pizza with mozzarella, tomato, and basil', price: 349, category: 'Main Course', imageUrl: '🍕', available: true },
  { id: '4', name: 'Grilled Salmon', description: 'Fresh Atlantic salmon with lemon butter sauce', price: 599, category: 'Main Course', imageUrl: '🐟', available: true },
  { id: '5', name: 'French Fries', description: 'Crispy golden fries with sea salt', price: 149, category: 'Sides', imageUrl: '🍟', available: true },
  { id: '6', name: 'Chicken Wings', description: 'Spicy buffalo wings with ranch dip', price: 299, category: 'Starters', imageUrl: '🍗', available: true },
  { id: '7', name: 'Chocolate Cake', description: 'Rich dark chocolate layer cake', price: 199, category: 'Desserts', imageUrl: '🍰', available: true },
  { id: '8', name: 'Fresh Lemonade', description: 'Hand-squeezed lemonade with mint', price: 129, category: 'Beverages', imageUrl: '🍋', available: true },
  { id: '9', name: 'Iced Coffee', description: 'Cold brew coffee with cream', price: 149, category: 'Beverages', imageUrl: '☕', available: true },
  { id: '10', name: 'Pasta Carbonara', description: 'Creamy pasta with bacon and parmesan', price: 399, category: 'Main Course', imageUrl: '🍝', available: true },
  { id: '11', name: 'Mushroom Soup', description: 'Creamy wild mushroom soup with herbs', price: 179, category: 'Starters', imageUrl: '🍄', available: true },
  { id: '12', name: 'Tiramisu', description: 'Classic Italian coffee-flavored dessert', price: 249, category: 'Desserts', imageUrl: '🍮', available: true },
  { id: '13', name: 'Mojito', description: 'Classic Cuban cocktail with fresh mint', price: 279, category: 'Beverages', imageUrl: '🍸', available: true },
  { id: '14', name: 'Bruschetta', description: 'Toasted bread with tomatoes, garlic, and basil', price: 199, category: 'Starters', imageUrl: '🥖', available: true },
  { id: '15', name: 'Onion Rings', description: 'Crispy battered onion rings with dipping sauce', price: 169, category: 'Sides', imageUrl: '🧅', available: true },
  { id: '16', name: 'Ice Cream Sundae', description: 'Three scoops with chocolate sauce and whipped cream', price: 199, category: 'Desserts', imageUrl: '🍨', available: true },
];

const defaultTables: Table[] = Array.from({ length: 10 }, (_, i) => ({
  id: `table-${i + 1}`, number: i + 1, qrCode: `table-${i + 1}`, status: 'available' as TableStatus,
}));

const defaultSettings: HotelSettings = {
  name: 'The Grand Kitchen', address: '123 Culinary Street, Food District',
  phone: '+1 (555) 123-4567', currency: '₹', taxRate: 18,
};

function initializeData() {
  if (!localStorage.getItem(STORAGE_KEYS.MENU)) localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(defaultMenuItems));
  if (!localStorage.getItem(STORAGE_KEYS.TABLES)) localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(defaultTables));
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
}
initializeData();

// ============ MENU ============
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

// ============ TABLES ============
export function getTables(): Table[] {
  const data = localStorage.getItem(STORAGE_KEYS.TABLES);
  return data ? JSON.parse(data) : [];
}

export function addTable(number: number): Table {
  const tables = getTables();
  const newTable: Table = { id: `table-${Date.now()}`, number, qrCode: `table-${number}`, status: 'available' };
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

// ============ ORDERS ============
export function getOrders(): Order[] {
  const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
  return data ? JSON.parse(data) : [];
}

export function getActiveOrders(): Order[] {
  return getOrders().filter((o) => ['pending', 'preparing', 'ready'].includes(o.status));
}

export function placeOrder(
  tableNumber: number,
  items: Order['items'],
  totalAmount: number,
  customerName: string,
  customerPhone: string,
  customerNote?: string
): Order {
  const orders = getOrders();
  const newOrder: Order = {
    id: `ORD-${Date.now()}`,
    tableNumber,
    customerName,
    customerPhone,
    items,
    totalAmount,
    status: 'pending',
    timestamp: Date.now(),
    customerNote,
  };
  orders.unshift(newOrder);
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  
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

// Simulate a new order arriving (for demo/testing)
export function simulateNewOrder(): Order {
  const items = getMenuItems().filter((i) => i.available);
  const numItems = Math.floor(Math.random() * 3) + 1;
  const selectedItems: Order['items'] = [];
  for (let i = 0; i < numItems; i++) {
    const item = items[Math.floor(Math.random() * items.length)];
    const existing = selectedItems.find((si) => si.menuItem.id === item.id);
    if (existing) { existing.quantity += 1; }
    else { selectedItems.push({ menuItem: item, quantity: 1 }); }
  }
  const total = selectedItems.reduce((sum, si) => sum + si.menuItem.price * si.quantity, 0);
  const tables = getTables();
  const occupiedTables = tables.filter((t) => t.status === 'occupied');
  const tableNum = occupiedTables.length > 0
    ? occupiedTables[Math.floor(Math.random() * occupiedTables.length)].number
    : tables[Math.floor(Math.random() * tables.length)].number;
  const notes = ['', 'No onions please', 'Extra spicy!', 'Allergic to nuts', 'Well done', ''];
  const names = ['John Smith', 'Sarah Johnson', 'Mike Davis', 'Emily Brown', 'David Wilson'];
  const phones = ['+1-555-0101', '+1-555-0102', '+1-555-0103', '+1-555-0104', '+1-555-0105'];
  return placeOrder(
    tableNum,
    selectedItems,
    total,
    names[Math.floor(Math.random() * names.length)],
    phones[Math.floor(Math.random() * phones.length)],
    notes[Math.floor(Math.random() * notes.length)] || undefined
  );
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

// ============ STAFF MANAGEMENT ============
const defaultStaff: Staff[] = [
  {
    id: 'staff-1',
    name: 'Admin User',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    phone: '+1-555-0001',
    email: 'admin@hotel.com',
    active: true,
    createdAt: Date.now(),
  },
  {
    id: 'staff-2',
    name: 'Kitchen Staff',
    username: 'kitchen',
    password: 'kitchen123',
    role: 'kitchen',
    phone: '+1-555-0002',
    email: 'kitchen@hotel.com',
    active: true,
    createdAt: Date.now(),
  },
];

export function getStaff(): Staff[] {
  const data = localStorage.getItem(STORAGE_KEYS.STAFF);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(defaultStaff));
    return defaultStaff;
  }
  return JSON.parse(data);
}

export function addStaff(staff: Omit<Staff, 'id' | 'createdAt'>): Staff {
  const staffList = getStaff();
  const newStaff: Staff = {
    ...staff,
    id: `staff-${Date.now()}`,
    createdAt: Date.now(),
  };
  staffList.push(newStaff);
  localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staffList));
  return newStaff;
}

export function updateStaff(id: string, updates: Partial<Staff>): Staff | null {
  const staffList = getStaff();
  const index = staffList.findIndex((s) => s.id === id);
  if (index === -1) return null;
  staffList[index] = { ...staffList[index], ...updates };
  localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staffList));
  return staffList[index];
}

export function deleteStaff(id: string): boolean {
  const staffList = getStaff();
  const filtered = staffList.filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(filtered));
  return filtered.length < staffList.length;
}

export function toggleStaffStatus(id: string): Staff | null {
  const staffList = getStaff();
  const index = staffList.findIndex((s) => s.id === id);
  if (index === -1) return null;
  staffList[index].active = !staffList[index].active;
  localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staffList));
  return staffList[index];
}

// ============ STATS ============
export function getDashboardStats() {
  const orders = getOrders();
  const tables = getTables();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayOrders = orders.filter((o) => o.timestamp >= today.getTime());
  const activeOrders = orders.filter((o) => ['pending', 'preparing', 'ready'].includes(o.status));
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const occupiedTables = tables.filter((t) => t.status === 'occupied').length;
  return {
    totalOrders: todayOrders.length, activeOrders: activeOrders.length,
    todayRevenue, occupiedTables, totalTables: tables.length,
    pendingOrders: orders.filter((o) => o.status === 'pending').length,
  };
}

export function getCategories(): string[] {
  return [...new Set(getMenuItems().map((item) => item.category))].sort();
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

export function notify(): void { notifyListeners(); }

// ============ SOUND ALERT ============
export function playOrderAlert(): void {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch {}
}
