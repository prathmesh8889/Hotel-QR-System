import { useState, useEffect } from 'react';
import { getMenuItems, addMenuItem, updateMenuItem, deleteMenuItem, toggleMenuItemAvailability, getCategories } from '../store';
import { MenuItem } from '../types';
import { PageLoader } from '../components/UI/LoadingSkeleton';
import { Plus, Pencil, Trash2, Search, X, ToggleLeft, ToggleRight } from 'lucide-react';

export default function MenuManagement() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [formData, setFormData] = useState({ name: '', description: '', price: '', category: '', imageUrl: '', available: true });

  useEffect(() => {
    setTimeout(() => { setItems(getMenuItems()); setLoading(false); }, 500);
  }, []);

  const categories = ['All', ...getCategories()];

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', category: '', imageUrl: '', available: true });
    setEditingItem(null);
    setShowForm(false);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({ name: item.name, description: item.description, price: item.price.toString(), category: item.category, imageUrl: item.imageUrl, available: item.available });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name: formData.name.trim(), description: formData.description.trim(), price: parseFloat(formData.price), category: formData.category.trim(), imageUrl: formData.imageUrl.trim() || '🍽️', available: formData.available };
    if (editingItem) updateMenuItem(editingItem.id, data);
    else addMenuItem(data);
    setItems(getMenuItems());
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this menu item?')) { deleteMenuItem(id); setItems(getMenuItems()); }
  };

  const handleToggle = (id: string) => { toggleMenuItemAvailability(id); setItems(getMenuItems()); };

  const filteredItems = items.filter((item) => {
    const matchCat = categoryFilter === 'All' || item.category === categoryFilter;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Menu Management</h1>
          <p className="text-slate-500 text-sm mt-1">{items.length} items • {items.filter(i => i.available).length} available</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition text-sm shadow-sm">
          <Plus size={16} /> Add New Item
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search items..." className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white">
          {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Item</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Category</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Price</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-xl">{item.imageUrl}</div>
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{item.name}</p>
                        <p className="text-xs text-slate-500 max-w-[200px] truncate">{item.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">{item.category}</span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-800 text-sm">${item.price.toFixed(2)}</td>
                  <td className="px-5 py-4 text-center">
                    <button onClick={() => handleToggle(item.id)} className="inline-flex transition hover:scale-110">
                      {item.available ? <ToggleRight className="text-emerald-500" size={26} /> : <ToggleLeft className="text-slate-300" size={26} />}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleEdit(item)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"><Pencil size={15} /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredItems.length === 0 && <div className="p-8 text-center text-slate-500">No items match your filters</div>}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-800">{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none" rows={2} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price ($)</label>
                  <input type="number" step="0.01" min="0" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Emoji Icon</label>
                  <input type="text" value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="🍔" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <input type="text" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" list="cats" required />
                <datalist id="cats">{getCategories().map((c) => <option key={c} value={c} />)}</datalist>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.available} onChange={(e) => setFormData({...formData, available: e.target.checked})} className="w-4 h-4 text-indigo-500 rounded" />
                <span className="text-sm text-slate-700">Available for ordering</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition text-sm">{editingItem ? 'Update' : 'Add Item'}</button>
                <button type="button" onClick={resetForm} className="px-4 py-2.5 border border-gray-200 text-slate-700 rounded-xl hover:bg-gray-50 transition text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
