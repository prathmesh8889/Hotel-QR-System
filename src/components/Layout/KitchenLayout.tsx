import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Menu, X, ChefHat, Bell, Clock, LayoutDashboard } from 'lucide-react';
import { getActiveOrders, subscribe } from '../../store';

const kitchenNavItems = [
  { to: '/kitchen', icon: LayoutDashboard, label: 'Active Orders', end: true },
  { to: '/kitchen/history', icon: Clock, label: 'History', end: false },
];

export default function KitchenLayout() {
  const [navOpen, setNavOpen] = useState(false);
  const [activeCount, setActiveCount] = useState(0);
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const update = () => {
      setActiveCount(getActiveOrders().length);
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
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Kitchen Top Bar */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setNavOpen(!navOpen)}
              className="md:hidden p-2 text-slate-400 hover:bg-slate-700 rounded-lg"
            >
              {navOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-2">
              <ChefHat className="text-orange-400" size={24} />
              <div>
                <h1 className="text-white font-bold text-sm leading-tight">Kitchen Display</h1>
                <p className="text-slate-400 text-xs">KDS System</p>
              </div>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {kitchenNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-orange-500/20 text-orange-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700'
                  }`
                }
              >
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {activeCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-full text-sm font-bold">
                <Bell size={14} className="animate-pulse" />
                {activeCount} Active
              </div>
            )}
            <div className="hidden sm:flex items-center gap-2 text-slate-400 text-sm">
              <span>{auth.username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {navOpen && (
          <nav className="md:hidden border-t border-slate-700 px-4 py-2 space-y-1">
            {kitchenNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setNavOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-orange-500/20 text-orange-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700'
                  }`
                }
              >
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      {/* Kitchen Content */}
      <main className="flex-1 p-4 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
