import { useState, useEffect } from 'react';
import { getStaff, addStaff, updateStaff, deleteStaff, toggleStaffStatus } from '../store';
import { Staff, UserRole } from '../types';
import { PageLoader } from '../components/UI/LoadingSkeleton';
import { Plus, Pencil, Trash2, X, UserCheck, UserX, Users } from 'lucide-react';

export default function StaffManagement() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'kitchen' as UserRole,
    phone: '',
    email: '',
    active: true,
  });

  useEffect(() => {
    setTimeout(() => {
      setStaffList(getStaff());
      setLoading(false);
    }, 500);
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      username: '',
      password: '',
      role: 'kitchen',
      phone: '',
      email: '',
      active: true,
    });
    setEditingStaff(null);
    setShowForm(false);
  };

  const handleEdit = (staff: Staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      username: staff.username,
      password: staff.password,
      role: staff.role,
      phone: staff.phone,
      email: staff.email,
      active: staff.active,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: formData.name.trim(),
      username: formData.username.trim(),
      password: formData.password,
      role: formData.role,
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      active: formData.active,
    };

    if (editingStaff) {
      updateStaff(editingStaff.id, data);
    } else {
      addStaff(data);
    }
    setStaffList(getStaff());
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this staff member?')) {
      deleteStaff(id);
      setStaffList(getStaff());
    }
  };

  const handleToggle = (id: string) => {
    toggleStaffStatus(id);
    setStaffList(getStaff());
  };

  const getRoleBadge = (role: UserRole) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-700',
      kitchen: 'bg-orange-100 text-orange-700',
      waiter: 'bg-blue-100 text-blue-700',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[role]}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Staff Management</h1>
          <p className="text-slate-500 text-sm mt-1">
            {staffList.length} staff members • {staffList.filter((s) => s.active).length} active
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition text-sm shadow-sm"
        >
          <Plus size={16} /> Add Staff Member
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                  Staff Member
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">
                  Contact
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                  Role
                </th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">
                  Status
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {staffList.map((staff) => (
                <tr key={staff.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold text-sm">
                          {staff.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{staff.name}</p>
                        <p className="text-xs text-slate-500">@{staff.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <div className="text-sm">
                      <p className="text-slate-700">{staff.phone}</p>
                      <p className="text-xs text-slate-500">{staff.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">{getRoleBadge(staff.role)}</td>
                  <td className="px-5 py-4 text-center">
                    <button onClick={() => handleToggle(staff.id)} className="inline-flex transition hover:scale-110">
                      {staff.active ? (
                        <UserCheck className="text-emerald-500" size={22} />
                      ) : (
                        <UserX className="text-slate-400" size={22} />
                      )}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleEdit(staff)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(staff.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {staffList.length === 0 && (
          <div className="p-8 text-center text-slate-500">No staff members found</div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-800">
                {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
              </h3>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                >
                  <option value="admin">Admin</option>
                  <option value="kitchen">Kitchen Staff</option>
                  <option value="waiter">Waiter</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    required
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-indigo-500 rounded"
                />
                <span className="text-sm text-slate-700">Active (can login)</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition text-sm"
                >
                  {editingStaff ? 'Update' : 'Add Staff'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 border border-gray-200 text-slate-700 rounded-xl hover:bg-gray-50 transition text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
