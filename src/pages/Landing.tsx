import { useNavigate } from 'react-router-dom';
import { QrCode, Monitor, Smartphone, ArrowRight, Shield, ChefHat, Zap, Globe } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-full text-sm font-medium mb-6">
            <Zap size={14} />
            Enterprise Restaurant Management
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            QR Code Based<br />
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Hotel Ordering System
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
            A complete digital ordering solution. Customers scan, browse, and order from their phone.
            Real-time kitchen display. Professional admin dashboard. No app required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/admin/login')}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition shadow-lg shadow-indigo-500/30"
            >
              <Shield size={18} />
              Admin Login
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/menu?tableId=1')}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition border border-white/20"
            >
              <Smartphone size={18} />
              Customer Demo
            </button>
          </div>
        </div>

        {/* How It Works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: QrCode, title: '1. Scan QR Code', desc: 'Customer scans QR on their table', color: 'from-orange-500 to-amber-500' },
            { icon: Smartphone, title: '2. Browse & Order', desc: 'View menu, add to cart, checkout', color: 'from-indigo-500 to-purple-500' },
            { icon: Monitor, title: '3. Kitchen Receives', desc: 'Real-time order display in kitchen', color: 'from-emerald-500 to-teal-500' },
          ].map((step, idx) => (
            <div key={idx} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition">
              <div className={`w-14 h-14 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                <step.icon className="text-white" size={24} />
              </div>
              <h3 className="font-bold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-slate-400">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white text-center mb-8">System Features</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '📱', label: 'Mobile First', desc: 'Responsive design' },
              { icon: '⚡', label: 'Real-time', desc: 'Instant updates' },
              { icon: '🔒', label: 'Role-based', desc: 'Admin & Kitchen' },
              { icon: '🖨️', label: 'QR Codes', desc: 'Auto-generated' },
              { icon: '🛒', label: 'Smart Cart', desc: 'Easy ordering' },
              { icon: '📊', label: 'Dashboard', desc: 'Live analytics' },
              { icon: '🌐', label: 'No App', desc: 'Browser-based' },
              { icon: '👨‍🍳', label: 'KDS', desc: 'Kitchen display' },
            ].map((feat, idx) => (
              <div key={idx} className="text-center">
                <span className="text-3xl block mb-2">{feat.icon}</span>
                <p className="text-white text-sm font-medium">{feat.label}</p>
                <p className="text-slate-500 text-xs">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="text-center mt-12">
          <p className="text-slate-500 text-sm">
            Built with React • TypeScript • Tailwind CSS • Socket.io Simulation • QR Code Generation
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-slate-600 text-xs">
            <Globe size={12} />
            <span>HotelOS v2.0 — Enterprise Edition</span>
          </div>
        </div>
      </div>
    </div>
  );
}
