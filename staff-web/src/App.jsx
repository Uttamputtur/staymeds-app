import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PatientsPage from './pages/PatientsPage';
import PatientDetailPage from './pages/PatientDetailPage';
import AlertsPage from './pages/AlertsPage';
import HistoryPage from './pages/HistoryPage';
import AuditLogsPage from './pages/AuditLogsPage';
import SettingsPage from './pages/SettingsPage';
import api from './services/api';
import { requestNotificationPermission, sendDesktopNotification } from './utils/notifications';

const ProtectedLayout = ({ children }) => {
  const { token, loading } = useAuth();
  const [missedAlertsCount, setMissedAlertsCount] = useState(0);
  const [previousAlertIds, setPreviousAlertIds] = useState(new Set());

  useEffect(() => {
    if (token) {
      // Request browser notification permission for staff
      requestNotificationPermission();

      const checkAlerts = async () => {
        try {
          const res = await api.get('/alerts/all');
          const unreadAlerts = res.data.filter(a => !a.is_read);
          setMissedAlertsCount(unreadAlerts.length);

          // Check for newly arrived missed alerts to trigger desktop notification
          unreadAlerts.forEach(alert => {
            if (!previousAlertIds.has(alert.id)) {
              sendDesktopNotification("🚨 StayMeds Missed Medication Alert", {
                body: `Patient: ${alert.patient_name} (Room ${alert.room_number}) — ${alert.medicine_name} scheduled at ${alert.scheduled_time} was not confirmed.`,
              });
            }
          });

          setPreviousAlertIds(new Set(res.data.map(a => a.id)));
        } catch (err) {
          // silent error handling for background polling
        }
      };

      checkAlerts();
      const interval = setInterval(checkAlerts, 10000);
      return () => clearInterval(interval);
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-teal-400 font-semibold">
        Initializing StayMeds Portal...
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar missedAlertsCount={missedAlertsCount} />
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Hospital Staff Routes */}
          <Route
            path="/"
            element={
              <ProtectedLayout>
                <DashboardPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/patients"
            element={
              <ProtectedLayout>
                <PatientsPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/patients/:id"
            element={
              <ProtectedLayout>
                <PatientDetailPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/alerts"
            element={
              <ProtectedLayout>
                <AlertsPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedLayout>
                <HistoryPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/audit-logs"
            element={
              <ProtectedLayout>
                <AuditLogsPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedLayout>
                <SettingsPage />
              </ProtectedLayout>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
