import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, AlertCircle, Shield, ChefHat } from 'lucide-react';
import { UserRole } from '../types';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      if (login(username, password, role)) {
        navigate(role === 'kitchen' ? '/kitchen' : '/admin');
      } else {
        setError('Invalid credentials. Check the demo credentials below.');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
            <span className="text-3xl">🍽️</span>
          </div>
          <h1 className="text-2xl font-bold text-white">HotelOS</h1>
          <p className="text-slate-400 mt-1">Enterprise Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Sign In</h2>

          {/* Role Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Login As</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                  role === 'admin'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <Shield size={18} />
                <span className="font-medium text-sm">Admin</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('kitchen')}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                  role === 'kitchen'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <ChefHat size={18} />
                <span className="font-medium text-sm">Kitchen</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm"
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 text-white font-semibold rounded-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                role === 'admin'
                  ? 'bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/30'
                  : 'bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/30'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                `Sign In as ${role === 'admin' ? 'Admin' : 'Kitchen Staff'}`
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-slate-50 rounded-xl">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Demo Credentials</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Admin:</span>
                <code className="text-indigo-600 font-mono text-xs bg-indigo-50 px-2 py-0.5 rounded">admin / admin123</code>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Kitchen:</span>
                <code className="text-orange-600 font-mono text-xs bg-orange-50 px-2 py-0.5 rounded">kitchen / kitchen123</code>
              </div>
            </div>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-slate-400 hover:text-white text-sm transition"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
