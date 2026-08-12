import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell, ProtectedRoute } from './components/layout/AppShell';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CustomersPage } from './pages/CustomersPage';
import { CustomerDetailPage } from './pages/CustomerDetailPage';
import { ProductsPage } from './pages/ProductsPage';
import { InventoryPage } from './pages/InventoryPage';
import { ChallansPage } from './pages/ChallansPage';
import { ChallanCreatePage } from './pages/ChallanCreatePage';
import { ChallanDetailPage } from './pages/ChallanDetailPage';
import { AccessDeniedPage, NotFoundPage, SettingsPage } from './pages/MiscPages';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/access-denied" element={<AccessDeniedPage />} />

        {/* Protected Application Routes */}
        <Route path="/" element={<AppShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          <Route element={<ProtectedRoute allowedRoles={['admin', 'sales', 'warehouse', 'accounts']} />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin', 'sales', 'accounts']} />}>
            <Route path="customers" element={<CustomersPage />} />
            <Route path="customers/:id" element={<CustomerDetailPage />} />
            <Route path="challans" element={<ChallansPage />} />
            <Route path="challans/create" element={<ChallanCreatePage />} />
            <Route path="challans/:id" element={<ChallanDetailPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin', 'warehouse']} />}>
            <Route path="products" element={<ProductsPage />} />
            <Route path="inventory" element={<InventoryPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
