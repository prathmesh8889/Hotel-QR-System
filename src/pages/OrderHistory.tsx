import { useEffect, useState } from 'react';
import { getOrderHistory, getOrders } from '../store';
import { Order } from '../types';
import { OrderStatusBadge } from '../components/UI/StatusBadge';
import { PageLoader } from '../components/UI/LoadingSkeleton';
import { Clock, Search, Filter, Download, Eye, Star } from 'lucide-react';

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'paid' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setOrders(getOrderHistory());
      setLoading(false);
    }, 500);
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const matchesSearch = searchQuery === '' || 
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.tableNumber.toString().includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const handleDownloadReceipt = (order: Order) => {
    const receipt = `
═══════════════════════════════════════
        THE GRAND KITCHEN
        Order Receipt
═══════════════════════════════════════

Order ID: ${order.id}
Date: ${new Date(order.timestamp).toLocaleString()}
Table: ${order.tableNumber}
Customer: ${order.customerName}
Phone: ${order.customerPhone}

───────────────────────────────────────
ITEMS ORDERED:
───────────────────────────────────────
${order.items.map(item => 
  `${item.menuItem.imageUrl} ${item.menuItem.name}
   ${item.quantity} x ₹${item.menuItem.price.toFixed(2)} = ₹${(item.quantity * item.menuItem.price).toFixed(2)}`
).join('\n\n')}

───────────────────────────────────────
SUBTOTAL:        ₹${order.totalAmount.toFixed(2)}
GST (18%):       ₹${(order.totalAmount * 0.18).toFixed(2)}
───────────────────────────────────────
TOTAL:           ₹${(order.totalAmount * 1.18).toFixed(2)}
───────────────────────────────────────

Status: ${order.status.toUpperCase()}
${order.rating ? `\nRating: ${'⭐'.repeat(order.rating)} (${order.rating}/5)` : ''}
${order.review ? `Review: ${order.review}` : ''}
${order.customerNote ? `\nNote: ${order.customerNote}` : ''}

═══════════════════════════════════════
      Thank you for dining with us!
═══════════════════════════════════════
    `.trim();

    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${order.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Order History</h1>
          <p className="text-slate-500 text-sm mt-1">{orders.length} completed orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, order ID, or table..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition ${
              filter === 'all' ? 'bg-indigo-500 text-white' : 'bg-white border border-gray-200 text-slate-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition ${
              filter === 'paid' ? 'bg-emerald-500 text-white' : 'bg-white border border-gray-200 text-slate-700'
            }`}
          >
            Paid
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition ${
              filter === 'cancelled' ? 'bg-red-500 text-white' : 'bg-white border border-gray-200 text-slate-700'
            }`}
          >
            Cancelled
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Order</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Customer</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase hidden lg:table-cell">Table</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Amount</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase hidden lg:table-cell">Rating</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-medium text-slate-800 text-sm">#{order.id.slice(-6)}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(order.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <div>
                      <p className="text-sm text-slate-700">{order.customerName}</p>
                      <p className="text-xs text-slate-500">{order.customerPhone}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <span className="text-sm text-slate-700">Table {order.tableNumber}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-semibold text-slate-800 text-sm">₹{order.totalAmount.toFixed(0)}</span>
                  </td>
                  <td className="px-5 py-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    {order.rating ? (
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-amber-500 fill-amber-500" />
                        <span className="text-sm font-medium text-slate-700">{order.rating}/5</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">No rating</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="View Details"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => handleDownloadReceipt(order)}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                        title="Download Receipt"
                      >
                        <Download size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="p-8 text-center text-slate-500">No orders found</div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-800">Order Details</h3>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Order ID</p>
                  <p className="font-mono font-semibold text-slate-800">#{selectedOrder.id.slice(-6)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Date & Time</p>
                  <p className="font-semibold text-slate-800 text-sm">{new Date(selectedOrder.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Customer</p>
                  <p className="font-semibold text-slate-800 text-sm">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Phone</p>
                  <p className="font-semibold text-slate-800 text-sm">{selectedOrder.customerPhone}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Table</p>
                  <p className="font-semibold text-slate-800 text-sm">Table {selectedOrder.tableNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Status</p>
                  <OrderStatusBadge status={selectedOrder.status} />
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-xs text-slate-500 mb-2">Items Ordered</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{item.menuItem.imageUrl}</span>
                        <div>
                          <p className="font-medium text-slate-800 text-sm">{item.menuItem.name}</p>
                          <p className="text-xs text-slate-500">{item.quantity} × ₹{item.menuItem.price.toFixed(2)}</p>
                        </div>
                      </div>
                      <span className="font-semibold text-slate-800 text-sm">
                        ₹{(item.quantity * item.menuItem.price).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium">₹{selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">GST (18%)</span>
                  <span className="font-medium">₹{(selectedOrder.totalAmount * 0.18).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span className="text-indigo-600">₹{(selectedOrder.totalAmount * 1.18).toFixed(2)}</span>
                </div>
              </div>

              {selectedOrder.rating && (
                <div className="border-t pt-4">
                  <p className="text-xs text-slate-500 mb-2">Customer Rating</p>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          size={20}
                          className={star <= selectedOrder.rating! ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}
                        />
                      ))}
                    </div>
                    <span className="font-semibold text-slate-800">{selectedOrder.rating}/5</span>
                  </div>
                  {selectedOrder.review && (
                    <p className="text-sm text-slate-600 mt-2 italic">"{selectedOrder.review}"</p>
                  )}
                </div>
              )}

              {selectedOrder.customerNote && (
                <div className="border-t pt-4">
                  <p className="text-xs text-slate-500 mb-2">Special Instructions</p>
                  <p className="text-sm text-slate-700 bg-amber-50 p-3 rounded-lg">{selectedOrder.customerNote}</p>
                </div>
              )}

              <button
                onClick={() => handleDownloadReceipt(selectedOrder)}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition text-sm flex items-center justify-center gap-2"
              >
                <Download size={16} />
                Download Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
