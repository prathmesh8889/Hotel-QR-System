import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getMenuItems, getTables, getSettings, placeOrder, notify } from '../store';
import { MenuItem, CartItem, Order } from '../types';
import { User, Phone, ShoppingBag, CheckCircle, Receipt } from 'lucide-react';

export default function CustomerFlow() {
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get('tableId');

  const [step, setStep] = useState<'contact' | 'menu' | 'bill'>('contact');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerNote, setCustomerNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setMenuItems(getMenuItems().filter((i) => i.available));
      setLoading(false);
    }, 600);
  }, []);

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

  const [phoneError, setPhoneError] = useState('');

  const validatePhone = (phone: string): boolean => {
    // Indian phone number validation: +91 followed by 10 digits, or just 10 digits
    const phoneRegex = /^(\+91[-\s]?)?[6-9]\d{9}$/;
    const cleanPhone = phone.replace(/[-\s]/g, '');
    return phoneRegex.test(cleanPhone) || /^\d{10}$/.test(cleanPhone);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePhone(customerPhone)) {
      setPhoneError('Please enter a valid 10-digit Indian phone number');
      return;
    }
    
    setPhoneError('');
    setStep('menu');
  };

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === item.id);
      if (existing) {
        return prev.map((c) => c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map((c) => c.menuItem.id === itemId ? { ...c, quantity: c.quantity - 1 } : c);
      }
      return prev.filter((c) => c.menuItem.id !== itemId);
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setPlacing(true);
    const orderItems = cart.map((item) => ({ menuItem: item.menuItem, quantity: item.quantity }));
    
    try {
      const order = await placeOrder(
        tableNumber,
        orderItems,
        cartTotal,
        customerName,
        customerPhone,
        customerNote || undefined
      );
      
      if (order) {
        setCompletedOrder(order);
        setStep('bill');
      } else {
        alert('Order place करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.');
      }
    } catch (error) {
      console.error('Order placement error:', error);
      alert('Order place करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.');
    }
    
    setPlacing(false);
  };

  // Step 1: Contact Information
  if (step === 'contact') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="text-orange-600" size={32} />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome to {settings.name}</h1>
              <p className="text-gray-500 text-sm">Table {tableNumber}</p>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                    placeholder="Enter your name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => {
                      setCustomerPhone(e.target.value);
                      if (phoneError) setPhoneError('');
                    }}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm ${
                      phoneError ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
                {phoneError && (
                  <p className="mt-1 text-xs text-red-600">{phoneError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition shadow-lg shadow-orange-500/30"
              >
                View Menu
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Menu
  if (step === 'menu') {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <header className="bg-gradient-to-r from-orange-500 to-amber-500 text-white sticky top-0 z-40 shadow-lg">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-lg font-bold">{settings.name}</h1>
                <p className="text-orange-100 text-sm">Table {tableNumber} • {customerName}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="px-4 py-4 space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading menu...</p>
            </div>
          ) : (
            menuItems.map((item) => {
              const qty = cart.find((c) => c.menuItem.id === item.id)?.quantity || 0;
              return (
                <div key={item.id} className="bg-white rounded-xl border shadow-sm overflow-hidden flex">
                  <div className="flex-1 p-3">
                    <h3 className="font-semibold text-gray-800 text-sm">{item.name}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-bold text-orange-600">₹{item.price.toFixed(2)}</span>
                      {qty === 0 ? (
                        <button
                          onClick={() => addToCart(item)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium rounded-full transition"
                        >
                          Add
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full"
                          >
                            -
                          </button>
                          <span className="text-sm font-bold w-4 text-center">{qty}</span>
                          <button
                            onClick={() => addToCart(item)}
                            className="w-7 h-7 flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white rounded-full"
                          >
                            +
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
            })
          )}
        </div>

        {/* Cart Bottom Bar */}
        {cartCount > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
            <div className="px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="text-orange-600" size={20} />
                  <span className="font-medium text-gray-800">{cartCount} items</span>
                </div>
                <span className="font-bold text-orange-600 text-lg">₹{cartTotal.toFixed(2)}</span>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {placing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Placing Order...
                  </>
                ) : (
                  'Place Order'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Step 3: Bill
  if (step === 'bill' && completedOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-emerald-600" size={32} />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Placed!</h1>
              <p className="text-gray-500 text-sm">Thank you for your order</p>
            </div>

            <div className="border-t border-b py-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-600 text-sm">Order ID</span>
                <span className="font-mono text-sm font-semibold">#{completedOrder.id.slice(-6)}</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-600 text-sm">Customer</span>
                <span className="font-semibold text-sm">{completedOrder.customerName}</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-600 text-sm">Contact</span>
                <span className="font-semibold text-sm">{completedOrder.customerPhone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Table</span>
                <span className="font-semibold text-sm">Table {completedOrder.tableNumber}</span>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Receipt size={16} />
                Order Items
              </h3>
              <div className="space-y-2">
                {completedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{item.menuItem.imageUrl}</span>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{item.menuItem.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.menuItem.price.toFixed(2)}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-800 text-sm">
                      ₹{(item.menuItem.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {completedOrder.customerNote && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                <p className="text-xs text-amber-700">
                  <strong>Note:</strong> {completedOrder.customerNote}
                </p>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">₹{completedOrder.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Tax ({settings.taxRate}%)</span>
                <span className="font-semibold">₹{(completedOrder.totalAmount * settings.taxRate / 100).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-lg font-bold text-gray-800 pt-2 border-t">
                <span>Total</span>
                <span className="text-orange-600">₹{(completedOrder.totalAmount * (1 + settings.taxRate / 100)).toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-emerald-50 rounded-xl text-center">
              <p className="text-emerald-700 text-sm font-medium">
                Your order is being prepared. Estimated time: 15-20 minutes
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
