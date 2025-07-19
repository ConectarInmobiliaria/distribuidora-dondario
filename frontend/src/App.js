import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import SellerDashboard from './pages/SellerDashboard';
import ZonesPage from './pages/ZonesPage';
import SellersPage from './pages/SellersPage';
import ClientsPage from './pages/ClientsPage';
import ProductsPage from './pages/ProductsPage';
import SalesPage from './pages/SalesPage';
import DeliverersPage from './pages/DeliverersPage';
import DeliveryBatchesPage from './pages/DeliveryBatchesPage';
import PrintPages from './pages/PrintPages';
import ClosuresPage from './pages/ClosuresPage';
import ReportsPage from './pages/ReportsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* 1. Raíz → Login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 2. Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* 3. Dashboard genérico */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            }
          />

          {/* 4. Panel Admin */}
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* 5. Panel Seller */}
          <Route
            path="/dashboard/seller"
            element={
              <ProtectedRoute roles={['seller']}>
                <SellerDashboard />
              </ProtectedRoute>
            }
          />

          {/* 6. Módulos Admin */}
          <Route
            path="/zones/*"
            element={
              <ProtectedRoute roles={['admin']}>
                <ZonesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sellers/*"
            element={
              <ProtectedRoute roles={['admin']}>
                <SellersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients/*"
            element={
              <ProtectedRoute roles={['admin','seller']}>
                <ClientsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/*"
            element={
              <ProtectedRoute roles={['admin']}>
                <ProductsPage />
              </ProtectedRoute>
            }
          />
<Route
  path="/sales/*"
  element={
    <ProtectedRoute roles={['admin','seller']}>
      <SalesPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/deliverers/*"
  element={
    <ProtectedRoute roles={['admin']}>
      <DeliverersPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/batches/*"
  element={
    <ProtectedRoute roles={['admin']}>
      <DeliveryBatchesPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/print/:type/:id"
  element={
    <ProtectedRoute roles={['admin','seller']}>
      <PrintPages />
    </ProtectedRoute>
  }
/>
<Route
  path="/closures/*"
  element={
    <ProtectedRoute roles={['admin','seller']}>
      <ClosuresPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/reports/*"
  element={
    <ProtectedRoute roles={['admin']}>
      <ReportsPage />
    </ProtectedRoute>
  }
/>
          {/* 7. Cualquier otra ruta → Login */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

// redirige según rol al Dashboard correspondiente
function DashboardRedirect() {
  const { user } = useContext(AuthContext);
  if (user.roles.includes('admin')) {
    return <Navigate to="/dashboard/admin" replace />;
  }
  return <Navigate to="/dashboard/seller" replace />;
}

export default App;
