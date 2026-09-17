import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getOrders } from '../store';
import { Order } from '../types';
import { OrderStatusBadge } from '../components/UI/StatusBadge';
import { Clock, ChefHat, CheckCircle, Truck, CreditCard, Package } from 'lucide-react';

const statusSteps = [
  { status: 'pending', label: 'Order Received', icon: Package, color: 'text-amber-500', bg: 'bg-amber-500' },
  { status: 'preparing', label: 'Being Prepared', icon: ChefHat, color: 'text-blue-500', bg: 'bg-blue-500' },
  { status: 'ready', label: 'Ready to Serve', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500' },
  { status: 'served', label: 'Served', icon: Truck, color: 'text-purple-500', bg: 'bg-purple-500' },
  { status: 'paid', label: 'Completed', icon: CreditCard, color: 'text-slate-500', bg: 'bg-slate-500' },
];

export default function OrderStatus() {
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get('tableId');
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const load = () => {
      const allOrders = getOrders();
      const tableOrders = allOrders.filter((o) => o.tableNumber === parseInt(tableId || '0'));
      setOrders(tableOrders.slice(0, 5));
    };
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [tableId]);

  const getStatusIndex = (status: string) => statusSteps.findIndex((s) => s.status === status);

  return (
    <div className="min-h-screen bg-gray-50 pt-4 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-gray-800 mb-1">Order Status</h1>
        <p className="text-gray-500 text-sm mb-6">Table {tableId} • Tracking your orders</p>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl mb-4 block">📋</span>
            <p className="text-gray-500 font-medium">No orders yet</p>
            <p className="text-gray-400 text-sm mt-1">Place an order to see its status here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const currentIdx = getStatusIndex(order.status);
              const elapsed = Math.floor((Date.now() - order.timestamp) / 60000);

              return (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-bold text-gray-800">Order #{order.id.slice(-6)}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock size={10} /> {elapsed} min ago • ${order.totalAmount.toFixed(2)}
                      </p>
                    </div>
                    <OrderStatusBadge status={order.status} size="md" />
                  </div>

                  {/* Progress Steps */}
                  <div className="flex items-center gap-1 mb-4">
                    {statusSteps.slice(0, 4).map((step, idx) => (
                      <div key={step.status} className="flex-1 flex items-center">
                        <div className={`w-full h-2 rounded-full ${idx <= currentIdx ? step.bg : 'bg-gray-200'} transition-all duration-500`} />
                      </div>
                    ))}
                  </div>

                  {/* Current Status Label */}
                  <p className="text-sm text-gray-600 mb-3">
                    {statusSteps[currentIdx] && (
                      <span className="flex items-center gap-1.5">
                        {(() => { const Icon = statusSteps[currentIdx].icon; return <Icon size={14} className={statusSteps[currentIdx].color} />; })()}
                        {statusSteps[currentIdx].label}
                      </span>
                    )}
                  </p>

                  {/* Items Summary */}
                  <div className="text-xs text-gray-500 space-y-1">
                    {order.items.map((item, idx) => (
                      <p key={idx}>{item.menuItem.imageUrl} {item.menuItem.name} × {item.quantity}</p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
