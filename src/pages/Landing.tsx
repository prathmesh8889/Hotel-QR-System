import { useNavigate } from 'react-router-dom';
import { QrCode, Monitor, Smartphone, ArrowRight } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-6">
            <QrCode size={16} />
            QR Code Ordering System
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Hotel Digital<br />
            <span className="text-amber-500">Ordering System</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A complete QR code-based restaurant ordering solution. Customers scan, browse, and order — 
            all from their phone. No app required.
          </p>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-sm border text-center">
            <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Smartphone className="text-amber-600" size={28} />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">1. Scan QR Code</h3>
            <p className="text-sm text-gray-500">Customer scans the QR code placed on their table</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border text-center">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <h3 className="font-bold text-gray-800 mb-2">2. Browse & Order</h3>
            <p className="text-sm text-gray-500">View menu, add items to cart, and place order</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border text-center">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Monitor className="text-green-600" size={28} />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">3. Kitchen Receives</h3>
            <p className="text-sm text-gray-500">Order appears instantly on admin dashboard</p>
          </div>
        </div>

        {/* Quick Access */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <button
            onClick={() => navigate('/admin/login')}
            className="group bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md hover:border-amber-300 transition text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center group-hover:bg-amber-200 transition">
                <Monitor className="text-amber-600" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">Admin Dashboard</h3>
                <p className="text-sm text-gray-500">Manage menu, tables & orders</p>
              </div>
              <ArrowRight className="text-gray-400 group-hover:text-amber-500 transition" size={20} />
            </div>
          </button>

          <button
            onClick={() => navigate('/menu?tableId=1')}
            className="group bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md hover:border-green-300 transition text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition">
                <Smartphone className="text-green-600" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">Customer Demo</h3>
                <p className="text-sm text-gray-500">Try the ordering experience</p>
              </div>
              <ArrowRight className="text-gray-400 group-hover:text-green-500 transition" size={20} />
            </div>
          </button>
        </div>

        {/* Features */}
        <div className="mt-12 bg-white rounded-2xl p-6 shadow-sm border">
          <h2 className="font-bold text-gray-800 text-center mb-6">System Features</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <span className="text-2xl block mb-1">📱</span>
              <p className="text-xs text-gray-600 font-medium">Mobile First</p>
            </div>
            <div>
              <span className="text-2xl block mb-1">⚡</span>
              <p className="text-xs text-gray-600 font-medium">Real-time Updates</p>
            </div>
            <div>
              <span className="text-2xl block mb-1">🔒</span>
              <p className="text-xs text-gray-600 font-medium">Secure Login</p>
            </div>
            <div>
              <span className="text-2xl block mb-1">🖨️</span>
              <p className="text-xs text-gray-600 font-medium">Print QR Codes</p>
            </div>
            <div>
              <span className="text-2xl block mb-1">🛒</span>
              <p className="text-xs text-gray-600 font-medium">Cart System</p>
            </div>
            <div>
              <span className="text-2xl block mb-1">📊</span>
              <p className="text-xs text-gray-600 font-medium">Order Tracking</p>
            </div>
            <div>
              <span className="text-2xl block mb-1">🌐</span>
              <p className="text-xs text-gray-600 font-medium">No App Needed</p>
            </div>
            <div>
              <span className="text-2xl block mb-1">📶</span>
              <p className="text-xs text-gray-600 font-medium">Works Offline</p>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            Built with React • Tailwind CSS • Socket.io Simulation • QR Code Generation
          </p>
        </div>
      </div>
    </div>
  );
}
