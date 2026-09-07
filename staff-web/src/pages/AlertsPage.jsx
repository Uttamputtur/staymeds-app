import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { AlertTriangle, Bed, Pill, Clock, ArrowRight, RefreshCw, CheckCircle2, Check } from 'lucide-react';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/alerts/all');
      setAlerts(res.data);
    } catch (err) {
      console.error("Error fetching staff alerts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (alertId, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.post(`/alerts/${alertId}/read`);
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, is_read: true } : a));
    } catch (err) {
      console.error("Error marking alert as read", err);
    }
  };

  const unreadAlerts = alerts.filter(a => !a.is_read);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              unreadAlerts.length > 0 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-slate-100 text-slate-600'
            }`}>
              {unreadAlerts.length > 0 ? `🔴 ${unreadAlerts.length} Unread Missed Alerts` : 'All Alerts Cleared'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Missed Medication Alerts</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Patients who have not confirmed scheduled doses within the allowed grace period
          </p>
        </div>

        <button
          onClick={fetchAlerts}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Alerts</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Checking missed alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
          <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-3" />
          <h3 className="font-bold text-slate-900 text-lg">No Missed Medication Alerts</h3>
          <p className="text-xs text-slate-400 mt-1">
            All active patients are up to date on scheduled medication doses.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.map((alert) => {
            const isUnread = !alert.is_read;

            return (
              <div
                key={alert.id}
                className={`p-6 rounded-3xl border-2 transition-all relative overflow-hidden ${
                  isUnread
                    ? 'bg-white border-red-300 shadow-md ring-2 ring-red-500/10'
                    : 'bg-slate-50/70 border-slate-200 opacity-80'
                }`}
              >
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${isUnread ? 'bg-red-500' : 'bg-slate-300'}`} />

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 border ${
                        isUnread ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        <Bed className="w-3.5 h-3.5" /> Room {alert.room_number || 'N/A'}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        Code: {alert.patient_code}
                      </span>
                      {isUnread && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-red-500 text-white">
                          Unread
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-xl">{alert.patient_name || 'Patient'}</h3>

                    <div className="mt-4 p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5 shadow-sm">
                      <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                        <Pill className="w-4 h-4 text-red-500" />
                        <span>{alert.medicine_name || 'Medication'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-red-700 pt-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Scheduled: {alert.scheduled_time}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 items-end">
                    <Link
                      to={`/patients/${alert.patient_id}`}
                      className="p-3 rounded-2xl bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-md shadow-teal-600/20 flex-shrink-0"
                      title="View Patient Details"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </Link>

                    {isUnread && (
                      <button
                        onClick={(e) => handleMarkRead(alert.id, e)}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200"
                        title="Mark as Read"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Mark Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
