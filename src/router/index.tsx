import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import MainLayout from '../components/Layout/MainLayout';
import LoginPage from '../pages/Login/LoginPage';
import Dashboard from '../pages/Dashboard/Dashboard';
import Applications from '../pages/Applications/Applications';
import ApplicationDetail from '../pages/Applications/ApplicationDetail';
import NewApplication from '../pages/Applications/NewApplication';
import Drones from '../pages/Drones/Drones';
import DroneDetail from '../pages/Drones/DroneDetail';
import Inventory from '../pages/Inventory/Inventory';
import OutboundApprovals from '../pages/Inventory/OutboundApprovals';
import PurchaseApprovals from '../pages/Inventory/PurchaseApprovals';
import Environment from '../pages/Environment/Environment';
import EnvAlerts from '../pages/Environment/EnvAlerts';
import Reports from '../pages/Reports/Reports';
import ReportDetail from '../pages/Reports/ReportDetail';
import UserManagement from '../pages/System/UserManagement';
import SystemSettings from '../pages/System/SystemSettings';
import { useAuthStore } from '../store/useAuthStore';
import type { ReactNode } from 'react';

const ProtectedRoute = ({ children, roles }: { children: ReactNode; roles?: string[] }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.role) && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRouter = () => {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#4CAF50',
          borderRadius: 6,
          colorBgContainer: '#263238',
          colorBgElevated: '#1A2329',
          colorBorder: '#455A64',
          colorText: '#ECEFF1',
          colorTextSecondary: '#B0BEC5',
          colorTextTertiary: '#78909C',
          colorTextQuaternary: '#546E7A',
        },
        components: {
          Table: {
            headerBg: '#1A2329',
            rowHoverBg: '#263238',
            borderColor: '#37474F',
          },
          Modal: {
            contentBg: '#1A2329',
            headerBg: '#1A2329',
          },
          Select: {
            optionSelectedBg: '#1B5E20',
          },
        },
      }}
    >
      <AntdApp>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />

              <Route
                path="applications"
                element={
                  <ProtectedRoute roles={['farmer', 'supervisor']}>
                    <Applications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="applications/new"
                element={
                  <ProtectedRoute roles={['farmer']}>
                    <NewApplication />
                  </ProtectedRoute>
                }
              />
              <Route
                path="applications/:id"
                element={
                  <ProtectedRoute roles={['farmer', 'supervisor']}>
                    <ApplicationDetail />
                  </ProtectedRoute>
                }
              />

              <Route
                path="drones"
                element={
                  <ProtectedRoute roles={['pilot', 'supervisor']}>
                    <Drones />
                  </ProtectedRoute>
                }
              />
              <Route
                path="drones/:id"
                element={
                  <ProtectedRoute roles={['pilot', 'supervisor']}>
                    <DroneDetail />
                  </ProtectedRoute>
                }
              />

              <Route
                path="inventory"
                element={
                  <ProtectedRoute roles={['supervisor']}>
                    <Inventory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="inventory/outbound"
                element={
                  <ProtectedRoute roles={['supervisor', 'env_officer']}>
                    <OutboundApprovals />
                  </ProtectedRoute>
                }
              />
              <Route
                path="inventory/purchase"
                element={
                  <ProtectedRoute roles={['supervisor', 'admin']}>
                    <PurchaseApprovals />
                  </ProtectedRoute>
                }
              />

              <Route
                path="environment"
                element={
                  <ProtectedRoute roles={['env_officer', 'supervisor']}>
                    <Environment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="environment/alerts"
                element={
                  <ProtectedRoute roles={['env_officer']}>
                    <EnvAlerts />
                  </ProtectedRoute>
                }
              />

              <Route
                path="reports"
                element={
                  <ProtectedRoute roles={['farmer', 'supervisor']}>
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="reports/:id"
                element={
                  <ProtectedRoute roles={['farmer', 'supervisor']}>
                    <ReportDetail />
                  </ProtectedRoute>
                }
              />

              <Route
                path="system/users"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="system/settings"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <SystemSettings />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
};

export default AppRouter;
