import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import ProtectedLayout from './components/Layout/ProtectedLayout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LiveOrders from './pages/LiveOrders';
import KitchenPage from './pages/KitchenPage';
import MenuManagement from './pages/MenuManagement';
import TableManagement from './pages/TableManagement';
import StaffManagement from './pages/StaffManagement';
import SettingsPage from './pages/SettingsPage';
import CustomerFlow from './pages/CustomerFlow';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import OrderHistory from './pages/OrderHistory';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { auth } = useAuth();
  if (!auth.isLoggedIn) return <Navigate to="/login" replace />;
  if (allowedRoles && auth.role && !allowedRoles.includes(auth.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public: Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Protected Routes (wrapped in layout with sidebar) */}
      <Route
        element={
          <ProtectedRoute>
            <ProtectedLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard - Both roles */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Live Orders - Both roles */}
        <Route path="/live-orders" element={<LiveOrders />} />

        {/* Admin-only routes */}
        <Route
          path="/analytics"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AnalyticsDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-history"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <OrderHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kitchen"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <KitchenPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/menu-management"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <MenuManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/table-management"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <TableManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <StaffManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Customer Flow (QR Code Scan) */}
      <Route path="/menu" element={<CustomerFlow />} />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
