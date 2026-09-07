import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatsCard from '../components/StatsCard';
import TimelineView from '../components/TimelineView';
import AddPatientModal from '../components/AddPatientModal';
import { 
  Users, 
  CalendarCheck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  UserPlus, 
  RefreshCw,
  ArrowRight,
  Pill,
  FolderPlus
} from 'lucide-react';

export default function DashboardPage() {
  const { hospital } = useAuth();
  const [stats, setStats] = useState(null);
  const [todayLogs, setTodayLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);

  const fetchDashboardData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [statsRes, logsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/medication-history/all')
      ]);

      setStats(statsRes.data);
      const todayStr = new Date().toISOString().split('T')[0];
      const filteredToday = logsRes.data.filter(log => log.scheduled_for_date === todayStr);
      setTodayLogs(filteredToday);
    } catch (err) {
      console.error("Error fetching dashboard data", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => fetchDashboardData(), 10000);
    return () => clearInterval(interval);
  }, []);

  const totalPatients = stats?.total_active_patients ?? 0;

  return (
    <div className="space-y-6">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-teal-600">
            {hospital?.name || 'Hospital Portal'} Overview
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Hospital Staff Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time medication adherence & patient alerts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchDashboardData(true)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync Status</span>
          </button>

          <button
            onClick={() => setIsAddPatientOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 shadow-lg shadow-teal-600/20 transition-all flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Patient</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Active Patients"
          count={stats?.total_active_patients ?? 0}
          icon={Users}
          color="neutral"
          subtext="in care"
        />
        <StatsCard
          title="Scheduled Today"
          count={stats?.medications_scheduled_today ?? 0}
          icon={CalendarCheck}
          color="blue"
          subtext="total doses"
        />
        <StatsCard
          title="Medications Taken"
          count={stats?.medications_taken_today ?? 0}
          icon={CheckCircle2}
          color="green"
          subtext="confirmed"
        />
        <StatsCard
          title="Pending / Due"
          count={stats?.medications_pending_today ?? 0}
          icon={Clock}
          color="orange"
          subtext="awaiting action"
        />
        <StatsCard
          title="Missed Meds"
          count={stats?.medications_missed_today ?? 0}
          icon={AlertTriangle}
          color="red"
          subtext="requires attention"
        />
      </div>

      {/* Missed Medication Alerts Highlight Banner */}
      {stats?.missed_alerts && stats.missed_alerts.length > 0 && (
        <div className="p-5 rounded-2xl bg-red-500/10 border-2 border-red-500/30 text-red-900 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 animate-bounce" />
              <h3 className="font-bold text-sm uppercase tracking-wider">
                ⚠️ {stats.missed_alerts.length} Missed Medication Alert{stats.missed_alerts.length > 1 ? 's' : ''}
              </h3>
            </div>
            <Link
              to="/alerts"
              className="text-xs font-bold text-red-700 hover:text-red-900 underline flex items-center gap-1"
            >
              View All Alerts <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.missed_alerts.slice(0, 3).map((alert) => (
              <div
                key={alert.log_id}
                className="p-3.5 rounded-xl bg-white border border-red-200/80 shadow-sm flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-700">
                      Room {alert.room_number}
                    </span>
                    <span className="text-xs font-bold text-slate-800">{alert.patient_name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-700 font-semibold">
                    <Pill className="w-3.5 h-3.5 text-red-500" />
                    <span>{alert.medicine_name}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Scheduled at {alert.scheduled_time} ({alert.dosage_instruction})
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fresh Empty State Callout when total active patients === 0 */}
      {!loading && totalPatients === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm my-6 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
            <FolderPlus className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-xl">No patients yet</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Add your first patient to start managing medication schedules and monitoring daily adherence.
            </p>
          </div>
          <button
            onClick={() => setIsAddPatientOpen(true)}
            className="px-6 py-3 rounded-2xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 shadow-lg shadow-teal-600/20 transition-all inline-flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Patient</span>
          </button>
        </div>
      ) : (
        /* Today's Medication Timeline */
        <TimelineView logs={todayLogs} />
      )}

      {/* Add Patient Modal */}
      <AddPatientModal
        isOpen={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
        onPatientAdded={() => fetchDashboardData()}
      />
    </div>
  );
}
