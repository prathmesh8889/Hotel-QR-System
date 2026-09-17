import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Table2,
  ClipboardList,
  Settings,
  LogOut,
  Menu,
  X,
  ChefHat,
  Bell,
  ChevronRight,
} from 'lucide-react';
import { getOrders, subscribe } from '../../store';
import { useEffect } from 'react';

const adminNavItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/orders', icon: ClipboardList, label: 'Live Orders', end: false },
  { to: '/admin/menu', icon: UtensilsCrossed, label: 'Menu Management', end: false },
  { to: '/admin/tables', icon: Table2, label: 'Tables & QR Codes', end: false },
  { to: '/admin/settings', icon: Settings, label: 'Settings', end: false },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const update = () => {
      const orders = getOrders();
      setPendingCount(orders.filter((o) => o.status === 'pending').length);
    };
    update();
    const unsub = subscribe(update);
    const interval = setInterval(update, 2000);
    return () => { unsub(); clearInterval(interval); };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex-shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700/50">
            <div className="w-9 h-9 bg-indigo-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">🍽️</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-sm">HotelOS</h1>
              <p className="text-slate-400 text-xs">Admin Panel</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto lg:hidden text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {adminNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <item.icon size={18} />
                <span className="flex-1">{item.label}</span>
                {item.label === 'Live Orders' && pendingCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold animate-pulse">
                    {pendingCount}
                  </span>
                )}
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition" />
              </NavLink>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-slate-700/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {auth.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{auth.username}</p>
                <p className="text-slate-400 text-xs capitalize">{auth.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition text-sm"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 lg:px-6 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <Menu size={20} />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  {adminNavItems.find((item) => window.location.pathname === item.to)?.label || 'Dashboard'}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {pendingCount > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-sm font-medium">
                  <Bell size={14} className="animate-bounce" />
                  <span>{pendingCount} pending</span>
                </div>
              )}
              <button
                onClick={() => navigate('/kitchen')}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-sm transition"
              >
                <ChefHat size={16} />
                Kitchen View
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
