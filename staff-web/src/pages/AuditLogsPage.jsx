import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ShieldCheck, Search, Filter, Clock, User, FileText, CheckCircle2, AlertTriangle, Pill, UserCheck } from 'lucide-react';

export default function AuditLogsPage() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        const res = await api.get('/audit-logs');
        setAuditLogs(res.data);
      } catch (err) {
        console.error("Error fetching audit logs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAuditLogs();
  }, []);

  const getActionBadge = (action) => {
    switch (action) {
      case 'HOSPITAL_REGISTERED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">Hospital Registered</span>;
      case 'STAFF_LOGIN':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">Staff Sign In</span>;
      case 'PATIENT_CREATED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">Patient Added</span>;
      case 'PATIENT_UPDATED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">Patient Updated</span>;
      case 'MEDICATION_CREATED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Medication Scheduled</span>;
      case 'MEDICATION_TAKEN':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Dose Confirmed (Taken)</span>;
      case 'MEDICATION_MISSED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 animate-pulse">Dose Missed</span>;
      case 'PATIENT_DISCHARGED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">Patient Discharged</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-50 text-slate-700 border border-slate-200">{action}</span>;
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.actor_name.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());

    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Security & Clinical Governance</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hospital Audit Trail Logs</h1>
          <p className="text-xs text-slate-400 mt-0.5">Immutable record of all hospital registration, staff, patient, and medication events</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by action, staff/patient name, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white"
          >
            <option value="all">All Audit Actions</option>
            <option value="MEDICATION_TAKEN">Medication Taken</option>
            <option value="MEDICATION_MISSED">Medication Missed</option>
            <option value="PATIENT_CREATED">Patient Added</option>
            <option value="MEDICATION_CREATED">Medication Scheduled</option>
            <option value="STAFF_LOGIN">Staff Sign In</option>
            <option value="PATIENT_DISCHARGED">Patient Discharged</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading audit trail...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No audit events logged yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Action Event</th>
                  <th className="pb-3">Actor</th>
                  <th className="pb-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 font-medium text-slate-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString([], {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3.5 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="py-3.5 font-bold text-slate-900 whitespace-nowrap">
                      {log.actor_name}
                    </td>
                    <td className="py-3.5 text-slate-700 font-medium max-w-md">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
