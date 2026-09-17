import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import ProtectedLayout from './components/Layout/ProtectedLayout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LiveOrders from './pages/LiveOrders';
import MenuManagement from './pages/MenuManagement';
import TableManagement from './pages/TableManagement';
import SettingsPage from './pages/SettingsPage';

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
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
      </Route>

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
