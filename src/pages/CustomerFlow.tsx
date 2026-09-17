import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getMenuItems, getTables, getSettings, placeOrder, getOrders, subscribe } from '../store';
import { MenuItem, CartItem, Order, OrderStatus } from '../types';
import { User, Phone, ShoppingBag, CheckCircle, Receipt, CreditCard, Clock, ChefHat, Truck, MapPin, Star, Shield, ArrowRight, X, Minus, Plus, AlertCircle } from 'lucide-react';

export default function CustomerFlow() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tableId = searchParams.get('tableId');

  // Load saved state from sessionStorage on mount
  const savedState = sessionStorage.getItem('customer_order_state');
  const initialState = savedState ? JSON.parse(savedState) : null;

  const [step, setStep] = useState<'contact' | 'menu' | 'bill' | 'payment'>(initialState?.step || 'contact');
  const [customerName, setCustomerName] = useState(initialState?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(initialState?.customerPhone || '');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>(initialState?.cart || []);
  const [customerNote, setCustomerNote] = useState(initialState?.customerNote || '');
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(initialState?.completedOrder || null);
  const [currentOrderStatus, setCurrentOrderStatus] = useState<OrderStatus | null>(initialState?.currentOrderStatus || null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card'>(initialState?.paymentMethod || 'cash');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed'>(initialState?.paymentStatus || 'pending');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showNote, setShowNote] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    const stateToSave = {
      step,
      customerName,
      customerPhone,
      cart,
      customerNote,
      completedOrder,
      currentOrderStatus,
      paymentMethod,
      paymentStatus,
    };
    sessionStorage.setItem('customer_order_state', JSON.stringify(stateToSave));
  }, [step, customerName, customerPhone, cart, customerNote, completedOrder, currentOrderStatus, paymentMethod, paymentStatus]);

  // Prevent back button navigation
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (completedOrder && currentOrderStatus !== 'paid') {
        // Push state back to prevent going back
        window.history.pushState(null, '', window.location.href);
        alert('कृपया पेमेंट पूर्ण करा. Back जाऊ नका.');
      }
    };

    // Push initial state to prevent back navigation
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [completedOrder, currentOrderStatus]);

  // Prevent refresh/close until payment is complete
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (completedOrder && currentOrderStatus !== 'paid') {
        e.preventDefault();
        e.returnValue = 'तुमचे ऑर्डर अद्याप पूर्ण झालेले नाही. पेमेंट न करता page बंद केल्यास ऑर्डर रद्द होईल.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [completedOrder, currentOrderStatus]);

  useEffect(() => {
    setTimeout(() => {
      setMenuItems(getMenuItems().filter((i) => i.available));
      setLoading(false);
    }, 600);
  }, []);

  // Real-time order status tracking
  useEffect(() => {
    if (!completedOrder) return;
    
    const checkStatus = () => {
      const orders = getOrders();
      const order = orders.find((o) => o.id === completedOrder.id);
      if (order) {
        setCurrentOrderStatus(order.status);
        setLastUpdated(new Date());
      }
    };
    
    checkStatus();
    const unsub = subscribe(checkStatus);
    const interval = setInterval(checkStatus, 2000);
    
    return () => { unsub(); clearInterval(interval); };
  }, [completedOrder]);

  if (!tableId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">🍽️</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Welcome to Our Restaurant</h1>
          <p className="text-slate-300">Please scan the QR code on your table to view the menu and place your order.</p>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="text-red-400" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Table Not Found</h1>
          <p className="text-slate-300">Please ask staff for assistance.</p>
        </div>
      </div>
    );
  }

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
        setCurrentOrderStatus('pending');
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

  const handlePayment = () => {
    setStep('payment');
  };

  const handleCompletePayment = () => {
    setPaymentStatus('processing');
    setTimeout(() => {
      setPaymentStatus('completed');
    }, 2000);
  };

  const getStatusInfo = (status: OrderStatus | null) => {
    switch (status) {
      case 'pending':
        return { label: 'Order Received', subtitle: 'Your order has been received', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', progress: 25 };
      case 'preparing':
        return { label: 'Being Prepared', subtitle: 'Our chef is preparing your food', icon: ChefHat, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', progress: 50 };
      case 'ready':
        return { label: 'Ready to Serve', subtitle: 'Your order is ready!', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', progress: 75 };
      case 'served':
        return { label: 'Served', subtitle: 'Enjoy your meal!', icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', progress: 100 };
      case 'paid':
        return { label: 'Completed', subtitle: 'Thank you for dining with us!', icon: CreditCard, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', progress: 100 };
      default:
        return { label: 'Processing', subtitle: 'Please wait...', icon: Clock, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', progress: 0 };
    }
  };

  const categories = ['All', ...new Set(menuItems.map((i) => i.category))];
  const filteredItems = menuItems.filter((item) => 
    activeCategory === 'All' || item.category === activeCategory
  );

  // Step 1: Contact Information
  if (step === 'contact') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900">
        {/* Header */}
        <div className="pt-12 pb-8 px-4 text-center">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <span className="text-5xl">🍽️</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{settings.name}</h1>
          <div className="flex items-center justify-center gap-2 text-slate-300 text-sm">
            <MapPin size={14} />
            <span>{settings.address}</span>
          </div>
          <div className="flex items-center justify-center gap-1 mt-2">
            {[1,2,3,4,5].map(i => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}
            <span className="text-slate-300 text-sm ml-2">4.9 (2.3k reviews)</span>
          </div>
        </div>

        {/* Card */}
        <div className="px-4 pb-8">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-800 mb-1">Welcome!</h2>
                <p className="text-slate-500 text-sm">Table {tableNumber} • Please enter your details</p>
              </div>

              <form onSubmit={handleContactSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Your Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm transition"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Contact Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm transition"
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl transition shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 group"
                >
                  View Menu
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
                <Shield size={12} />
                <span>Your information is secure and private</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Menu
  if (step === 'menu') {
    return (
      <div className="min-h-screen bg-slate-50 pb-24">
        {/* Header */}
        <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white sticky top-0 z-40 shadow-lg">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className="text-lg font-bold">{settings.name}</h1>
                <p className="text-indigo-100 text-xs flex items-center gap-1">
                  <MapPin size={12} />
                  Table {tableNumber} • {customerName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-indigo-200">Welcome</p>
                <p className="text-sm font-semibold">{customerName.split(' ')[0]}</p>
              </div>
            </div>
          </div>
          
          {/* Categories */}
          <div className="px-4 pb-3 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap ${
                    activeCategory === cat 
                      ? 'bg-white text-indigo-700 shadow-md' 
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
        <div className="px-4 py-4 space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-500">Loading menu...</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const qty = cart.find((c) => c.menuItem.id === item.id)?.quantity || 0;
              return (
                <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="flex">
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-slate-800 text-sm leading-tight">{item.name}</h3>
                        {qty > 0 && (
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                            {qty}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-3">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-600 text-lg">₹{item.price.toFixed(0)}</span>
                        {qty === 0 ? (
                          <button
                            onClick={() => addToCart(item)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold rounded-full transition shadow-sm"
                          >
                            <Plus size={14} />
                            ADD
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 bg-indigo-50 rounded-full p-1">
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="w-8 h-8 flex items-center justify-center bg-white hover:bg-slate-100 rounded-full shadow-sm transition"
                            >
                              <Minus size={14} className="text-indigo-600" />
                            </button>
                            <span className="w-6 text-center text-sm font-bold text-indigo-700">{qty}</span>
                            <button
                              onClick={() => addToCart(item)}
                              className="w-8 h-8 flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 rounded-full shadow-sm transition"
                            >
                              <Plus size={14} className="text-white" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="w-24 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center text-4xl border-l">
                      {item.imageUrl}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Cart Bottom Bar */}
        {cartCount > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl z-40">
            <div className="px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <ShoppingBag className="text-indigo-600" size={24} />
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {cartCount}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{cartCount} items</p>
                    <p className="text-xs text-slate-500">Ready to order</p>
                  </div>
                </div>
                <span className="font-bold text-indigo-600 text-xl">₹{cartTotal.toFixed(0)}</span>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-500/30"
              >
                {placing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Placing Order...
                  </>
                ) : (
                  <>
                    Place Order
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Step 3: Bill with Real-time Status
  if (step === 'bill' && completedOrder) {
    const statusInfo = getStatusInfo(currentOrderStatus);
    const StatusIcon = statusInfo.icon;
    const totalWithTax = completedOrder.totalAmount * (1 + settings.taxRate / 100);

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4">
        <div className="max-w-md mx-auto">
          {/* Success Header */}
          <div className="text-center mb-6">
            <div className="relative inline-block">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <CheckCircle className="text-white" size={40} />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-400 rounded-full animate-ping"></div>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mt-4 mb-1">Order Confirmed!</h1>
            <p className="text-slate-500 text-sm">Thank you for your order</p>
          </div>

          {/* Real-time Status Card */}
          <div className={`${statusInfo.bg} ${statusInfo.border} border-2 rounded-2xl p-5 mb-6 shadow-lg relative overflow-hidden`}>
            {/* Live Indicator */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full shadow-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-red-600">LIVE</span>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className={`w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm`}>
                <StatusIcon className={statusInfo.color} size={28} />
              </div>
              <div className="flex-1">
                <p className={`font-bold ${statusInfo.color} text-xl`}>{statusInfo.label}</p>
                <p className="text-sm text-slate-600 mt-0.5">{statusInfo.subtitle}</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-white rounded-full h-3 overflow-hidden shadow-inner mb-3">
              <div 
                className={`h-full ${statusInfo.color.replace('text-', 'bg-')} transition-all duration-1000 ease-out rounded-full relative`}
                style={{ width: `${statusInfo.progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            
            {/* Progress Steps */}
            <div className="flex justify-between text-xs font-medium">
              <span className={currentOrderStatus === 'pending' ? 'text-amber-600 font-bold' : 'text-slate-400'}>Received</span>
              <span className={currentOrderStatus === 'preparing' ? 'text-blue-600 font-bold' : 'text-slate-400'}>Preparing</span>
              <span className={currentOrderStatus === 'ready' ? 'text-emerald-600 font-bold' : 'text-slate-400'}>Ready</span>
              <span className={currentOrderStatus === 'served' || currentOrderStatus === 'paid' ? 'text-purple-600 font-bold' : 'text-slate-400'}>Served</span>
            </div>
            
            {/* Last Updated */}
            <div className="mt-3 pt-3 border-t border-slate-200/50 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                Auto-updating
              </span>
              <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Order Details Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
              <div>
                <p className="text-xs text-slate-500">Order ID</p>
                <p className="font-mono font-bold text-slate-800">#{completedOrder.id.slice(-6)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Time</p>
                <p className="font-semibold text-slate-800 text-sm">{new Date(completedOrder.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-slate-100">
              <div>
                <p className="text-xs text-slate-500 mb-1">Customer</p>
                <p className="font-semibold text-slate-800 text-sm">{completedOrder.customerName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Contact</p>
                <p className="font-semibold text-slate-800 text-sm">{completedOrder.customerPhone}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Table</p>
                <p className="font-semibold text-slate-800 text-sm">Table {completedOrder.tableNumber}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Items</p>
                <p className="font-semibold text-slate-800 text-sm">{completedOrder.items.length} items</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                <Receipt size={14} />
                Order Summary
              </h3>
              {completedOrder.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-2xl">{item.menuItem.imageUrl}</span>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800 text-sm">{item.menuItem.name}</p>
                    <p className="text-xs text-slate-500">{item.quantity} × ₹{item.menuItem.price.toFixed(0)}</p>
                  </div>
                  <span className="font-semibold text-slate-800 text-sm">
                    ₹{(item.menuItem.price * item.quantity).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>

            {completedOrder.customerNote && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-xs text-amber-700">
                  <strong>Note:</strong> {completedOrder.customerNote}
                </p>
              </div>
            )}
          </div>

          {/* Bill Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-medium text-slate-800">₹{completedOrder.totalAmount.toFixed(0)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">GST ({settings.taxRate}%)</span>
                <span className="font-medium text-slate-800">₹{(completedOrder.totalAmount * settings.taxRate / 100).toFixed(0)}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="font-bold text-slate-800">Total</span>
                <span className="text-2xl font-bold text-indigo-600">₹{totalWithTax.toFixed(0)}</span>
              </div>
            </div>
          </div>

          {/* Payment Button */}
          {currentOrderStatus !== 'paid' && (
            <button
              onClick={handlePayment}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 group"
            >
              <CreditCard size={20} />
              Proceed to Payment
              <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
            </button>
          )}

          {currentOrderStatus === 'paid' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
              <CheckCircle className="text-emerald-600 mx-auto mb-2" size={32} />
              <p className="text-emerald-700 font-bold">Payment Completed</p>
              <p className="text-emerald-600 text-sm mt-1">Thank you for dining with us!</p>
            </div>
          )}

          {/* Warning */}
          {currentOrderStatus !== 'paid' && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl text-center">
              <p className="text-xs text-amber-700">
                ⚠️ Please do not close this page until payment is complete
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Step 4: Payment
  if (step === 'payment' && completedOrder) {
    const totalWithTax = completedOrder.totalAmount * (1 + settings.taxRate / 100);

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4">
        <div className="max-w-md mx-auto">
          {/* Payment Header */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30">
              <CreditCard className="text-white" size={36} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mt-4 mb-1">Payment</h1>
            <p className="text-slate-500 text-sm">Order #{completedOrder.id.slice(-6)}</p>
          </div>

          {/* Amount Card */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 mb-6 text-white shadow-lg shadow-indigo-500/30">
            <p className="text-indigo-100 text-sm mb-1">Amount to Pay</p>
            <p className="text-4xl font-bold">₹{totalWithTax.toFixed(0)}</p>
            <p className="text-indigo-200 text-xs mt-2">Including {settings.taxRate}% GST</p>
          </div>

          {paymentStatus === 'completed' ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
              <div className="relative inline-block mb-4">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="text-emerald-600" size={48} />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-400 rounded-full animate-ping"></div>
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Payment Successful!</h2>
              <p className="text-slate-500 text-sm mb-4">Thank you for your payment</p>
              <div className="bg-slate-50 rounded-xl p-4 text-left">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500">Transaction ID</span>
                  <span className="font-mono font-semibold text-slate-800">TXN{Date.now().toString().slice(-8)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500">Amount</span>
                  <span className="font-semibold text-slate-800">₹{totalWithTax.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Method</span>
                  <span className="font-semibold text-slate-800 capitalize">{paymentMethod}</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Payment Methods */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-6">
                <h3 className="font-semibold text-slate-800 mb-4">Select Payment Method</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`w-full p-4 border-2 rounded-xl transition ${
                      paymentMethod === 'cash' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">💵</span>
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-semibold text-slate-800">Cash</p>
                        <p className="text-xs text-slate-500">Pay at counter</p>
                      </div>
                      {paymentMethod === 'cash' && <CheckCircle className="text-indigo-500" size={20} />}
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('upi')}
                    className={`w-full p-4 border-2 rounded-xl transition ${
                      paymentMethod === 'upi' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">📱</span>
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-semibold text-slate-800">UPI</p>
                        <p className="text-xs text-slate-500">GPay, PhonePe, Paytm</p>
                      </div>
                      {paymentMethod === 'upi' && <CheckCircle className="text-indigo-500" size={20} />}
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`w-full p-4 border-2 rounded-xl transition ${
                      paymentMethod === 'card' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">💳</span>
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-semibold text-slate-800">Card</p>
                        <p className="text-xs text-slate-500">Credit/Debit Card</p>
                      </div>
                      {paymentMethod === 'card' && <CheckCircle className="text-indigo-500" size={20} />}
                    </div>
                  </button>
                </div>
              </div>

              {/* Pay Button */}
              <button
                onClick={handleCompletePayment}
                disabled={paymentStatus === 'processing'}
                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-2xl transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-500/30"
              >
                {paymentStatus === 'processing' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    Pay ₹{totalWithTax.toFixed(0)}
                  </>
                )}
              </button>

              {/* Security Note */}
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                <Shield size={12} />
                <span>Secure payment • 256-bit encryption</span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
}
