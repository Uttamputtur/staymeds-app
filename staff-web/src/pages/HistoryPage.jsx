import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { History, Pill, CheckCircle2, Clock, AlertTriangle, Search, Filter } from 'lucide-react';

export default function HistoryPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/medication-history/all');
        setLogs(res.data);
      } catch (err) {
        console.error("Error fetching medication history logs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
      log.medicine_name?.toLowerCase().includes(search.toLowerCase()) ||
      log.room_number?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hospital Medication History</h1>
        <p className="text-xs text-slate-400 mt-1">Audit log of all given, pending, and missed medication events</p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by patient name, medication, or room number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="taken">Taken</option>
            <option value="pending">Pending</option>
            <option value="missed">Missed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading log history...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No logs match your filter criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3">Room</th>
                  <th className="pb-3">Patient Name</th>
                  <th className="pb-3">Medication</th>
                  <th className="pb-3">Scheduled Time</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Confirmation Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 font-bold text-slate-900">Room {log.room_number}</td>
                    <td className="py-3.5 font-semibold text-slate-800">{log.patient_name}</td>
                    <td className="py-3.5 font-semibold text-teal-700 flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5 text-teal-600" />
                      {log.medicine_name} ({log.dosage_instruction})
                    </td>
                    <td className="py-3.5 font-medium text-slate-600">{log.scheduled_time}</td>
                    <td className="py-3.5 text-slate-500">{log.scheduled_for_date}</td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        log.status === 'taken' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : log.status === 'missed' 
                          ? 'bg-red-50 text-red-700 border border-red-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {log.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-400">
                      {log.taken_at ? new Date(log.taken_at).toLocaleString() : '—'}
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
