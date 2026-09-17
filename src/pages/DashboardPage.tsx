import { useState, useEffect } from 'react';
import { getDashboardStats, getOrders, subscribe } from '../store';
import { Order } from '../types';
import { OrderStatusBadge } from '../components/UI/StatusBadge';
import { SkeletonStat } from '../components/UI/LoadingSkeleton';
import { DollarSign, ShoppingBag, Users, Clock, TrendingUp, ArrowUpRight } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState(getDashboardStats());
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setStats(getDashboardStats());
      setRecentOrders(getOrders().slice(0, 6));
      setLoading(false);
    }, 600);
    const unsub = subscribe(() => {
      setStats(getDashboardStats());
      setRecentOrders(getOrders().slice(0, 6));
    });
    const interval = setInterval(() => {
      setStats(getDashboardStats());
      setRecentOrders(getOrders().slice(0, 6));
    }, 3000);
    return () => { unsub(); clearInterval(interval); };
  }, []);

  const statCards = [
    { title: "Today's Revenue", value: `₹${stats.todayRevenue.toFixed(2)}`, icon: DollarSign, color: 'emerald' },
    { title: 'Total Orders', value: stats.totalOrders.toString(), icon: ShoppingBag, color: 'indigo' },
    { title: 'Active Tables', value: `${stats.occupiedTables}/${stats.totalTables}`, icon: Users, color: 'amber' },
    { title: 'Pending Orders', value: stats.pendingOrders.toString(), icon: Clock, color: 'red' },
  ];

  const colorClasses: Record<string, { bg: string; text: string; light: string }> = {
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50' },
    indigo: { bg: 'bg-indigo-500', text: 'text-indigo-600', light: 'bg-indigo-50' },
    amber: { bg: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-50' },
    red: { bg: 'bg-red-500', text: 'text-red-600', light: 'bg-red-50' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time restaurant metrics</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <TrendingUp size={14} className="text-emerald-500" />
          <span>Live data</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonStat key={i} />)
          : statCards.map((card, idx) => {
              const colors = colorClasses[card.color];
              return (
                <div key={idx} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 ${colors.light} rounded-lg flex items-center justify-center`}>
                      <card.icon size={20} className={colors.text} />
                    </div>
                    <ArrowUpRight size={14} className="text-emerald-500" />
                  </div>
                  <p className="text-2xl font-bold text-slate-800">{card.value}</p>
                  <p className="text-sm text-slate-500 mt-1">{card.title}</p>
                </div>
              );
            })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-slate-800">Recent Orders</h2>
        </div>
        {recentOrders.length === 0 ? (
          <div className="p-12 text-center">
            <span className="text-4xl mb-3 block">📋</span>
            <p className="text-slate-500">No orders yet</p>
            <p className="text-slate-400 text-sm mt-1">Use "Simulate Order" to test the system</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentOrders.map((order) => (
              <div key={order.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold text-slate-600">T{order.tableNumber}</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 text-sm">
                      {order.items.length} items • Table {order.tableNumber}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(order.timestamp).toLocaleTimeString()} • #{order.id.slice(-6)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-800 text-sm">₹{order.totalAmount.toFixed(2)}</span>
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
