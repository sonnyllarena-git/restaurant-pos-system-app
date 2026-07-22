import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import POSPage from './pages/POSPage';
import KitchenPage from './pages/KitchenPage';
import InventoryPage from './pages/InventoryPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import StaffPage from './pages/StaffPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import NotFoundPage from './pages/NotFoundPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

import POSScreen from './components/pos/POSScreen';
import PaymentScreen from './components/pos/PaymentScreen';
import DailyDashboard from './components/reports/DailyDashboard';
import DailyReport from './components/reports/DailyReport';
import MonthlyReport from './components/reports/MonthlyReport';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/pos"
          element={
            <ProtectedRoute requiredRoles={['admin', 'cashier']}>
              <POSPage />
            </ProtectedRoute>
          }
        >
          <Route index element={<POSScreen />} />
          <Route path="payment" element={<PaymentScreen />} />
        </Route>

        <Route
          path="/kitchen"
          element={
            <ProtectedRoute requiredRoles={['admin', 'kitchen']}>
              <KitchenPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory"
          element={
            <ProtectedRoute requiredRoles={['admin', 'cashier']}>
              <InventoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute requiredRoles={['admin', 'cashier', 'viewer']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        >
          <Route index element={<DailyDashboard />} />
          <Route path="daily" element={<DailyReport />} />
          <Route path="monthly" element={<MonthlyReport />} />
        </Route>

        <Route
          path="/staff"
          element={
            <ProtectedRoute requiredRoles={['admin']}>
              <StaffPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute requiredRoles={['admin']}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/order-history"
          element={
            <ProtectedRoute requiredRoles={['admin', 'cashier', 'viewer']}>
              <OrderHistoryPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
