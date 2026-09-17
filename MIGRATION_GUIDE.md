# 🔄 Migration Guide: localStorage to Supabase

## Overview
This guide shows how to migrate from localStorage (per-device) to Supabase (shared cloud database) so orders sync across all devices in real-time.

---

## 📝 Files to Update

### 1. Update `src/store.ts` → Replace with Supabase calls

**OLD (localStorage):**
```typescript
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
  notifyListeners();
  return newOrder;
}
```

**NEW (Supabase):**
```typescript
import { placeOrder as dbPlaceOrder } from './lib/database';

export async function placeOrder(
  tableNumber: number,
  items: Order['items'],
  totalAmount: number,
  customerName: string,
  customerPhone: string,
  customerNote?: string
): Promise<Order | null> {
  return await dbPlaceOrder(
    tableNumber,
    items,
    totalAmount,
    customerName,
    customerPhone,
    customerNote
  );
}
```

---

### 2. Update `src/pages/CustomerFlow.tsx`

**OLD:**
```typescript
const handlePlaceOrder = () => {
  if (cart.length === 0) return;
  setPlacing(true);
  const orderItems = cart.map((item) => ({ menuItem: item.menuItem, quantity: item.quantity }));
  
  setTimeout(() => {
    const order = placeOrder(
      tableNumber,
      orderItems,
      cartTotal,
      customerName,
      customerPhone,
      customerNote || undefined
    );
    notify();
    setCompletedOrder(order);
    setPlacing(false);
    setStep('bill');
  }, 1000);
};
```

**NEW:**
```typescript
const handlePlaceOrder = async () => {
  if (cart.length === 0) return;
  setPlacing(true);
  const orderItems = cart.map((item) => ({ menuItem: item.menuItem, quantity: item.quantity }));
  
  const order = await placeOrder(
    tableNumber,
    orderItems,
    cartTotal,
    customerName,
    customerPhone,
    customerNote || undefined
  );
  
  if (order) {
    setCompletedOrder(order);
    setStep('bill');
  } else {
    alert('Failed to place order. Please try again.');
  }
  setPlacing(false);
};
```

---

### 3. Update `src/pages/LiveOrders.tsx` - Add Real-time Subscriptions

**OLD:**
```typescript
useEffect(() => {
  const fetchOrders = async () => {
    const orders = await getOrders();
    setOrders(orders.filter((o) => ['pending', 'preparing', 'ready'].includes(o.status)));
  };
  fetchOrders();
  const interval = setInterval(fetchOrders, 2000);
  return () => clearInterval(interval);
}, []);
```

**NEW:**
```typescript
import { subscribeToOrders } from '../lib/database';

useEffect(() => {
  // Initial fetch
  const fetchOrders = async () => {
    const orders = await getOrders();
    setOrders(orders.filter((o) => ['pending', 'preparing', 'ready'].includes(o.status)));
  };
  fetchOrders();
  
  // Subscribe to real-time updates
  const subscription = subscribeToOrders((allOrders) => {
    setOrders(allOrders.filter((o) => ['pending', 'preparing', 'ready'].includes(o.status)));
  });
  
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

---

### 4. Update `src/pages/DashboardPage.tsx`

**OLD:**
```typescript
useEffect(() => {
  const fetchStats = () => {
    const stats = getDashboardStats();
    setStats(stats);
  };
  fetchStats();
  const interval = setInterval(fetchStats, 3000);
  return () => clearInterval(interval);
}, []);
```

**NEW:**
```typescript
import { subscribeToOrders } from '../lib/database';

useEffect(() => {
  const fetchStats = async () => {
    const orders = await getOrders();
    const tables = await getTables();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayOrders = orders.filter((o) => o.timestamp >= today.getTime());
    const activeOrders = orders.filter((o) => ['pending', 'preparing', 'ready'].includes(o.status));
    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const occupiedTables = tables.filter((t) => t.status === 'occupied').length;
    
    setStats({
      totalOrders: todayOrders.length,
      activeOrders: activeOrders.length,
      todayRevenue,
      occupiedTables,
      totalTables: tables.length,
      pendingOrders: orders.filter((o) => o.status === 'pending').length,
    });
  };
  
  fetchStats();
  
  // Subscribe to real-time updates
  const subscription = subscribeToOrders(fetchStats);
  
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

---

### 5. Update `src/pages/MenuManagement.tsx`

**OLD:**
```typescript
const handleAddItem = async (e: React.FormEvent) => {
  e.preventDefault();
  const newItem = await addMenuItem({
    name: formData.name,
    description: formData.description,
    price: parseFloat(formData.price),
    category: formData.category,
    imageUrl: formData.imageUrl,
    available: formData.available,
  });
  if (newItem) {
    setItems([...items, newItem]);
    resetForm();
  }
};
```

**NEW:** (Same, but ensure you're using the async version from database.ts)

---

### 6. Update `src/pages/TableManagement.tsx`

**OLD:**
```typescript
useEffect(() => {
  const fetchTables = () => {
    const tables = getTables();
    setTables(tables);
  };
  fetchTables();
  const interval = setInterval(fetchTables, 2000);
  return () => clearInterval(interval);
}, []);
```

**NEW:**
```typescript
import { subscribeToTables } from '../lib/database';

useEffect(() => {
  const fetchTables = async () => {
    const tables = await getTables();
    setTables(tables);
  };
  fetchTables();
  
  // Subscribe to real-time updates
  const subscription = subscribeToTables(fetchTables);
  
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

---

## 🔑 Key Changes Summary

### 1. All functions become `async`
```typescript
// OLD
const orders = getOrders();

// NEW
const orders = await getOrders();
```

### 2. Add real-time subscriptions
```typescript
import { subscribeToOrders } from '../lib/database';

const subscription = subscribeToOrders((orders) => {
  setOrders(orders);
});

// Cleanup on unmount
return () => subscription.unsubscribe();
```

### 3. Remove `notifyListeners()` calls
No longer needed - Supabase handles real-time updates automatically!

### 4. Remove polling intervals
No more `setInterval` - real-time subscriptions replace them!

---

## 📦 Complete Component Example

Here's a complete example of a component using Supabase:

```typescript
import { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus, subscribeToOrders } from '../lib/database';
import type { Order } from '../types';

export default function LiveOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    const fetchOrders = async () => {
      const allOrders = await getOrders();
      setOrders(allOrders.filter((o) => 
        ['pending', 'preparing', 'ready'].includes(o.status)
      ));
      setLoading(false);
    };
    
    fetchOrders();
    
    // Subscribe to real-time updates
    const subscription = subscribeToOrders((allOrders) => {
      setOrders(allOrders.filter((o) => 
        ['pending', 'preparing', 'ready'].includes(o.status)
      ));
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    const success = await updateOrderStatus(orderId, newStatus);
    if (!success) {
      alert('Failed to update order status');
    }
    // No need to manually refresh - real-time subscription handles it!
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {orders.map(order => (
        <div key={order.id}>
          <h3>Order #{order.id}</h3>
          <p>Table: {order.tableNumber}</p>
          <p>Status: {order.status}</p>
          <button onClick={() => handleUpdateStatus(order.id, 'preparing')}>
            Start Cooking
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## 🧪 Testing Checklist

After migration, test:

- [ ] Login works (admin / admin123)
- [ ] Menu items load from Supabase
- [ ] Can add/edit/delete menu items
- [ ] Tables load from Supabase
- [ ] Can add/delete tables
- [ ] Customer can place order on mobile
- [ ] Order appears instantly on admin dashboard (laptop)
- [ ] Can update order status (pending → preparing → ready → served → paid)
- [ ] Table status updates automatically
- [ ] Real-time updates work without page refresh
- [ ] Multiple devices stay in sync

---

## 🐛 Common Issues

### Issue: "Cannot read property 'map' of undefined"
**Solution:** Always check if data exists before mapping:
```typescript
const items = data || [];
```

### Issue: Orders not updating in real-time
**Solution:** 
1. Check Supabase → Database → Replication
2. Make sure "Enable Realtime" is ON
3. Check browser console for WebSocket errors

### Issue: "relation does not exist"
**Solution:** Run the SQL from SUPABASE_SETUP.md again

### Issue: Environment variables not loading
**Solution:** 
1. Make sure file is named `.env` (not `.env.txt`)
2. Variables must start with `VITE_`
3. Restart dev server after adding `.env`

---

## 🚀 Deployment

### Vercel Environment Variables

1. Go to Vercel project → Settings → Environment Variables
2. Add:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
3. Deploy!

### Testing Production

1. Open mobile phone
2. Scan QR code
3. Place order
4. Open laptop (admin dashboard)
5. Order should appear instantly! 🎉

---

## 📊 Performance

**Before (localStorage):**
- ❌ Only works on same device
- ❌ No real-time sync
- ❌ Data lost on clear cache
- ❌ Can't share between devices

**After (Supabase):**
- ✅ Works across all devices
- ✅ Real-time sync via WebSocket
- ✅ Data persisted in cloud
- ✅ Share between mobile, tablet, laptop
- ✅ Automatic backups
- ✅ Scalable to multiple locations

---

## 💡 Pro Tips

1. **Monitor usage:** Supabase dashboard shows API calls, storage, etc.
2. **Set up alerts:** Get notified if database gets full
3. **Regular backups:** Export data periodically
4. **Test on real devices:** Don't just test on desktop
5. **Check network:** Real-time needs stable internet

---

**You're now ready for a production-ready, real-time ordering system!** 🚀
