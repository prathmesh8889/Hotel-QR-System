import { MenuItem, Table, TableStatus, Order, OrderStatus, HotelSettings, Staff, UserRole } from './types';
import * as db from './lib/database';

// Supabase-based store - all data is synced across devices in real-time
// No more localStorage - everything is in the cloud database

// ============ MENU ============
export async function getMenuItems(): Promise<MenuItem[]> {
  return await db.getMenuItems();
}

export async function addMenuItem(item: Omit<MenuItem, 'id'>): Promise<MenuItem | null> {
  return await db.addMenuItem(item);
}

export async function updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<boolean> {
  return await db.updateMenuItem(id, updates);
}

export async function deleteMenuItem(id: string): Promise<boolean> {
  return await db.deleteMenuItem(id);
}

export async function toggleMenuItemAvailability(id: string): Promise<MenuItem | null> {
  const items = await db.getMenuItems();
  const item = items.find(i => i.id === id);
  if (!item) return null;
  
  const success = await db.updateMenuItem(id, { available: !item.available });
  if (success) {
    return { ...item, available: !item.available };
  }
  return null;
}

// ============ TABLES ============
export async function getTables(): Promise<Table[]> {
  return await db.getTables();
}

export async function addTable(number: number): Promise<Table | null> {
  return await db.addTable(number);
}

export async function deleteTable(id: string): Promise<boolean> {
  return await db.deleteTable(id);
}

export async function updateTableStatus(id: string, status: TableStatus): Promise<boolean> {
  return await db.updateTableStatus(id, status);
}

// ============ ORDERS ============
export async function getOrders(): Promise<Order[]> {
  return await db.getOrders();
}

export async function getActiveOrders(): Promise<Order[]> {
  const orders = await db.getOrders();
  return orders.filter((o) => ['pending', 'preparing', 'ready'].includes(o.status));
}

export async function placeOrder(
  tableNumber: number,
  items: Order['items'],
  totalAmount: number,
  customerName: string,
  customerPhone: string,
  customerNote?: string
): Promise<Order | null> {
  return await db.placeOrder(
    tableNumber,
    items,
    totalAmount,
    customerName,
    customerPhone,
    customerNote
  );
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  return await db.updateOrderStatus(orderId, status);
}

// Simulate a new order arriving (for demo/testing)
export async function simulateNewOrder(): Promise<Order | null> {
  const items = await db.getMenuItems();
  const availableItems = items.filter((i) => i.available);
  const numItems = Math.floor(Math.random() * 3) + 1;
  const selectedItems: Order['items'] = [];
  
  for (let i = 0; i < numItems; i++) {
    const item = availableItems[Math.floor(Math.random() * availableItems.length)];
    const existing = selectedItems.find((si) => si.menuItem.id === item.id);
    if (existing) { 
      existing.quantity += 1; 
    } else { 
      selectedItems.push({ menuItem: item, quantity: 1 }); 
    }
  }
  
  const total = selectedItems.reduce((sum, si) => sum + si.menuItem.price * si.quantity, 0);
  const tables = await db.getTables();
  const occupiedTables = tables.filter((t) => t.status === 'occupied');
  const tableNum = occupiedTables.length > 0
    ? occupiedTables[Math.floor(Math.random() * occupiedTables.length)].number
    : tables[Math.floor(Math.random() * tables.length)].number;
  
  const notes = ['', 'No onions please', 'Extra spicy!', 'Allergic to nuts', 'Less oil please', ''];
  const names = ['Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Reddy', 'Vikram Singh'];
  const phones = ['+91-98765-43210', '+91-87654-32109', '+91-76543-21098', '+91-65432-10987', '+91-54321-09876'];
  
  return await db.placeOrder(
    tableNum,
    selectedItems,
    total,
    names[Math.floor(Math.random() * names.length)],
    phones[Math.floor(Math.random() * phones.length)],
    notes[Math.floor(Math.random() * notes.length)] || undefined
  );
}

// ============ SETTINGS ============
export async function getSettings(): Promise<HotelSettings> {
  return await db.getSettings();
}

export async function updateSettings(settings: Partial<HotelSettings>): Promise<boolean> {
  return await db.updateSettings(settings);
}

// ============ STAFF ============
export async function getStaff(): Promise<Staff[]> {
  return await db.getStaff();
}

export async function addStaff(staff: Omit<Staff, 'id' | 'createdAt'>): Promise<Staff | null> {
  return await db.addStaff(staff);
}

export async function updateStaff(id: string, updates: Partial<Staff>): Promise<boolean> {
  return await db.updateStaff(id, updates);
}

export async function deleteStaff(id: string): Promise<boolean> {
  return await db.deleteStaff(id);
}

export async function toggleStaffStatus(id: string): Promise<Staff | null> {
  const staffList = await db.getStaff();
  const staff = staffList.find(s => s.id === id);
  if (!staff) return null;
  
  const success = await db.updateStaff(id, { active: !staff.active });
  if (success) {
    return { ...staff, active: !staff.active };
  }
  return null;
}

// ============ STATS ============
export async function getDashboardStats() {
  const orders = await db.getOrders();
  const tables = await db.getTables();
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

export async function getCategories(): Promise<string[]> {
  const items = await db.getMenuItems();
  return [...new Set(items.map((item) => item.category))].sort();
}

// ============ REAL-TIME SUBSCRIPTIONS ============
export function subscribeToOrders(callback: (orders: Order[]) => void) {
  return db.subscribeToOrders(callback);
}

export function subscribeToTables(callback: (tables: Table[]) => void) {
  return db.subscribeToTables(callback);
}

export function subscribeToMenuItems(callback: (items: MenuItem[]) => void) {
  return db.subscribeToMenuItems(callback);
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
