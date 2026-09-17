import { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus, subscribe, notify } from '../store';
import { Order, OrderStatus } from '../types';
import { OrderStatusBadge } from '../components/UI/StatusBadge';
import { PageLoader } from '../components/UI/LoadingSkeleton';
import { ArrowRight, Clock, ChefHat, CheckCircle, Truck, CreditCard } from 'lucide-react';

const statusFlow: { status: OrderStatus; label: string; icon: React.ReactNode; color: string }[] = [
  { status: 'pending', label: 'Pending', icon: <Clock size={14} />, color: 'text-amber-500' },
  { status: 'preparing', label: 'Preparing', icon: <ChefHat size={14} />, color: 'text-blue-500' },
  { status: 'ready', label: 'Ready', icon: <CheckCircle size={14} />, color: 'text-emerald-500' },
  { status: 'served', label: 'Served', icon: <Truck size={14} />, color: 'text-purple-500' },
  { status: 'paid', label: 'Paid', icon: <CreditCard size={14} />, color: 'text-slate-500' },
];

export default function LiveOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setOrders(getOrders());
      setLoading(false);
    }, 500);
    const unsub = subscribe(() => setOrders(getOrders()));
    const interval = setInterval(() => setOrders(getOrders()), 2000);
    return () => { unsub(); clearInterval(interval); };
  }, []);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    notify();
    setOrders(getOrders());
  };

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    const flow: Record<OrderStatus, OrderStatus | null> = {
      pending: 'preparing',
      preparing: 'ready',
      ready: 'served',
      served: 'paid',
      paid: null,
    };
    return flow[current];
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter((o) => o.status === filter);
  const activeOrders = orders.filter((o) => ['pending', 'preparing', 'ready'].includes(o.status));

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Live Orders</h1>
          <p className="text-slate-500 text-sm mt-1">
            {activeOrders.length} active orders • Real-time updates
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <FilterTab
          active={filter === 'all'}
          onClick={() => setFilter('all')}
          label={`All (${orders.length})`}
        />
        {statusFlow.map((s) => {
          const count = orders.filter((o) => o.status === s.status).length;
          return (
            <FilterTab
              key={s.status}
              active={filter === s.status}
              onClick={() => setFilter(s.status)}
              label={`${s.label} (${count})`}
            />
          );
        })}
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <span className="text-4xl mb-3 block">📋</span>
          <p className="text-slate-500 font-medium">No orders found</p>
          <p className="text-slate-400 text-sm mt-1">
            {filter === 'all' ? 'Orders will appear here as they come in' : `No ${filter} orders`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredOrders.map((order) => {
            const nextStatus = getNextStatus(order.status);
            const elapsed = Math.floor((Date.now() - order.timestamp) / 60000);

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
              >
                {/* Order Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center">
                      <span className="text-lg font-bold text-indigo-600">T{order.tableNumber}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">Table {order.tableNumber}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock size={10} />
                        {elapsed} min ago • #{order.id.slice(-6)}
                      </p>
                    </div>
                  </div>
                  <OrderStatusBadge status={order.status} size="md" />
                </div>

                {/* Items */}
                <div className="space-y-2 mb-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span>{item.menuItem.imageUrl}</span>
                        <span className="text-slate-700">{item.menuItem.name}</span>
                        <span className="text-slate-400">×{item.quantity}</span>
                      </div>
                      <span className="text-slate-500 font-medium">
                        ${(item.menuItem.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Note */}
                {order.customerNote && (
                  <div className="mb-4 p-2.5 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-700">
                    📝 {order.customerNote}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="font-bold text-slate-800">${order.totalAmount.toFixed(2)}</span>
                  {nextStatus && (
                    <button
                      onClick={() => handleStatusChange(order.id, nextStatus)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition"
                    >
                      → {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterTab({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
        active
          ? 'bg-indigo-500 text-white shadow-sm'
          : 'bg-white text-slate-600 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
      }`}
    >
      {label}
    </button>
  );
}
