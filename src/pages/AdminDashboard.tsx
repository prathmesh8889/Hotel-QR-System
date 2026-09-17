import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  getOrders,
  getMenuItems,
  getTables,
  updateOrderStatus,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemAvailability,
  addTable,
  deleteTable,
  adminLogout,
  subscribe,
  notify,
  getCategories,
} from '../store';
import { MenuItem, Table, Order, OrderStatus } from '../types';
import {
  ClipboardList,
  UtensilsCrossed,
  Table2,
  LogOut,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  QrCode,
  Clock,
  ChefHat,
  Bell,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
} from 'lucide-react';

type Tab = 'orders' | 'menu' | 'tables';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [newOrderSound, setNewOrderSound] = useState(false);
  const navigate = useNavigate();

  const refreshData = useCallback(() => {
    setOrders(getOrders());
    setMenuItems(getMenuItems());
    setTables(getTables());
  }, []);

  useEffect(() => {
    refreshData();
    const unsubscribe = subscribe(() => {
      const newOrders = getOrders();
      if (newOrders.length > orders.length && newOrders[0]?.status === 'pending') {
        setNewOrderSound(true);
        setTimeout(() => setNewOrderSound(false), 3000);
      }
      refreshData();
    });

    // Poll for changes every 2 seconds (simulating Socket.io)
    const interval = setInterval(refreshData, 2000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [refreshData, orders.length]);

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const handleOrderStatusChange = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status);
    notify();
    refreshData();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍽️</span>
            <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
            {newOrderSound && (
              <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full animate-pulse">
                <Bell size={12} /> New Order!
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refreshData}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
              title="Refresh"
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition text-sm font-medium"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            <TabButton
              active={activeTab === 'orders'}
              onClick={() => setActiveTab('orders')}
              icon={<ClipboardList size={18} />}
              label="Live Orders"
              badge={orders.filter((o) => o.status === 'pending').length}
            />
            <TabButton
              active={activeTab === 'menu'}
              onClick={() => setActiveTab('menu')}
              icon={<UtensilsCrossed size={18} />}
              label="Menu Management"
            />
            <TabButton
              active={activeTab === 'tables'}
              onClick={() => setActiveTab('tables')}
              icon={<Table2 size={18} />}
              label="Tables & QR Codes"
            />
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'orders' && (
          <LiveOrders orders={orders} onStatusChange={handleOrderStatusChange} />
        )}
        {activeTab === 'menu' && (
          <MenuManagement
            items={menuItems}
            onRefresh={refreshData}
          />
        )}
        {activeTab === 'tables' && (
          <TableManagement
            tables={tables}
            onRefresh={refreshData}
          />
        )}
      </main>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
        active
          ? 'border-amber-500 text-amber-700'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{badge}</span>
      )}
    </button>
  );
}

// Live Orders Component
function LiveOrders({
  orders,
  onStatusChange,
}: {
  orders: Order[];
  onStatusChange: (id: string, status: OrderStatus) => void;
}) {
  const statusColors: Record<OrderStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    preparing: 'bg-blue-100 text-blue-800 border-blue-300',
    ready: 'bg-green-100 text-green-800 border-green-300',
    served: 'bg-purple-100 text-purple-800 border-purple-300',
    paid: 'bg-gray-100 text-gray-800 border-gray-300',
  };

  const statusIcons: Record<OrderStatus, React.ReactNode> = {
    pending: <Clock size={16} />,
    preparing: <ChefHat size={16} />,
    ready: <Check size={16} />,
    served: <Check size={16} />,
    paid: <Check size={16} />,
  };

  const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
    pending: 'preparing',
    preparing: 'ready',
    ready: 'served',
    served: 'paid',
  };

  const pendingOrders = orders.filter((o) => ['pending', 'preparing', 'ready'].includes(o.status));
  const completedOrders = orders.filter((o) => ['served', 'paid'].includes(o.status));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">
          Active Orders ({pendingOrders.length})
        </h2>
        <div className="flex gap-2 text-xs">
          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">Pending</span>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">Preparing</span>
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded">Ready</span>
        </div>
      </div>

      {pendingOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border">
          <span className="text-4xl mb-4 block">📋</span>
          <p className="text-gray-500">No active orders. Waiting for new orders...</p>
          <p className="text-gray-400 text-sm mt-2">Orders will appear here in real-time</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingOrders.map((order) => (
            <div
              key={order.id}
              className={`bg-white rounded-xl border-2 p-4 transition-all hover:shadow-md ${
                order.status === 'pending' ? 'border-yellow-300' : order.status === 'preparing' ? 'border-blue-300' : 'border-green-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-gray-800">#{order.id.slice(-6)}</span>
                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusColors[order.status]}`}>
                  {statusIcons[order.status]}
                  {order.status}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🪑</span>
                <span className="font-semibold text-gray-700">Table {order.tableNumber}</span>
                <span className="text-xs text-gray-400">
                  {new Date(order.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <div className="space-y-1 mb-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.menuItem.imageUrl} {item.menuItem.name} × {item.quantity}
                    </span>
                    <span className="text-gray-500">${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {order.customerNote && (
                <div className="mb-3 p-2 bg-amber-50 rounded text-xs text-amber-700">
                  📝 {order.customerNote}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t">
                <span className="font-bold text-gray-800">Total: ${order.totalAmount.toFixed(2)}</span>
                {nextStatus[order.status] && (
                  <button
                    onClick={() => onStatusChange(order.id, nextStatus[order.status]!)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition"
                  >
                    → {nextStatus[order.status]}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completed Orders */}
      {completedOrders.length > 0 && (
        <div>
          <h3 className="text-md font-semibold text-gray-600 mb-3">
            Completed ({completedOrders.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {completedOrders.slice(0, 6).map((order) => (
              <div key={order.id} className="bg-white rounded-lg border p-3 opacity-70">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">#{order.id.slice(-6)}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Table {order.tableNumber} • ${order.totalAmount.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Menu Management Component
function MenuManagement({ items, onRefresh }: { items: MenuItem[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
    available: true,
  });

  const categories = getCategories();

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', category: '', imageUrl: '', available: true });
    setEditingItem(null);
    setShowForm(false);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      imageUrl: item.imageUrl,
      available: item.available,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const itemData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      category: formData.category.trim(),
      imageUrl: formData.imageUrl.trim() || '🍽️',
      available: formData.available,
    };

    if (editingItem) {
      updateMenuItem(editingItem.id, itemData);
    } else {
      addMenuItem(itemData);
    }
    resetForm();
    onRefresh();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteMenuItem(id);
      onRefresh();
    }
  };

  const handleToggle = (id: string) => {
    toggleMenuItemAvailability(id);
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Menu Items ({items.length})</h2>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition text-sm"
        >
          <Plus size={16} /> Add Item
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                  rows={2}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emoji Icon</label>
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="🍔"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                  list="categories"
                  required
                />
                <datalist id="categories">
                  {categories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="available"
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  className="w-4 h-4 text-amber-500 rounded"
                />
                <label htmlFor="available" className="text-sm text-gray-700">Available</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition"
                >
                  {editingItem ? 'Update' : 'Add Item'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Menu Items List */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.imageUrl}</span>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500 hidden sm:block max-w-[200px] truncate">{item.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{item.category}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">${item.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleToggle(item.id)} className="inline-flex">
                      {item.available ? (
                        <ToggleRight className="text-green-500" size={24} />
                      ) : (
                        <ToggleLeft className="text-gray-400" size={24} />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Table Management Component
function TableManagement({ tables, onRefresh }: { tables: Table[]; onRefresh: () => void }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(newTableNumber);
    if (num > 0) {
      addTable(num);
      setNewTableNumber('');
      setShowAddForm(false);
      onRefresh();
    }
  };

  const handleDeleteTable = (id: string) => {
    if (confirm('Delete this table?')) {
      deleteTable(id);
      onRefresh();
    }
  };

  const getBaseUrl = () => {
    return window.location.origin;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Tables & QR Codes ({tables.length})</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition text-sm"
        >
          <Plus size={16} /> Add Table
        </button>
      </div>

      {/* Add Table Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl border p-4">
          <form onSubmit={handleAddTable} className="flex items-center gap-3">
            <input
              type="number"
              min="1"
              value={newTableNumber}
              onChange={(e) => setNewTableNumber(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              placeholder="Table number"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* QR Code Modal */}
      {selectedTable && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center">
            <h3 className="text-lg font-semibold mb-4">Table {selectedTable.number} - QR Code</h3>
            <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 inline-block mb-4">
              <QRCodeSVG
                value={`${getBaseUrl()}/menu?tableId=${selectedTable.number}`}
                size={200}
                level="H"
                includeMargin
              />
            </div>
            <p className="text-sm text-gray-500 mb-2">Scan to open menu</p>
            <p className="text-xs text-gray-400 mb-4 break-all">
              {`${getBaseUrl()}/menu?tableId=${selectedTable.number}`}
            </p>
            <button
              onClick={() => setSelectedTable(null)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tables.map((table) => (
          <div key={table.id} className="bg-white rounded-xl border p-4 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🪑</span>
                <span className="font-bold text-gray-800">Table {table.number}</span>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                table.status === 'available'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {table.status}
              </span>
            </div>

            <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg mb-3">
              <QRCodeSVG
                value={`${getBaseUrl()}/menu?tableId=${table.number}`}
                size={100}
                level="M"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedTable(table)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-medium rounded-lg transition"
              >
                <QrCode size={14} /> View QR
              </button>
              <button
                onClick={() => handleDeleteTable(table.id)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {tables.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border">
          <span className="text-4xl mb-4 block">🪑</span>
          <p className="text-gray-500">No tables configured yet.</p>
          <p className="text-gray-400 text-sm mt-2">Add tables to generate QR codes</p>
        </div>
      )}
    </div>
  );
}
