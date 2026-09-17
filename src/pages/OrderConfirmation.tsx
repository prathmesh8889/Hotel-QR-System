import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, ArrowLeft } from 'lucide-react';

export default function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tableId = searchParams.get('tableId');

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Success Animation */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-20"></div>
            <div className="relative w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="text-white" size={40} />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Placed!</h1>
          <p className="text-gray-500 mb-6">
            Your order has been sent to the kitchen. We'll have it ready for you shortly.
          </p>

          <div className="bg-amber-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-amber-700">
              <Clock size={18} />
              <span className="font-medium">Estimated time: 15-20 minutes</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">🪑</span>
              <div className="text-left">
                <p className="text-sm text-gray-500">Table</p>
                <p className="font-semibold text-gray-800">{tableId || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">👨‍🍳</span>
              <div className="text-left">
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-semibold text-amber-600">Preparing your food...</p>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <button
              onClick={() => navigate(`/menu?tableId=${tableId}`)}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition flex items-center justify-center gap-2"
            >
              <ArrowLeft size={18} />
              Back to Menu
            </button>
          </div>

          <p className="mt-6 text-xs text-gray-400">
            Thank you for dining with us! 🙏
          </p>
        </div>
      </div>
    </div>
  );
}
