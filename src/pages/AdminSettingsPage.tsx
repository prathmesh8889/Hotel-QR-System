import { useState } from 'react';
import { getSettings, updateSettings } from '../store';
import { HotelSettings } from '../types';
import { Save, Building2, Phone, DollarSign, Percent } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<HotelSettings>(getSettings());
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Configure your hotel/restaurant details</p>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
          ✅ Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
            <Building2 size={14} /> Restaurant Name
          </label>
          <input type="text" value={settings.name} onChange={(e) => setSettings({...settings, name: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
            <Building2 size={14} /> Address
          </label>
          <input type="text" value={settings.address} onChange={(e) => setSettings({...settings, address: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
              <Phone size={14} /> Phone
            </label>
            <input type="text" value={settings.phone} onChange={(e) => setSettings({...settings, phone: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
              <DollarSign size={14} /> Currency Symbol
            </label>
            <input type="text" value={settings.currency} onChange={(e) => setSettings({...settings, currency: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
          </div>
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
            <Percent size={14} /> Tax Rate (%)
          </label>
          <input type="number" min="0" max="100" step="0.5" value={settings.taxRate} onChange={(e) => setSettings({...settings, taxRate: parseFloat(e.target.value)})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
        </div>
        <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition text-sm shadow-sm shadow-indigo-500/20">
          <Save size={16} /> Save Settings
        </button>
      </form>
    </div>
  );
}
