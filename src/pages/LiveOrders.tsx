import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getOrders, updateOrderStatus, subscribeToOrders, playOrderAlert } from '../store';
import { Order } from '../types';
import { OrderStatusBadge } from '../components/UI/StatusBadge';
import { PageLoader } from '../components/UI/LoadingSkeleton';
import {
  Clock, ChefHat, CheckCircle, Truck, XCircle, AlertTriangle,
  Play, CircleDot, Flame, Bell
} from 'lucide-react';

export default function LiveOrders() {
  const { auth } = useAuth();
  const isAdmin = auth.role === 'admin';
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const prevOrderIdsRef = useRef<Set<string>>(new Set());
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    // Initial fetch
    const fetchOrders = async () => {
      const allOrders = await getOrders();
      setOrders(allOrders.filter((o) => ['pending', 'preparing', 'ready'].includes(o.status)));
      prevOrderIdsRef.current = new Set(allOrders.map((o) => o.id));
      setLoading(false);
    };
    
    fetchOrders();

    // Subscribe to real-time updates
    const subscription = subscribeToOrders(async (allOrders) => {
      const active = allOrders.filter((o) => ['pending', 'preparing', 'ready'].includes(o.status));
      
      // Detect new orders
      const currentIds = new Set(allOrders.map((o) => o.id));
      const newIds = new Set<string>();
      currentIds.forEach((id) => {
        if (!prevOrderIdsRef.current.has(id)) newIds.add(id);
      });
      
      if (newIds.size > 0) {
        setNewOrderIds(newIds);
        if (soundEnabled) playOrderAlert();
        setTimeout(() => setNewOrderIds(new Set()), 3000);
      }
      
      prevOrderIdsRef.current = currentIds;
      setOrders(active);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [soundEnabled]);

  const handleStartCooking = async (orderId: string) => {
    await updateOrderStatus(orderId, 'preparing');
  };

  const handleMarkReady = async (orderId: string) => {
    await updateOrderStatus(orderId, 'ready');
  };

  const handleMarkServed = async (orderId: string) => {
    await updateOrderStatus(orderId, 'served');
  };

  const handleCancelOrder = async (orderId: string) => {
    if (confirm('Cancel this order?')) {
      await updateOrderStatus(orderId, 'cancelled');
    }
  };

  const handleMarkPaid = async (orderId: string) => {
    if (confirm('Mark this order as paid? This will free up the table.')) {
      await updateOrderStatus(orderId, 'paid');
    }
  };

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const preparingOrders = orders.filter((o) => o.status === 'preparing');
  const readyOrders = orders.filter((o) => o.status === 'ready');

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-slate-500 text-sm">
            {orders.length} active orders • Real-time updates via Supabase
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              soundEnabled ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'
            }`}
          >
            <Bell size={12} />
            {soundEnabled ? 'Sound On' : 'Sound Off'}
          </button>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Connected
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <KanbanColumn
          title="New Orders"
          count={pendingOrders.length}
          icon={<CircleDot size={16} className="text-amber-500" />}
          color="amber"
          orders={pendingOrders}
          newOrderIds={newOrderIds}
          isAdmin={isAdmin}
          actionButton={(order) => (
            <button
              onClick={() => handleStartCooking(order.id)}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition w-full justify-center"
            >
              <Play size={12} fill="white" />
              Start Cooking
            </button>
          )}
          adminActions={(order) => (
            <button
              onClick={() => handleCancelOrder(order.id)}
              className="flex items-center gap-1 px-2 py-1.5 text-red-500 hover:bg-red-50 text-xs font-medium rounded-lg transition"
            >
              <XCircle size={12} /> Cancel
            </button>
          )}
        />

        <KanbanColumn
          title="Preparing"
          count={preparingOrders.length}
          icon={<Flame size={16} className="text-blue-500" />}
          color="blue"
          orders={preparingOrders}
          newOrderIds={newOrderIds}
          isAdmin={isAdmin}
          actionButton={(order) => (
            <button
              onClick={() => handleMarkReady(order.id)}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition w-full justify-center"
            >
              <CheckCircle size={12} />
              Mark Ready
            </button>
          )}
          adminActions={(order) => (
            <button
              onClick={() => handleCancelOrder(order.id)}
              className="flex items-center gap-1 px-2 py-1.5 text-red-500 hover:bg-red-50 text-xs font-medium rounded-lg transition"
            >
              <XCircle size={12} /> Cancel
            </button>
          )}
        />

        <KanbanColumn
          title="Ready to Serve"
          count={readyOrders.length}
          icon={<CheckCircle size={16} className="text-emerald-500" />}
          color="emerald"
          orders={readyOrders}
          newOrderIds={newOrderIds}
          isAdmin={isAdmin}
          actionButton={(order) => (
            <button
              onClick={() => handleMarkServed(order.id)}
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold rounded-lg transition w-full justify-center"
            >
              <Truck size={12} />
              Mark Served
            </button>
          )}
          adminActions={(order) => (
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleMarkServed(order.id)}
                className="flex items-center gap-1 px-2 py-1.5 text-purple-500 hover:bg-purple-50 text-xs font-medium rounded-lg transition"
              >
                <Truck size={12} /> Served
              </button>
              <button
                onClick={() => handleMarkPaid(order.id)}
                className="flex items-center gap-1 px-2 py-1.5 text-emerald-500 hover:bg-emerald-50 text-xs font-medium rounded-lg transition"
              >
                <CheckCircle size={12} /> Paid
              </button>
            </div>
          )}
        />
      </div>

      {orders.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border">
          <ChefHat className="text-slate-300 mx-auto mb-4" size={48} />
          <h3 className="text-lg font-semibold text-slate-600">No Active Orders</h3>
          <p className="text-slate-400 text-sm mt-1">Orders will appear here in real-time as they come in</p>
          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-400">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Listening for new orders...
          </div>
        </div>
      )}
    </div>
  );
}

function KanbanColumn({
  title, count, icon, color, orders, newOrderIds, isAdmin, actionButton, adminActions,
}: {
  title: string;
  count: number;
  icon: React.ReactNode;
  color: string;
  orders: Order[];
  newOrderIds: Set<string>;
  isAdmin: boolean;
  actionButton: (order: Order) => React.ReactNode;
  adminActions: (order: Order) => React.ReactNode;
}) {
  const colorMap: Record<string, { bg: string; border: string; header: string }> = {
    amber: { bg: 'bg-amber-50/50', border: 'border-amber-200', header: 'bg-amber-50' },
    blue: { bg: 'bg-blue-50/50', border: 'border-blue-200', header: 'bg-blue-50' },
    emerald: { bg: 'bg-emerald-50/50', border: 'border-emerald-200', header: 'bg-emerald-50' },
  };

  const colors = colorMap[color] || colorMap.amber;

  return (
    <div className={`rounded-xl border ${colors.border} overflow-hidden`}>
      <div className={`${colors.header} px-4 py-3 flex items-center justify-between border-b ${colors.border}`}>
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
          color === 'amber' ? 'bg-amber-200 text-amber-800' :
          color === 'blue' ? 'bg-blue-200 text-blue-800' :
          'bg-emerald-200 text-emerald-800'
        }`}>
          {count}
        </span>
      </div>

      <div className={`${colors.bg} p-3 space-y-3 min-h-[200px] max-h-[calc(100vh-280px)] overflow-y-auto`}>
        {orders.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">No orders</div>
        ) : (
          orders.map((order) => {
            const isNew = newOrderIds.has(order.id);
            const elapsed = Math.floor((Date.now() - order.timestamp) / 60000);
            const isDelayed = order.status === 'pending' && elapsed > 10;

            return (
              <div
                key={order.id}
                className={`bg-white rounded-xl border p-4 shadow-sm transition-all ${
                  isNew ? 'border-indigo-400 ring-2 ring-indigo-200 animate-pulse' : 'border-gray-100'
                } ${isDelayed ? 'border-red-300' : ''}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                      <span className="text-xs font-bold text-slate-600">T{order.tableNumber}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">Table {order.tableNumber}</p>
                      <p className="text-xs text-slate-500">{elapsed}m ago • #{order.id.slice(-6)}</p>
                    </div>
                  </div>
                  {isNew && (
                    <span className="px-2 py-0.5 bg-indigo-500 text-white text-[10px] font-bold rounded-full animate-bounce">NEW</span>
                  )}
                </div>

                <div className="space-y-1 mb-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 flex items-center gap-1">
                        <span>{item.menuItem.imageUrl}</span>
                        <span>{item.menuItem.name}</span>
                        {item.quantity > 1 && <span className="text-orange-600 font-bold">×{item.quantity}</span>}
                      </span>
                    </div>
                  ))}
                </div>

                {order.customerNote && (
                  <div className="mb-3 p-2 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-700 flex items-center gap-1">
                    <AlertTriangle size={10} />
                    {order.customerNote}
                  </div>
                )}

                {isDelayed && (
                  <div className="mb-3 p-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 flex items-center gap-1 font-medium">
                    <Clock size={10} />
                    Delayed — {elapsed} min waiting
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="font-bold text-slate-800 text-sm">₹{order.totalAmount.toFixed(2)}</span>
                  <div className="flex items-center gap-1">
                    {isAdmin && adminActions(order)}
                    {actionButton(order)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
