import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import AdminLayout from './components/Layout/AdminLayout';
import KitchenLayout from './components/Layout/KitchenLayout';
import CustomerLayout from './components/Layout/CustomerLayout';

// Pages
import Landing from './pages/Landing';
import AdminLogin from './pages/AdminLogin';
import AdminDashboardPage from './pages/AdminDashboardPage';
import LiveOrdersPage from './pages/LiveOrdersPage';
import AdminMenuPage from './pages/AdminMenuPage';
import AdminTablesPage from './pages/AdminTablesPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import KitchenView from './pages/KitchenView';
import KitchenHistory from './pages/KitchenHistory';
import CustomerMenu from './pages/CustomerMenu';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderStatus from './pages/OrderStatus';

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { auth } = useAuth();
  if (!auth.isLoggedIn) return <Navigate to="/admin/login" replace />;
  if (auth.role !== 'admin') return <Navigate to="/kitchen" replace />;
  return <>{children}</>;
}

function ProtectedKitchenRoute({ children }: { children: React.ReactNode }) {
  const { auth } = useAuth();
  if (!auth.isLoggedIn) return <Navigate to="/admin/login" replace />;
  if (auth.role !== 'kitchen') return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="orders" element={<LiveOrdersPage />} />
            <Route path="menu" element={<AdminMenuPage />} />
            <Route path="tables" element={<AdminTablesPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Kitchen Routes */}
          <Route
            path="/kitchen"
            element={
              <ProtectedKitchenRoute>
                <KitchenLayout />
              </ProtectedKitchenRoute>
            }
          >
            <Route index element={<KitchenView />} />
            <Route path="history" element={<KitchenHistory />} />
          </Route>

          {/* Customer Routes */}
          <Route path="/customer" element={<CustomerLayout />}>
            <Route path="menu" element={<CustomerMenu />} />
            <Route path="order-status" element={<OrderStatus />} />
          </Route>

          {/* Direct customer routes (from QR scan) */}
          <Route path="/menu" element={<CustomerMenu />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
