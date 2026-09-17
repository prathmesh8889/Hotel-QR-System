import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, ArrowLeft } from 'lucide-react';

export default function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tableId = searchParams.get('tableId');

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          {/* Success Animation */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-20" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <CheckCircle className="text-white" size={40} />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Placed!</h1>
          <p className="text-gray-500 mb-6">Your order has been sent to the kitchen. We'll have it ready shortly.</p>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl">
              <Clock className="text-orange-500" size={20} />
              <div className="text-left">
                <p className="text-sm text-gray-500">Estimated Time</p>
                <p className="font-semibold text-gray-800">15-20 minutes</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
              <span className="text-xl">🪑</span>
              <div className="text-left">
                <p className="text-sm text-gray-500">Table</p>
                <p className="font-semibold text-gray-800">Table {tableId}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl">
              <span className="text-xl">👨‍🍳</span>
              <div className="text-left">
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-semibold text-emerald-600">Preparing your food...</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate(`/menu?tableId=${tableId}`)}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30"
          >
            <ArrowLeft size={18} />
            Back to Menu
          </button>

          <p className="mt-6 text-xs text-gray-400">Thank you for dining with us! 🙏</p>
        </div>
      </div>
    </div>
  );
}
