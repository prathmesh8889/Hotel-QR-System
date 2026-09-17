import { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus, subscribe, notify } from '../store';
import { Order } from '../types';
import { OrderStatusBadge } from '../components/UI/StatusBadge';
import { PageLoader } from '../components/UI/LoadingSkeleton';
import { ChefHat, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setOrders(getOrders().filter((o) => ['pending', 'preparing', 'ready'].includes(o.status)));
      setLoading(false);
    }, 500);

    const unsub = subscribe(() => {
      setOrders(getOrders().filter((o) => ['pending', 'preparing', 'ready'].includes(o.status)));
    });
    const interval = setInterval(() => {
      setOrders(getOrders().filter((o) => ['pending', 'preparing', 'ready'].includes(o.status)));
    }, 2000);

    return () => { unsub(); clearInterval(interval); };
  }, []);

  const handleMarkReady = (orderId: string) => {
    updateOrderStatus(orderId, 'ready');
    notify();
  };

  const handleMarkServed = (orderId: string) => {
    updateOrderStatus(orderId, 'served');
    notify();
  };

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const preparingOrders = orders.filter((o) => o.status === 'preparing');
  const readyOrders = orders.filter((o) => o.status === 'ready');

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Kitchen Operations</h1>
        <p className="text-slate-500 text-sm mt-1">Monitor kitchen workflow and order status</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-700 text-sm font-medium">Pending</p>
              <p className="text-3xl font-bold text-amber-900">{pendingOrders.length}</p>
            </div>
            <Clock className="text-amber-500" size={32} />
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-700 text-sm font-medium">Preparing</p>
              <p className="text-3xl font-bold text-blue-900">{preparingOrders.length}</p>
            </div>
            <ChefHat className="text-blue-500" size={32} />
          </div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-700 text-sm font-medium">Ready</p>
              <p className="text-3xl font-bold text-emerald-900">{readyOrders.length}</p>
            </div>
            <CheckCircle className="text-emerald-500" size={32} />
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending */}
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Clock size={20} className="text-amber-500" />
            Pending Orders
          </h2>
          <div className="space-y-3">
            {pendingOrders.length === 0 ? (
              <div className="bg-white rounded-xl border p-6 text-center text-slate-400 text-sm">
                No pending orders
              </div>
            ) : (
              pendingOrders.map((order) => {
                const elapsed = Math.floor((Date.now() - order.timestamp) / 60000);
                return (
                  <div key={order.id} className="bg-white rounded-xl border border-amber-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-800">Table {order.tableNumber}</span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <div className="text-xs text-slate-500 mb-2">
                      {elapsed} min ago • #{order.id.slice(-6)}
                    </div>
                    <div className="space-y-1 mb-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-sm text-slate-700">
                          {item.menuItem.imageUrl} {item.menuItem.name} × {item.quantity}
                        </div>
                      ))}
                    </div>
                    {order.customerNote && (
                      <div className="mb-3 p-2 bg-amber-50 border border-amber-100 rounded text-xs text-amber-700">
                        📝 {order.customerNote}
                      </div>
                    )}
                    {elapsed > 10 && (
                      <div className="mb-3 p-2 bg-red-50 border border-red-100 rounded text-xs text-red-600 flex items-center gap-1">
                        <AlertTriangle size={12} />
                        Delayed - {elapsed} min
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="font-bold text-slate-800">₹{order.totalAmount.toFixed(2)}</span>
                      <button
                        onClick={() => handleMarkReady(order.id)}
                        className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition"
                      >
                        Start Cooking
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Preparing */}
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <ChefHat size={20} className="text-blue-500" />
            Preparing
          </h2>
          <div className="space-y-3">
            {preparingOrders.length === 0 ? (
              <div className="bg-white rounded-xl border p-6 text-center text-slate-400 text-sm">
                No orders being prepared
              </div>
            ) : (
              preparingOrders.map((order) => {
                const elapsed = Math.floor((Date.now() - order.timestamp) / 60000);
                return (
                  <div key={order.id} className="bg-white rounded-xl border border-blue-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-800">Table {order.tableNumber}</span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <div className="text-xs text-slate-500 mb-2">
                      {elapsed} min ago • #{order.id.slice(-6)}
                    </div>
                    <div className="space-y-1 mb-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-sm text-slate-700">
                          {item.menuItem.imageUrl} {item.menuItem.name} × {item.quantity}
                        </div>
                      ))}
                    </div>
                    {order.customerNote && (
                      <div className="mb-3 p-2 bg-blue-50 border border-blue-100 rounded text-xs text-blue-700">
                        📝 {order.customerNote}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="font-bold text-slate-800">₹{order.totalAmount.toFixed(2)}</span>
                      <button
                        onClick={() => handleMarkReady(order.id)}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg transition"
                      >
                        Mark Ready
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Ready */}
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <CheckCircle size={20} className="text-emerald-500" />
            Ready to Serve
          </h2>
          <div className="space-y-3">
            {readyOrders.length === 0 ? (
              <div className="bg-white rounded-xl border p-6 text-center text-slate-400 text-sm">
                No orders ready
              </div>
            ) : (
              readyOrders.map((order) => {
                const elapsed = Math.floor((Date.now() - order.timestamp) / 60000);
                return (
                  <div key={order.id} className="bg-white rounded-xl border border-emerald-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-800">Table {order.tableNumber}</span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <div className="text-xs text-slate-500 mb-2">
                      {elapsed} min ago • #{order.id.slice(-6)}
                    </div>
                    <div className="space-y-1 mb-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-sm text-slate-700">
                          {item.menuItem.imageUrl} {item.menuItem.name} × {item.quantity}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="font-bold text-slate-800">₹{order.totalAmount.toFixed(2)}</span>
                      <button
                        onClick={() => handleMarkServed(order.id)}
                        className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white text-xs font-medium rounded-lg transition"
                      >
                        Mark Served
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
