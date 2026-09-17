import { Order } from '../../types';
import { KitchenStatusBadge } from '../UI/StatusBadge';
import { Clock, Play, CheckCircle, AlertTriangle } from 'lucide-react';

interface Props {
  order: Order;
  onStartCooking: (orderId: string) => void;
  onMarkReady: (orderId: string) => void;
}

export default function KitchenOrderCard({ order, onStartCooking, onMarkReady }: Props) {
  const elapsed = Math.floor((Date.now() - order.timestamp) / 60000);
  const isDelayed = order.status === 'pending' && elapsed > 15;
  const isUrgent = order.status === 'preparing' && elapsed > 20;

  const borderColor = isDelayed
    ? 'border-red-500 shadow-red-500/20'
    : isUrgent
    ? 'border-orange-500 shadow-orange-500/20'
    : order.status === 'pending'
    ? 'border-amber-400 shadow-amber-400/10'
    : order.status === 'preparing'
    ? 'border-blue-400 shadow-blue-400/10'
    : 'border-emerald-400 shadow-emerald-400/10';

  return (
    <div
      className={`bg-slate-800 rounded-2xl border-2 ${borderColor} shadow-xl overflow-hidden transition-all hover:shadow-2xl`}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center">
            <span className="text-2xl font-black text-white">#{order.tableNumber}</span>
          </div>
          <div>
            <p className="text-white font-bold text-lg">Table {order.tableNumber}</p>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Clock size={12} />
              <span>{elapsed} min ago</span>
              <span>•</span>
              <span>{order.id.slice(-6)}</span>
            </div>
          </div>
        </div>
        <KitchenStatusBadge status={order.status} elapsed={elapsed} />
      </div>

      {/* Order Items */}
      <div className="px-5 py-4 space-y-2">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{item.menuItem.imageUrl}</span>
              <div>
                <p className="text-white font-semibold text-base">{item.menuItem.name}</p>
                {item.quantity > 1 && (
                  <p className="text-orange-400 text-sm font-bold">× {item.quantity}</p>
                )}
              </div>
            </div>
            <span className="text-slate-400 text-sm font-mono">
              ${(item.menuItem.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Customer Note */}
      {order.customerNote && (
        <div className="mx-5 mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <div className="flex items-center gap-2 text-amber-400 mb-1">
            <AlertTriangle size={14} />
            <span className="text-xs font-bold uppercase">Special Instructions</span>
          </div>
          <p className="text-amber-200 text-sm">{order.customerNote}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-5 py-4 bg-slate-800/50 border-t border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-white font-bold text-lg">${order.totalAmount.toFixed(2)}</span>
          <div className="flex gap-2">
            {order.status === 'pending' && (
              <button
                onClick={() => onStartCooking(order.id)}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition text-sm"
              >
                <Play size={16} fill="white" />
                Start Cooking
              </button>
            )}
            {order.status === 'preparing' && (
              <button
                onClick={() => onMarkReady(order.id)}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition text-sm"
              >
                <CheckCircle size={16} />
                Mark Ready
              </button>
            )}
            {order.status === 'ready' && (
              <span className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl text-sm font-bold">
                <CheckCircle size={16} />
                Awaiting Pickup
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Delay Warning */}
      {isDelayed && (
        <div className="px-5 py-2 bg-red-500/20 border-t border-red-500/30">
          <p className="text-red-400 text-xs font-bold flex items-center gap-1">
            <AlertTriangle size={12} />
            ORDER DELAYED — {elapsed} minutes waiting
          </p>
        </div>
      )}
    </div>
  );
}
