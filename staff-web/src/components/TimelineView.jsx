import React from 'react';
import { Pill, CheckCircle2, Clock, AlertTriangle, Calendar } from 'lucide-react';

export default function TimelineView({ logs = [] }) {
  if (logs.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
        <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-3" />
        <p className="text-sm font-medium text-slate-600">No medication schedules recorded for today yet.</p>
        <p className="text-xs text-slate-400 mt-1">Add medications to patient profiles to build today's timeline.</p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'taken':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <CheckCircle2 className="w-3.5 h-3.5" /> Taken
          </span>
        );
      case 'missed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200/60 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" /> Missed Alert
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
            <Clock className="w-3.5 h-3.5" /> Take Now / Pending
          </span>
        );
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
        <Pill className="w-4 h-4 text-teal-600" />
        Today's Medication Timeline
      </h3>

      <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {logs.map((log) => {
          const isTaken = log.status === 'taken';
          const isMissed = log.status === 'missed';

          const pointBg = isTaken 
            ? 'bg-emerald-500 ring-emerald-100' 
            : isMissed 
            ? 'bg-red-500 ring-red-100 animate-pulse' 
            : 'bg-amber-500 ring-amber-100';

          return (
            <div key={log.id} className="relative group">
              {/* Timeline Point */}
              <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full ${pointBg} ring-4 border-2 border-white`} />

              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-teal-100 hover:shadow-sm transition-all duration-200">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-800 text-sm">
                        {log.scheduled_time}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200/60 text-slate-700">
                        Room {log.room_number || 'N/A'}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {log.patient_name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Pill className="w-4 h-4 text-teal-600 flex-shrink-0" />
                      <span className="font-semibold text-slate-900 text-base">
                        {log.medicine_name}
                      </span>
                      <span className="text-xs text-slate-500">
                        ({log.dosage_instruction})
                      </span>
                    </div>

                    {log.special_instructions && (
                      <p className="mt-1.5 text-xs text-slate-500 italic bg-amber-50/50 px-2.5 py-1 rounded border border-amber-100/60 inline-block">
                        "{log.special_instructions}"
                      </p>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0">
                    {getStatusBadge(log.status)}
                    {isTaken && log.taken_at && (
                      <p className="text-[11px] text-slate-400 mt-1">
                        Confirmed at {new Date(log.taken_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
