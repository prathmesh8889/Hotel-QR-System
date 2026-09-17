import { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus, subscribe, notify } from '../store';
import { Order } from '../types';
import KitchenOrderCard from '../components/Kitchen/KitchenOrderCard';
import { ChefHat, AlertTriangle } from 'lucide-react';

export default function KitchenView() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const update = () => {
      const active = getOrders().filter((o) => ['pending', 'preparing', 'ready'].includes(o.status));
      setOrders(active);
    };
    update();
    const unsub = subscribe(update);
    const interval = setInterval(update, 2000);
    return () => { unsub(); clearInterval(interval); };
  }, []);

  const handleStartCooking = (orderId: string) => {
    updateOrderStatus(orderId, 'preparing');
    notify();
    setOrders(getOrders().filter((o) => ['pending', 'preparing', 'ready'].includes(o.status)));
  };

  const handleMarkReady = (orderId: string) => {
    updateOrderStatus(orderId, 'ready');
    notify();
    setOrders(getOrders().filter((o) => ['pending', 'preparing', 'ready'].includes(o.status)));
  };

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const preparingOrders = orders.filter((o) => o.status === 'preparing');
  const readyOrders = orders.filter((o) => o.status === 'ready');

  const delayedCount = pendingOrders.filter((o) => (Date.now() - o.timestamp) / 60000 > 15).length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 text-amber-400 rounded-xl">
          <span className="text-2xl font-black">{pendingOrders.length}</span>
          <span className="text-sm font-medium">Pending</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl">
          <span className="text-2xl font-black">{preparingOrders.length}</span>
          <span className="text-sm font-medium">Cooking</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
          <span className="text-2xl font-black">{readyOrders.length}</span>
          <span className="text-sm font-medium">Ready</span>
        </div>
        {delayedCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-xl animate-pulse">
            <AlertTriangle size={18} />
            <span className="text-sm font-bold">{delayedCount} DELAYED</span>
          </div>
        )}
      </div>

      {/* Orders Grid */}
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <ChefHat className="text-slate-600 mb-4" size={64} />
          <h2 className="text-xl font-bold text-slate-400">No Active Orders</h2>
          <p className="text-slate-500 mt-2">Waiting for new orders to arrive...</p>
          <div className="mt-6 flex items-center gap-2 text-slate-600 text-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            System connected • Auto-refreshing
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {orders.map((order) => (
            <KitchenOrderCard
              key={order.id}
              order={order}
              onStartCooking={handleStartCooking}
              onMarkReady={handleMarkReady}
            />
          ))}
        </div>
      )}
    </div>
  );
}
