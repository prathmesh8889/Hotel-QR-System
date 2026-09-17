import { useEffect, useState } from 'react';
import { getAnalyticsData } from '../store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, ShoppingBag, Clock, Star, Award } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadAnalytics = () => {
    const data = getAnalyticsData();
    setAnalytics(data);
    setLoading(false);
  };

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Analytics Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time business insights</p>
        </div>
        <button
          onClick={loadAnalytics}
          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition text-sm"
        >
          Refresh
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-sm">Today's Orders</span>
            <ShoppingBag className="text-indigo-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-slate-800">{analytics.totalOrders}</p>
          <p className="text-xs text-slate-500 mt-1">Orders placed today</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-sm">Total Revenue</span>
            <DollarSign className="text-emerald-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-slate-800">₹{analytics.totalRevenue.toFixed(0)}</p>
          <p className="text-xs text-slate-500 mt-1">Today's earnings</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-sm">Avg Order Value</span>
            <TrendingUp className="text-blue-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-slate-800">₹{analytics.avgOrderValue.toFixed(0)}</p>
          <p className="text-xs text-slate-500 mt-1">Per order average</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-sm">Avg Rating</span>
            <Star className="text-amber-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-slate-800">
            {analytics.avgRating > 0 ? analytics.avgRating.toFixed(1) : 'N/A'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {analytics.totalRatedOrders > 0 
              ? `From ${analytics.totalRatedOrders} reviews` 
              : 'No ratings yet'}
          </p>
        </div>
      </div>

      {/* Top Selling Items */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Award className="text-amber-500" size={20} />
          Top Selling Items
        </h2>
        {analytics.topItems.length > 0 ? (
          <div className="space-y-3">
            {analytics.topItems.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.emoji}</span>
                  <div>
                    <p className="font-medium text-slate-800">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.count} orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-emerald-600">₹{item.revenue.toFixed(0)}</p>
                  <p className="text-xs text-slate-500">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-8">No sales data yet</p>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Hours */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Clock className="text-blue-500" size={20} />
            Peak Hour
          </h2>
          <div className="text-center py-8">
            <p className="text-5xl font-bold text-blue-600">{analytics.peakHour}:00</p>
            <p className="text-slate-500 mt-2">
              {analytics.peakHour < 12 ? 'Morning' : analytics.peakHour < 17 ? 'Afternoon' : 'Evening'}
            </p>
            <p className="text-sm text-slate-400 mt-1">Busiest time of day</p>
          </div>
        </div>

        {/* Revenue by Category (Pie Chart) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Revenue Distribution</h2>
          {analytics.topItems.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analytics.topItems}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {analytics.topItems.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `₹${value.toFixed(0)}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-center py-8">No data available</p>
          )}
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <h2 className="text-lg font-semibold mb-4">Performance Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-indigo-100 text-sm">Total Orders</p>
            <p className="text-2xl font-bold">{analytics.totalOrders}</p>
          </div>
          <div>
            <p className="text-indigo-100 text-sm">Revenue Growth</p>
            <p className="text-2xl font-bold">₹{analytics.totalRevenue.toFixed(0)}</p>
          </div>
          <div>
            <p className="text-indigo-100 text-sm">Customer Satisfaction</p>
            <p className="text-2xl font-bold">
              {analytics.avgRating > 0 ? `${analytics.avgRating.toFixed(1)}/5` : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
