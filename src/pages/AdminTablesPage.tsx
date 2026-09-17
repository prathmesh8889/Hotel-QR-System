import { useState, useEffect } from 'react';
import { getTables, addTable, deleteTable, updateTableStatus } from '../store';
import { Table, TableStatus } from '../types';
import { TableStatusBadge } from '../components/UI/StatusBadge';
import { PageLoader } from '../components/UI/LoadingSkeleton';
import { QRCodeSVG } from 'qrcode.react';
import { Plus, Trash2, X, QrCode, Download, Printer, Sparkles } from 'lucide-react';

export default function AdminTablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newTableNum, setNewTableNum] = useState('');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  useEffect(() => {
    setTimeout(() => { setTables(getTables()); setLoading(false); }, 500);
  }, []);

  const refresh = () => setTables(getTables());

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(newTableNum);
    if (num > 0) { addTable(num); refresh(); setNewTableNum(''); setShowAdd(false); }
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this table?')) { deleteTable(id); refresh(); }
  };

  const handleStatusChange = (id: string, status: TableStatus) => {
    updateTableStatus(id, status);
    refresh();
  };

  const statusColors: Record<TableStatus, string> = {
    available: 'border-emerald-200 bg-emerald-50/50',
    occupied: 'border-blue-200 bg-blue-50/50',
    dirty: 'border-red-200 bg-red-50/50',
    reserved: 'border-violet-200 bg-violet-50/50',
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tables & QR Codes</h1>
          <p className="text-slate-500 text-sm mt-1">{tables.length} tables configured</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-slate-700 font-medium rounded-xl hover:bg-gray-50 transition text-sm">
            <Printer size={16} /> Print All
          </button>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition text-sm shadow-sm shadow-indigo-500/20">
            <Plus size={16} /> Add Table
          </button>
        </div>
      </div>

      {/* Add Table Form */}
      {showAdd && (
        <div className="bg-white rounded-xl border p-4">
          <form onSubmit={handleAdd} className="flex items-center gap-3">
            <input type="number" min="1" value={newTableNum} onChange={(e) => setNewTableNum(e.target.value)} className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="Table number" required />
            <button type="submit" className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition text-sm">Add</button>
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2.5 border border-gray-200 text-slate-700 rounded-xl hover:bg-gray-50 transition text-sm">Cancel</button>
          </form>
        </div>
      )}

      {/* Status Legend */}
      <div className="flex flex-wrap gap-3">
        {(['available', 'occupied', 'dirty', 'reserved'] as TableStatus[]).map((status) => (
          <TableStatusBadge key={status} status={status} size="md" />
        ))}
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tables.map((table) => (
          <div key={table.id} className={`bg-white rounded-xl border-2 ${statusColors[table.status]} p-5 hover:shadow-md transition-all`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">🪑</span>
                <span className="font-bold text-slate-800 text-lg">Table {table.number}</span>
              </div>
              <TableStatusBadge status={table.status} />
            </div>

            {/* QR Code */}
            <div className="flex items-center justify-center p-3 bg-white rounded-xl border border-dashed border-gray-200 mb-4">
              <QRCodeSVG value={`${window.location.origin}/menu?tableId=${table.number}`} size={100} level="M" />
            </div>

            {/* Status Actions */}
            <div className="grid grid-cols-4 gap-1 mb-3">
              {(['available', 'occupied', 'dirty', 'reserved'] as TableStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(table.id, s)}
                  className={`px-1 py-1.5 text-[10px] font-medium rounded-md transition ${
                    table.status === s
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s === 'available' ? '✅' : s === 'occupied' ? '👥' : s === 'dirty' ? '🧹' : '📌'}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button onClick={() => setSelectedTable(table)} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium rounded-lg transition">
                <QrCode size={14} /> View QR
              </button>
              <button onClick={() => handleDelete(table.id)} className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {tables.length === 0 && (
        <div className="bg-white rounded-xl border p-12 text-center">
          <span className="text-4xl mb-3 block">🪑</span>
          <p className="text-slate-500 font-medium">No tables configured</p>
          <p className="text-slate-400 text-sm mt-1">Add tables to generate QR codes for customers</p>
        </div>
      )}

      {/* QR Code Modal */}
      {selectedTable && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Table {selectedTable.number}</h3>
              <button onClick={() => setSelectedTable(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="bg-white p-6 rounded-xl border-2 border-dashed border-gray-200 inline-block mb-4">
              <QRCodeSVG value={`${window.location.origin}/menu?tableId=${selectedTable.number}`} size={200} level="H" includeMargin />
            </div>
            <p className="text-sm text-slate-500 mb-1">Scan to open menu</p>
            <p className="text-xs text-slate-400 mb-4 break-all font-mono bg-gray-50 p-2 rounded">
              {`${window.location.origin}/menu?tableId=${selectedTable.number}`}
            </p>
            <button onClick={() => setSelectedTable(null)} className="w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition text-sm">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
