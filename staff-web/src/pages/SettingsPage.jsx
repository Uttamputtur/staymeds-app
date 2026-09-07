import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, ShieldCheck, Clock, Bell, Info } from 'lucide-react';

export default function SettingsPage() {
  const { hospital } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hospital Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Configure your hospital profile and medication alert parameters</p>
      </div>

      {/* Hospital Profile Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-teal-600" />
          Registered Hospital Profile
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hospital Name</span>
            <p className="font-bold text-slate-900 mt-0.5">{hospital?.name || 'CarePlus Hospital'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hospital Email</span>
            <p className="font-bold text-slate-900 mt-0.5">{hospital?.email || 'staff@careplus.com'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone Contact</span>
            <p className="font-bold text-slate-900 mt-0.5">{hospital?.phone || '+1 (555) 019-2834'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Security Isolation</span>
            <p className="font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Hospital Data Encrypted & Isolated
            </p>
          </div>
        </div>
      </div>

      {/* Missed Medication Grace Period Configuration */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-teal-600" />
          Missed Medication Alert Threshold
        </h2>

        <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100 space-y-2">
          <div className="flex items-center gap-2 text-teal-900 font-bold text-sm">
            <Bell className="w-4 h-4 text-teal-600" />
            <span>Default Grace Period: 15 Minutes</span>
          </div>
          <p className="text-xs text-slate-600">
            If a hospitalized patient does not confirm a scheduled dose within 15 minutes of the target time, StayMeds automatically flags the dose as <span className="font-bold text-red-600">🔴 MISSED</span> and triggers an active alert banner on staff dashboards.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 flex items-start gap-3 text-xs text-amber-900">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p>
            StayMeds is designed strictly as a clinical schedule reminder tool. It does not automatically dictate clinical dosages or medical decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
