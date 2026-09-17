import { MenuItem, Table, TableStatus, Order, OrderStatus, HotelSettings, Staff, UserRole } from './types';
import { supabase, isSupabaseConfigured } from './lib/supabase';

// ============ HYBRID STORE ============
// Uses localStorage as primary + Supabase for real-time sync across devices
// When Supabase is configured, data syncs to cloud database
// When not configured, falls back to localStorage only

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
  phone: '+91 98765 43210', currency: '₹', taxRate: 18,
};

const defaultStaff: Staff[] = [
  { id: 'staff-1', name: 'Admin User', username: 'admin', password: 'admin123', role: 'admin', phone: '+91-98765-00001', email: 'admin@hotel.com', active: true, createdAt: Date.now() },
  { id: 'staff-2', name: 'Kitchen Staff', username: 'kitchen', password: 'kitchen123', role: 'kitchen', phone: '+91-98765-00002', email: 'kitchen@hotel.com', active: true, createdAt: Date.now() },
];

function initializeData() {
  if (!localStorage.getItem(STORAGE_KEYS.MENU)) localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(defaultMenuItems));
  if (!localStorage.getItem(STORAGE_KEYS.TABLES)) localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(defaultTables));
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
  if (!localStorage.getItem(STORAGE_KEYS.STAFF)) localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(defaultStaff));
}
initializeData();

// ============ EVENT SYSTEM ============
type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function notify(): void { notifyListeners(); }

// ============ SUPABASE SYNC ============
// Sync data to Supabase when configured (runs in background)
async function syncToSupabase(table: string, data: any[]) {
  if (!isSupabaseConfigured()) return;
  try {
    // Convert camelCase to snake_case for Supabase
    const convertedData = data.map((item) => {
      if (table === 'orders') {
        return {
          id: item.id,
          table_number: item.tableNumber,
          customer_name: item.customerName,
          customer_phone: item.customerPhone,
          items: item.items,
          total_amount: item.totalAmount,
          status: item.status,
          customer_note: item.customerNote,
          timestamp: item.timestamp,
        };
      } else if (table === 'tables') {
        return {
          id: item.id,
          number: item.number,
          status: item.status,
        };
      } else if (table === 'menu_items') {
        return {
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
          image_url: item.imageUrl,
          available: item.available,
        };
      }
      return item;
    });
    
    await supabase.from(table).upsert(convertedData, { onConflict: 'id' });
  } catch (e) {
    console.warn('Supabase sync failed:', e);
  }
}

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
  syncToSupabase('menu_items', items);
  notifyListeners();
  return newItem;
}

export function updateMenuItem(id: string, updates: Partial<MenuItem>): MenuItem | null {
  const items = getMenuItems();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;
  items[index] = { ...items[index], ...updates };
  localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(items));
  syncToSupabase('menu_items', items);
  notifyListeners();
  return items[index];
}

export function deleteMenuItem(id: string): boolean {
  const items = getMenuItems();
  const filtered = items.filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(filtered));
  syncToSupabase('menu_items', filtered);
  notifyListeners();
  return filtered.length < items.length;
}

export function toggleMenuItemAvailability(id: string): MenuItem | null {
  const items = getMenuItems();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;
  items[index].available = !items[index].available;
  localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(items));
  syncToSupabase('menu_items', items);
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
  syncToSupabase('tables', tables);
  notifyListeners();
  return newTable;
}

export function deleteTable(id: string): boolean {
  const tables = getTables();
  const filtered = tables.filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(filtered));
  syncToSupabase('tables', filtered);
  notifyListeners();
  return filtered.length < tables.length;
}

export function updateTableStatus(id: string, status: TableStatus): Table | null {
  const tables = getTables();
  const index = tables.findIndex((t) => t.id === id);
  if (index === -1) return null;
  tables[index].status = status;
  localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
  syncToSupabase('tables', tables);
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

export async function placeOrder(
  tableNumber: number,
  items: Order['items'],
  totalAmount: number,
  customerName: string,
  customerPhone: string,
  customerNote?: string
): Promise<Order> {
  const newOrder: Order = {
    id: `ORD-${Date.now()}`, tableNumber, customerName, customerPhone,
    items, totalAmount, status: 'pending', timestamp: Date.now(), customerNote,
  };
  
  // Save to localStorage first (for immediate UI update)
  const orders = getOrders();
  orders.unshift(newOrder);
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  
  // Update table status
  const tables = getTables();
  const tableIndex = tables.findIndex((t) => t.number === tableNumber);
  if (tableIndex !== -1) {
    tables[tableIndex].status = 'occupied';
    localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
  }
  
  // Sync to Supabase (for cross-device sync)
  if (isSupabaseConfigured()) {
    try {
      // Insert order to Supabase
      await supabase.from('orders').insert({
        id: newOrder.id,
        table_number: newOrder.tableNumber,
        customer_name: newOrder.customerName,
        customer_phone: newOrder.customerPhone,
        items: newOrder.items,
        total_amount: newOrder.totalAmount,
        status: newOrder.status,
        customer_note: newOrder.customerNote,
        timestamp: newOrder.timestamp,
      });
      
      // Update table status in Supabase
      if (tableIndex !== -1) {
        await supabase.from('tables').update({ status: 'occupied' }).eq('number', tableNumber);
      }
    } catch (e) {
      console.warn('Supabase order insert failed:', e);
    }
  }
  
  notifyListeners();
  return newOrder;
}

export function updateOrderStatus(orderId: string, status: OrderStatus): Order | null {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index === -1) return null;
  orders[index].status = status;
  
  const order = orders[index];
  const tables = getTables();
  const tableIndex = tables.findIndex((t) => t.number === order.tableNumber);
  
  if (status === 'served' && tableIndex !== -1) {
    tables[tableIndex].status = 'dirty';
    localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
    syncToSupabase('tables', tables);
  }
  if (status === 'paid' && tableIndex !== -1) {
    tables[tableIndex].status = 'available';
    localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
    syncToSupabase('tables', tables);
  }
  
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  syncToSupabase('orders', orders);
  notifyListeners();
  return orders[index];
}

export function setEstimatedTime(orderId: string, minutes: number): Order | null {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index === -1) return null;
  orders[index].estimatedMinutes = minutes;
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  syncToSupabase('orders', orders);
  notifyListeners();
  return orders[index];
}

export function addOrderRating(orderId: string, rating: number, review?: string): Order | null {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index === -1) return null;
  orders[index].rating = rating;
  if (review) orders[index].review = review;
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  syncToSupabase('orders', orders);
  notifyListeners();
  return orders[index];
}

export function getOrderHistory(): Order[] {
  return getOrders().filter(o => o.status === 'paid' || o.status === 'cancelled');
}

export function getAnalyticsData() {
  const orders = getOrders();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayOrders = orders.filter(o => o.timestamp >= today.getTime());
  const totalRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const avgOrderValue = todayOrders.length > 0 ? totalRevenue / todayOrders.length : 0;
  
  // Top selling items
  const itemSales: Record<string, { name: string; count: number; revenue: number; emoji: string }> = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      const key = item.menuItem.id;
      if (!itemSales[key]) {
        itemSales[key] = { name: item.menuItem.name, count: 0, revenue: 0, emoji: item.menuItem.imageUrl };
      }
      itemSales[key].count += item.quantity;
      itemSales[key].revenue += item.menuItem.price * item.quantity;
    });
  });
  const topItems = Object.values(itemSales).sort((a, b) => b.count - a.count).slice(0, 5);
  
  // Peak hours
  const hourCounts = new Array(24).fill(0);
  orders.forEach(order => {
    const hour = new Date(order.timestamp).getHours();
    hourCounts[hour]++;
  });
  const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
  
  // Ratings
  const ratedOrders = orders.filter(o => o.rating);
  const avgRating = ratedOrders.length > 0 
    ? ratedOrders.reduce((sum, o) => sum + (o.rating || 0), 0) / ratedOrders.length 
    : 0;
  
  return {
    totalOrders: todayOrders.length,
    totalRevenue,
    avgOrderValue,
    topItems,
    peakHour,
    avgRating,
    totalRatedOrders: ratedOrders.length,
  };
}

export async function simulateNewOrder(): Promise<Order> {
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
  const tableNum = tables[Math.floor(Math.random() * tables.length)].number;
  const notes = ['', 'No onions please', 'Extra spicy!', 'Allergic to nuts', 'Less oil please', ''];
  const names = ['Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Reddy', 'Vikram Singh'];
  const phones = ['+91-98765-43210', '+91-87654-32109', '+91-76543-21098', '+91-65432-10987', '+91-54321-09876'];
  return await placeOrder(
    tableNum, selectedItems, total,
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

// ============ STAFF ============
export function getStaff(): Staff[] {
  const data = localStorage.getItem(STORAGE_KEYS.STAFF);
  return data ? JSON.parse(data) : defaultStaff;
}

export function addStaff(staff: Omit<Staff, 'id' | 'createdAt'>): Staff {
  const staffList = getStaff();
  const newStaff: Staff = { ...staff, id: `staff-${Date.now()}`, createdAt: Date.now() };
  staffList.push(newStaff);
  localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staffList));
  notifyListeners();
  return newStaff;
}

export function updateStaff(id: string, updates: Partial<Staff>): Staff | null {
  const staffList = getStaff();
  const index = staffList.findIndex((s) => s.id === id);
  if (index === -1) return null;
  staffList[index] = { ...staffList[index], ...updates };
  localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staffList));
  notifyListeners();
  return staffList[index];
}

export function deleteStaff(id: string): boolean {
  const staffList = getStaff();
  const filtered = staffList.filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(filtered));
  notifyListeners();
  return filtered.length < staffList.length;
}

export function toggleStaffStatus(id: string): Staff | null {
  const staffList = getStaff();
  const index = staffList.findIndex((s) => s.id === id);
  if (index === -1) return null;
  staffList[index].active = !staffList[index].active;
  localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staffList));
  notifyListeners();
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

// ============ SUPABASE REAL-TIME SUBSCRIPTIONS ============
// These return unsubscribe functions. When Supabase is configured,
// they listen for changes from OTHER devices and update localStorage.
export function subscribeToOrders(callback: () => void) {
  if (!isSupabaseConfigured()) {
    // Fallback: just use localStorage events
    const handler = () => callback();
    window.addEventListener('storage', handler);
    return { unsubscribe: () => window.removeEventListener('storage', handler) };
  }
  
  const channel = supabase
    .channel('orders-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, async () => {
      // Fetch latest from Supabase and update localStorage
      const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (data) {
        const orders: Order[] = data.map((o: any) => ({
          id: o.id, tableNumber: o.table_number, customerName: o.customer_name,
          customerPhone: o.customer_phone, items: o.items, totalAmount: o.total_amount,
          status: o.status, timestamp: new Date(o.created_at).getTime(), customerNote: o.customer_note,
        }));
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
        notifyListeners();
        callback();
      }
    })
    .subscribe();
  
  return { unsubscribe: () => supabase.removeChannel(channel) };
}

export function subscribeToTables(callback: () => void) {
  if (!isSupabaseConfigured()) {
    const handler = () => callback();
    window.addEventListener('storage', handler);
    return { unsubscribe: () => window.removeEventListener('storage', handler) };
  }
  
  const channel = supabase
    .channel('tables-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, async () => {
      const { data } = await supabase.from('tables').select('*').order('number');
      if (data) {
        const tables: Table[] = data.map((t: any) => ({
          id: t.id, number: t.number, qrCode: `table-${t.number}`, status: t.status,
        }));
        localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
        notifyListeners();
        callback();
      }
    })
    .subscribe();
  
  return { unsubscribe: () => supabase.removeChannel(channel) };
}

export function subscribeToMenuItems(callback: () => void) {
  if (!isSupabaseConfigured()) {
    const handler = () => callback();
    window.addEventListener('storage', handler);
    return { unsubscribe: () => window.removeEventListener('storage', handler) };
  }
  
  const channel = supabase
    .channel('menu-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, async () => {
      const { data } = await supabase.from('menu_items').select('*');
      if (data) {
        const items: MenuItem[] = data.map((i: any) => ({
          id: i.id, name: i.name, description: i.description, price: i.price,
          category: i.category, imageUrl: i.image_url, available: i.available,
        }));
        localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(items));
        notifyListeners();
        callback();
      }
    })
    .subscribe();
  
  return { unsubscribe: () => supabase.removeChannel(channel) };
}

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
