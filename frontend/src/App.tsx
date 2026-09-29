import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ProjectsPage } from './pages/projects/ProjectsPage';
import { ProjectDetailPage } from './pages/projects/ProjectDetailPage';
import { MaterialsPage } from './pages/materials/MaterialsPage';
import { SuppliersPage } from './pages/suppliers/SuppliersPage';
import { PurchaseOrdersPage } from './pages/purchase-orders/PurchaseOrdersPage';
import { PurchaseOrderDetailPage } from './pages/purchase-orders/PurchaseOrderDetailPage';
import { InventoryPage } from './pages/inventory/InventoryPage';
import { WastePage } from './pages/waste/WastePage';
import { ConsumptionPage } from './pages/consumption/ConsumptionPage';
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';
import { UsersPage } from './pages/users/UsersPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { HomePage } from './pages/HomePage';

function App() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="app-loading">Checking your session...</div>;

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <HomePage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
      <Route
        element={user ? <ProjectProvider><AppLayout /></ProjectProvider> : <Navigate to="/login" replace />}
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/materials" element={<MaterialsPage />} />
        <Route path="/suppliers" element={<SuppliersPage />} />
        <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
        <Route path="/purchase-orders/:id" element={<PurchaseOrderDetailPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/inventory/transactions" element={<InventoryPage />} />
        <Route path="/waste" element={<WastePage />} />
        <Route path="/consumption" element={<ConsumptionPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Route>
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}

export default App;
