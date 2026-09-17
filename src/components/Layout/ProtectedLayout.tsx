import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, Bell, Plus } from 'lucide-react';
import { getOrders, subscribeToOrders, simulateNewOrder } from '../../store';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/live-orders': 'Live Orders',
  '/analytics': 'Analytics Dashboard',
  '/order-history': 'Order History',
  '/kitchen': 'Kitchen Operations',
  '/menu-management': 'Menu Management',
  '/table-management': 'Tables & QR Codes',
  '/staff': 'Staff Management',
  '/settings': 'Settings',
};

export default function ProtectedLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [flashNew, setFlashNew] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const update = async () => {
      const orders = await getOrders();
      const count = orders.filter((o) => o.status === 'pending').length;
      if (count > pendingCount && pendingCount >= 0) {
        setFlashNew(true);
        setTimeout(() => setFlashNew(false), 2000);
      }
      setPendingCount(count);
    };
    update();
    const sub = subscribeToOrders(() => update());
    const interval = setInterval(update, 3000);
    return () => { sub.unsubscribe(); clearInterval(interval); };
  }, [pendingCount]);

  const currentPageTitle = pageTitles[location.pathname] || 'Dashboard';

  const handleSimulateOrder = async () => {
    try {
      await simulateNewOrder();
    } catch (e) {
      console.error('Failed to simulate order:', e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 lg:px-6 py-3">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                <Menu size={20} />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-slate-800">{currentPageTitle}</h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleSimulateOrder} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium transition" title="Simulate a new order for testing">
                <Plus size={14} />
                <span className="hidden sm:inline">Simulate Order</span>
              </button>
              {pendingCount > 0 && (
                <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${flashNew ? 'bg-red-500 text-white scale-105' : 'bg-red-50 text-red-600'}`}>
                  <Bell size={14} className={flashNew ? 'animate-bounce' : ''} />
                  <span>{pendingCount} pending</span>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
