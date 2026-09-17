import { useState, useEffect } from 'react';
import { getOrders } from '../store';
import { Order } from '../types';
import { OrderStatusBadge } from '../components/UI/StatusBadge';
import { Clock, CheckCircle } from 'lucide-react';

export default function KitchenHistory() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const completed = getOrders().filter((o) => ['served', 'paid'].includes(o.status));
    setOrders(completed);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Completed Orders</h1>
        <p className="text-slate-400 text-sm mt-1">{orders.length} orders completed</p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <CheckCircle className="text-slate-600 mb-4" size={48} />
          <p className="text-slate-400">No completed orders yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-slate-800 rounded-xl border border-slate-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-bold">Table {order.tableNumber}</span>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="space-y-1 mb-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm text-slate-400">
                    <span>{item.menuItem.imageUrl} {item.menuItem.name} ×{item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                <span className="text-slate-400 text-sm flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(order.timestamp).toLocaleTimeString()}
                </span>
                <span className="text-white font-bold">${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
