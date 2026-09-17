import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getMenuItems, getTables, placeOrder, notify } from '../store';
import { MenuItem, CartItem } from '../types';
import { ShoppingCart, Plus, Minus, X, Search, ChevronDown, Send } from 'lucide-react';

export default function CustomerMenu() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tableId = searchParams.get('tableId');

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      const items = getMenuItems().filter((item) => item.available);
      setMenuItems(items);
      setLoading(false);
    }, 800);
  }, []);

  if (!tableId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <span className="text-5xl mb-4 block">🍽️</span>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Welcome!</h1>
          <p className="text-gray-500">Please scan the QR code on your table to view the menu.</p>
        </div>
      </div>
    );
  }

  const tableNumber = parseInt(tableId);
  const tables = getTables();
  const table = tables.find((t) => t.number === tableNumber);

  if (!table) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <span className="text-5xl mb-4 block">❌</span>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Table Not Found</h1>
          <p className="text-gray-500">This table doesn't exist. Please ask staff for assistance.</p>
        </div>
      </div>
    );
  }

  const categories = ['All', ...new Set(menuItems.map((item) => item.category))];

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map((c) =>
          c.menuItem.id === itemId ? { ...c, quantity: c.quantity - 1 } : c
        );
      }
      return prev.filter((c) => c.menuItem.id !== itemId);
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    setPlacingOrder(true);

    const orderItems = cart.map((item) => ({
      menuItem: item.menuItem,
      quantity: item.quantity,
    }));

    setTimeout(() => {
      placeOrder(tableNumber, orderItems, cartTotal, customerNote || undefined);
      notify();
      setCart([]);
      setCustomerNote('');
      navigate(`/order-confirmation?tableId=${tableId}`);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-500 to-orange-500 text-white sticky top-0 z-40 shadow-lg">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-lg font-bold">🍽️ Our Menu</h1>
              <p className="text-amber-100 text-sm">Table {tableNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-amber-100">Welcome!</p>
              <p className="text-sm font-medium">Scan & Order</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-300" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search menu items..."
              className="w-full pl-9 pr-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-amber-200 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
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
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-white text-amber-700'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Menu Items */}
      <div className="px-4 py-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl mb-4 block">🔍</span>
            <p className="text-gray-500">No items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredItems.map((item) => {
              const cartItem = cart.find((c) => c.menuItem.id === item.id);
              const quantity = cartItem?.quantity || 0;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border shadow-sm overflow-hidden flex"
                >
                  <div className="flex-1 p-3">
                    <h3 className="font-semibold text-gray-800 text-sm">{item.name}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-bold text-amber-600">${item.price.toFixed(2)}</span>
                      {quantity === 0 ? (
                        <button
                          onClick={() => addToCart(item)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-full transition"
                        >
                          <Plus size={14} /> Add
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-sm font-bold text-gray-800 w-4 text-center">{quantity}</span>
                          <button
                            onClick={() => addToCart(item)}
                            className="w-7 h-7 flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white rounded-full transition"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="w-20 bg-gray-50 flex items-center justify-center text-3xl border-l">
                    {item.imageUrl}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cart Bottom Bar */}
      {cartCount > 0 && !showCart && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
          <button
            onClick={() => setShowCart(true)}
            className="w-full px-4 py-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart className="text-amber-600" size={24} />
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              </div>
              <span className="font-medium text-gray-800">View Cart</span>
            </div>
            <span className="font-bold text-amber-600 text-lg">${cartTotal.toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCart(false)}></div>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold text-gray-800">Your Order</h2>
              <button
                onClick={() => setShowCart(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {cart.map((item) => (
                <div key={item.menuItem.id} className="flex items-center gap-3 py-3 border-b last:border-0">
                  <span className="text-2xl">{item.menuItem.imageUrl}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm">{item.menuItem.name}</p>
                    <p className="text-amber-600 text-sm">${item.menuItem.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => removeFromCart(item.menuItem.id)}
                      className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => addToCart(item.menuItem)}
                      className="w-7 h-7 flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white rounded-full"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="font-medium text-gray-800 w-16 text-right">
                    ${(item.menuItem.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}

              {/* Customer Note */}
              <div className="mt-4 pt-4 border-t">
                <button
                  onClick={() => setShowNoteInput(!showNoteInput)}
                  className="flex items-center gap-2 text-sm text-amber-600 font-medium"
                >
                  <ChevronDown size={16} className={`transition ${showNoteInput ? 'rotate-180' : ''}`} />
                  Add special instructions
                </button>
                {showNoteInput && (
                  <textarea
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    placeholder="e.g., No onions, extra spicy..."
                    className="w-full mt-2 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                    rows={2}
                  />
                )}
              </div>
            </div>

            {/* Cart Footer */}
            <div className="border-t p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-600">Total</span>
                <span className="text-xl font-bold text-gray-800">${cartTotal.toFixed(2)}</span>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={placingOrder}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {placingOrder ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Placing Order...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Place Order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
