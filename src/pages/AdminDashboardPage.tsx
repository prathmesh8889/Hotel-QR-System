import { useState, useEffect } from 'react';
import { getDashboardStats, getOrders, subscribe } from '../store';
import { Order } from '../types';
import { OrderStatusBadge } from '../components/UI/StatusBadge';
import { SkeletonStat } from '../components/UI/LoadingSkeleton';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(getDashboardStats());
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setStats(getDashboardStats());
      setRecentOrders(getOrders().slice(0, 5));
      setLoading(false);
    }, 600);

    const unsub = subscribe(() => {
      setStats(getDashboardStats());
      setRecentOrders(getOrders().slice(0, 5));
    });
    const interval = setInterval(() => {
      setStats(getDashboardStats());
      setRecentOrders(getOrders().slice(0, 5));
    }, 3000);
    return () => { unsub(); clearInterval(interval); };
  }, []);

  const statCards = [
    {
      title: "Today's Revenue",
      value: `$${stats.todayRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      change: '+12.5%',
      up: true,
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      icon: ShoppingBag,
      color: 'bg-indigo-500',
      lightColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      change: '+8.2%',
      up: true,
    },
    {
      title: 'Active Tables',
      value: `${stats.occupiedTables}/${stats.totalTables}`,
      icon: Users,
      color: 'bg-amber-500',
      lightColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      change: `${Math.round((stats.occupiedTables / stats.totalTables) * 100)}%`,
      up: stats.occupiedTables > stats.totalTables / 2,
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders.toString(),
      icon: Clock,
      color: 'bg-red-500',
      lightColor: 'bg-red-50',
      textColor: 'text-red-600',
      change: stats.pendingOrders > 3 ? 'High' : 'Normal',
      up: stats.pendingOrders <= 3,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
          <p className="text-slate-500 text-sm mt-1">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <TrendingUp size={16} className="text-emerald-500" />
          <span>Live data • Auto-refreshing</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonStat key={i} />)
          : statCards.map((card, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 ${card.lightColor} rounded-lg flex items-center justify-center`}>
                    <card.icon size={20} className={card.textColor} />
                  </div>
                  <span className={`flex items-center gap-0.5 text-xs font-medium ${card.up ? 'text-emerald-600' : 'text-red-500'}`}>
                    {card.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {card.change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-800">{card.value}</p>
                <p className="text-sm text-slate-500 mt-1">{card.title}</p>
              </div>
            ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Recent Orders</h2>
          <span className="text-xs text-slate-500">Last 5 orders</span>
        </div>
        {recentOrders.length === 0 ? (
          <div className="p-12 text-center">
            <span className="text-4xl mb-3 block">📋</span>
            <p className="text-slate-500">No orders yet today</p>
            <p className="text-slate-400 text-sm mt-1">Orders will appear here as they come in</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentOrders.map((order) => (
              <div key={order.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-slate-600">T{order.tableNumber}</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 text-sm">
                      {order.items.length} item{order.items.length > 1 ? 's' : ''} • Table {order.tableNumber}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(order.timestamp).toLocaleTimeString()} • #{order.id.slice(-6)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-800 text-sm">${order.totalAmount.toFixed(2)}</span>
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-5 text-white">
          <h3 className="font-semibold mb-1">Manage Menu</h3>
          <p className="text-indigo-100 text-sm mb-3">Add or update food items</p>
          <a href="/admin/menu" className="text-sm font-medium underline underline-offset-2">
            Go to Menu →
          </a>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-5 text-white">
          <h3 className="font-semibold mb-1">Table QR Codes</h3>
          <p className="text-amber-100 text-sm mb-3">Generate & print QR codes</p>
          <a href="/admin/tables" className="text-sm font-medium underline underline-offset-2">
            Manage Tables →
          </a>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl p-5 text-white">
          <h3 className="font-semibold mb-1">Kitchen View</h3>
          <p className="text-emerald-100 text-sm mb-3">Switch to kitchen display</p>
          <a href="/kitchen" className="text-sm font-medium underline underline-offset-2">
            Open KDS →
          </a>
        </div>
      </div>
    </div>
  );
}
