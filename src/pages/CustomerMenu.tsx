import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getMenuItems, getTables, getSettings, placeOrder, notify } from '../store';
import { MenuItem, CartItem } from '../types';
import MenuCard from '../components/Menu/MenuCard';
import { SkeletonCard } from '../components/UI/LoadingSkeleton';
import { ShoppingCart, X, Send, Search, ChevronDown, UtensilsCrossed } from 'lucide-react';

export default function CustomerMenu() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tableId = searchParams.get('tableId');

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setMenuItems(getMenuItems().filter((i) => i.available));
      setLoading(false);
    }, 600);
  }, []);

  // Sync cart to localStorage for bottom nav count
  useEffect(() => {
    localStorage.setItem('customer_cart', JSON.stringify(cart));
  }, [cart]);

  if (!tableId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <span className="text-6xl mb-4 block">🍽️</span>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Welcome!</h1>
          <p className="text-gray-500">Please scan the QR code on your table to view the menu and place your order.</p>
        </div>
      </div>
    );
  }

  const tableNumber = parseInt(tableId);
  const tables = getTables();
  const table = tables.find((t) => t.number === tableNumber);
  const settings = getSettings();

  if (!table) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <span className="text-5xl mb-4 block">❌</span>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Table Not Found</h1>
          <p className="text-gray-500">Please ask staff for assistance.</p>
        </div>
      </div>
    );
  }

  const categories = ['All', ...new Set(menuItems.map((i) => i.category))];
  const filteredItems = menuItems.filter((item) => {
    const matchCat = activeCategory === 'All' || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === item.id);
      if (existing) return prev.map((c) => c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === itemId);
      if (existing && existing.quantity > 1) return prev.map((c) => c.menuItem.id === itemId ? { ...c, quantity: c.quantity - 1 } : c);
      return prev.filter((c) => c.menuItem.id !== itemId);
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    setPlacing(true);
    const orderItems = cart.map((item) => ({ menuItem: item.menuItem, quantity: item.quantity }));
    setTimeout(() => {
      placeOrder(tableNumber, orderItems, cartTotal, customerNote || undefined);
      notify();
      setCart([]);
      setCustomerNote('');
      localStorage.removeItem('customer_cart');
      navigate(`/order-confirmation?tableId=${tableId}`);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-amber-500 text-white sticky top-0 z-40 shadow-lg">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2">
                <UtensilsCrossed size={20} />
                {settings.name}
              </h1>
              <p className="text-orange-100 text-sm">Table {tableNumber} • {settings.address}</p>
            </div>
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-200" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search menu..."
              className="w-full pl-9 pr-4 py-2.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-orange-200 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
            />
          </div>
        </div>
        {/* Categories */}
        <div className="px-4 pb-3 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap ${
                  activeCategory === cat ? 'bg-white text-orange-700 shadow-sm' : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Menu Items */}
      <div className="px-4 py-4 space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl mb-3 block">🔍</span>
            <p className="text-gray-500">No items found</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const qty = cart.find((c) => c.menuItem.id === item.id)?.quantity || 0;
            return <MenuCard key={item.id} item={item} quantity={qty} onAdd={() => addToCart(item)} onRemove={() => removeFromCart(item.id)} />;
          })
        )}
      </div>

      {/* Cart Bottom Bar */}
      {cartCount > 0 && !showCart && (
        <div className="fixed bottom-16 left-4 right-4 z-40">
          <button
            onClick={() => setShowCart(true)}
            className="w-full flex items-center justify-between px-5 py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl shadow-xl shadow-orange-500/30 transition"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart size={22} />
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-orange-600 text-xs rounded-full flex items-center justify-center font-bold">{cartCount}</span>
              </div>
              <span className="font-semibold">View Cart</span>
            </div>
            <span className="font-bold text-lg">${cartTotal.toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCart(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-xl font-bold text-gray-800">Your Order</h2>
              <button onClick={() => setShowCart(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {cart.map((item) => (
                <div key={item.menuItem.id} className="flex items-center gap-3 py-3 border-b last:border-0">
                  <span className="text-2xl">{item.menuItem.imageUrl}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{item.menuItem.name}</p>
                    <p className="text-orange-600 text-sm">${item.menuItem.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => removeFromCart(item.menuItem.id)} className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full"><X size={14} /></button>
                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                    <button onClick={() => addToCart(item.menuItem)} className="w-7 h-7 flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white rounded-full text-xs font-bold">+</button>
                  </div>
                  <span className="font-semibold text-gray-800 w-16 text-right text-sm">${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              {/* Note */}
              <div className="mt-4 pt-4 border-t">
                <button onClick={() => setShowNote(!showNote)} className="flex items-center gap-2 text-sm text-orange-600 font-medium">
                  <ChevronDown size={16} className={`transition ${showNote ? 'rotate-180' : ''}`} />
                  Add special instructions
                </button>
                {showNote && (
                  <textarea value={customerNote} onChange={(e) => setCustomerNote(e.target.value)} placeholder="e.g., No onions, extra spicy..." className="w-full mt-2 px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none" rows={2} />
                )}
              </div>
            </div>
            <div className="border-t p-5 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600 font-medium">Total</span>
                <span className="text-2xl font-bold text-gray-800">${cartTotal.toFixed(2)}</span>
              </div>
              <button onClick={handlePlaceOrder} disabled={placing} className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-orange-500/30">
                {placing ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Placing Order...</>) : (<><Send size={18} />Place Order</>)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
