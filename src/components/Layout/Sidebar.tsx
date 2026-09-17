import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  Table2,
  LogOut,
  X,
  ChevronRight,
  Settings,
  Users,
  ChefHat,
  BarChart3,
  History,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = auth.role === 'admin';

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', show: true },
    { to: '/live-orders', icon: ClipboardList, label: 'Live Orders', show: true },
    { to: '/analytics', icon: BarChart3, label: 'Analytics', show: isAdmin },
    { to: '/order-history', icon: History, label: 'Order History', show: isAdmin },
    { to: '/kitchen', icon: ChefHat, label: 'Kitchen', show: isAdmin },
    { to: '/menu-management', icon: UtensilsCrossed, label: 'Menu Management', show: isAdmin },
    { to: '/table-management', icon: Table2, label: 'Tables & QR Codes', show: isAdmin },
    { to: '/staff', icon: Users, label: 'Staff Management', show: isAdmin },
    { to: '/settings', icon: Settings, label: 'Settings', show: isAdmin },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex-shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700/50">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white text-lg">🍽️</span>
            </div>
            <div className="flex-1">
              <h1 className="text-white font-bold text-sm">HotelOS</h1>
              <p className="text-slate-400 text-xs">Management Portal</p>
            </div>
            <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.filter(item => item.show).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
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
    </>
  );
}
