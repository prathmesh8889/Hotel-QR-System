import { supabase } from './supabase';
import type { MenuItem, Table, Order, Staff, HotelSettings } from '../types';

// ============ MENU ITEMS ============
export async function getMenuItems(): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching menu items:', error);
    return [];
  }

  return data.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    category: item.category,
    imageUrl: item.image_url,
    available: item.available
  }));
}

export async function addMenuItem(item: Omit<MenuItem, 'id'>): Promise<MenuItem | null> {
  const { data, error } = await supabase
    .from('menu_items')
    .insert([{
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image_url: item.imageUrl,
      available: item.available
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding menu item:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    price: data.price,
    category: data.category,
    imageUrl: data.image_url,
    available: data.available
  };
}

export async function updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<boolean> {
  const updateData: any = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.price !== undefined) updateData.price = updates.price;
  if (updates.category !== undefined) updateData.category = updates.category;
  if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;
  if (updates.available !== undefined) updateData.available = updates.available;

  const { error } = await supabase
    .from('menu_items')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating menu item:', error);
    return false;
  }

  return true;
}

export async function deleteMenuItem(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting menu item:', error);
    return false;
  }

  return true;
}

// ============ TABLES ============
export async function getTables(): Promise<Table[]> {
  const { data, error } = await supabase
    .from('tables')
    .select('*')
    .order('number', { ascending: true });

  if (error) {
    console.error('Error fetching tables:', error);
    return [];
  }

  return data.map(table => ({
    id: table.id,
    number: table.number,
    qrCode: `table-${table.number}`,
    status: table.status
  }));
}

export async function addTable(number: number): Promise<Table | null> {
  const { data, error } = await supabase
    .from('tables')
    .insert([{ number, status: 'available' }])
    .select()
    .single();

  if (error) {
    console.error('Error adding table:', error);
    return null;
  }

  return {
    id: data.id,
    number: data.number,
    qrCode: `table-${data.number}`,
    status: data.status
  };
}

export async function updateTableStatus(id: string, status: Table['status']): Promise<boolean> {
  const { error } = await supabase
    .from('tables')
    .update({ status })
    .eq('id', id);

  if (error) {
    console.error('Error updating table status:', error);
    return false;
  }

  return true;
}

export async function deleteTable(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('tables')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting table:', error);
    return false;
  }

  return true;
}

// ============ ORDERS ============
export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return data.map(order => ({
    id: order.id,
    tableNumber: order.table_number,
    customerName: order.customer_name,
    customerPhone: order.customer_phone,
    items: order.items,
    totalAmount: order.total_amount,
    status: order.status,
    timestamp: new Date(order.created_at).getTime(),
    customerNote: order.customer_note
  }));
}

export async function placeOrder(
  tableNumber: number,
  items: Order['items'],
  totalAmount: number,
  customerName: string,
  customerPhone: string,
  customerNote?: string
): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .insert([{
      table_number: tableNumber,
      customer_name: customerName,
      customer_phone: customerPhone,
      items: items,
      total_amount: totalAmount,
      status: 'pending',
      customer_note: customerNote || null
    }])
    .select()
    .single();

  if (error) {
    console.error('Error placing order:', error);
    return null;
  }

  // Update table status to occupied
  await supabase
    .from('tables')
    .update({ status: 'occupied' })
    .eq('number', tableNumber);

  return {
    id: data.id,
    tableNumber: data.table_number,
    customerName: data.customer_name,
    customerPhone: data.customer_phone,
    items: data.items,
    totalAmount: data.total_amount,
    status: data.status,
    timestamp: new Date(data.created_at).getTime(),
    customerNote: data.customer_note
  };
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<boolean> {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) {
    console.error('Error updating order status:', error);
    return false;
  }

  // If order is served or paid, update table status
  if (status === 'served' || status === 'paid') {
    const { data: orderData } = await supabase
      .from('orders')
      .select('table_number')
      .eq('id', orderId)
      .single();

    if (orderData) {
      const newTableStatus = status === 'paid' ? 'available' : 'dirty';
      await supabase
        .from('tables')
        .update({ status: newTableStatus })
        .eq('number', orderData.table_number);
    }
  }

  return true;
}

// ============ STAFF ============
export async function getStaff(): Promise<Staff[]> {
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching staff:', error);
    return [];
  }

  return data.map(staff => ({
    id: staff.id,
    name: staff.name,
    username: staff.username,
    password: staff.password,
    role: staff.role,
    phone: staff.phone,
    email: staff.email,
    active: staff.active,
    createdAt: new Date(staff.created_at).getTime()
  }));
}

export async function addStaff(staff: Omit<Staff, 'id' | 'createdAt'>): Promise<Staff | null> {
  const { data, error } = await supabase
    .from('staff')
    .insert([staff])
    .select()
    .single();

  if (error) {
    console.error('Error adding staff:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    username: data.username,
    password: data.password,
    role: data.role,
    phone: data.phone,
    email: data.email,
    active: data.active,
    createdAt: new Date(data.created_at).getTime()
  };
}

export async function updateStaff(id: string, updates: Partial<Staff>): Promise<boolean> {
  const updateData: any = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.username !== undefined) updateData.username = updates.username;
  if (updates.password !== undefined) updateData.password = updates.password;
  if (updates.role !== undefined) updateData.role = updates.role;
  if (updates.phone !== undefined) updateData.phone = updates.phone;
  if (updates.email !== undefined) updateData.email = updates.email;
  if (updates.active !== undefined) updateData.active = updates.active;

  const { error } = await supabase
    .from('staff')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating staff:', error);
    return false;
  }

  return true;
}

export async function deleteStaff(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('staff')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting staff:', error);
    return false;
  }

  return true;
}

// ============ SETTINGS ============
export async function getSettings(): Promise<HotelSettings> {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 'default')
    .single();

  if (error || !data) {
    // Return default settings if not found
    return {
      name: 'The Grand Kitchen',
      address: '123 Culinary Street, Food District',
      phone: '+1 (555) 123-4567',
      currency: '₹',
      taxRate: 18
    };
  }

  return {
    name: data.name,
    address: data.address,
    phone: data.phone,
    currency: data.currency,
    taxRate: data.tax_rate
  };
}

export async function updateSettings(settings: Partial<HotelSettings>): Promise<boolean> {
  const updateData: any = {};
  if (settings.name !== undefined) updateData.name = settings.name;
  if (settings.address !== undefined) updateData.address = settings.address;
  if (settings.phone !== undefined) updateData.phone = settings.phone;
  if (settings.currency !== undefined) updateData.currency = settings.currency;
  if (settings.taxRate !== undefined) updateData.tax_rate = settings.taxRate;

  const { error } = await supabase
    .from('settings')
    .update(updateData)
    .eq('id', 'default');

  if (error) {
    console.error('Error updating settings:', error);
    return false;
  }

  return true;
}

// ============ REAL-TIME SUBSCRIPTIONS ============
export function subscribeToOrders(callback: (orders: Order[]) => void) {
  return supabase
    .channel('orders-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, async () => {
      const orders = await getOrders();
      callback(orders);
    })
    .subscribe();
}

export function subscribeToTables(callback: (tables: Table[]) => void) {
  return supabase
    .channel('tables-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, async () => {
      const tables = await getTables();
      callback(tables);
    })
    .subscribe();
}

export function subscribeToMenuItems(callback: (items: MenuItem[]) => void) {
  return supabase
    .channel('menu-items-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, async () => {
      const items = await getMenuItems();
      callback(items);
    })
    .subscribe();
}
