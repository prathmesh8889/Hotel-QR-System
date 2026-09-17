import { NavLink, Outlet, useSearchParams } from 'react-router-dom';
import { Home, ShoppingCart, ClipboardList } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function CustomerLayout() {
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get('tableId');
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('customer_cart') || '[]');
        setCartCount(cart.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0));
      } catch {
        setCartCount(0);
      }
    };
    updateCartCount();
    const interval = setInterval(updateCartCount, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Outlet context={{ tableId }} />

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          <NavLink
            to={`/menu?tableId=${tableId}`}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-3 px-4 transition ${
                isActive ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            <Home size={22} />
            <span className="text-xs font-medium">Menu</span>
          </NavLink>

          <NavLink
            to={`/menu?tableId=${tableId}&view=cart`}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-1 py-3 px-4 transition ${
                isActive ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            <div className="relative">
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-xs font-medium">Cart</span>
          </NavLink>

          <NavLink
            to={`/order-status?tableId=${tableId}`}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-3 px-4 transition ${
                isActive ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            <ClipboardList size={22} />
            <span className="text-xs font-medium">Orders</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
