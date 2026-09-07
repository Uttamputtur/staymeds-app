import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  LogOut, 
  RefreshCw, 
  Calendar,
  Sparkles,
  Bell
} from 'lucide-react';
import api from '../services/api';
import { requestPatientNotificationPermission, sendPatientReminderNotification } from '../utils/notifications';

export default function TodayMedsScreen({ patient, onDisconnect, onSelectMedication }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifiedLogIds, setNotifiedLogIds] = useState(new Set());

  const fetchTodayLogs = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await api.get('/patient/today', {
        params: {
          room_number: patient.room_number,
          patient_code: patient.patient_code,
        },
      });
      setLogs(res.data);

      // Check for DUE medications and trigger notification
      res.data.forEach(log => {
        if (log.status === 'due' && !notifiedLogIds.has(log.id)) {
          sendPatientReminderNotification(log.medicine_name, log.scheduled_time);
          setNotifiedLogIds(prev => new Set(prev).add(log.id));
        }
      });

    } catch (err) {
      console.error("Error fetching patient today meds", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    requestPatientNotificationPermission();
    fetchTodayLogs();
    const interval = setInterval(() => fetchTodayLogs(), 5000);
    return () => clearInterval(interval);
  }, []);

  const dueLog = logs.find(log => log.status === 'due');
  const missedLogs = logs.filter(log => log.status === 'missed');
  const takenCount = logs.filter(log => log.status === 'taken').length;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto">
      {/* Top Mobile Header */}
      <div className="bg-teal-700 text-white p-5 pt-8 rounded-b-3xl shadow-lg sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Pill className="w-5 h-5 text-teal-200 rotate-45" />
            </div>
            <span className="font-extrabold text-white text-lg tracking-tight">StayMeds</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchTodayLogs(true)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              title="Refresh schedule"
            >
              <RefreshCw className={`w-4 h-4 text-teal-100 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onDisconnect}
              className="p-2 rounded-xl bg-white/10 hover:bg-red-500/30 text-teal-100 hover:text-white transition-colors"
              title="Disconnect"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Patient Greeting */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 flex items-center justify-between">
          <div>
            <p className="text-xs text-teal-100 font-semibold uppercase tracking-wider">Hello,</p>
            <h2 className="text-xl font-black text-white">{patient.name}</h2>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 rounded-xl bg-white text-teal-800 font-black text-sm shadow-sm inline-block">
              Room {patient.room_number}
            </span>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-4 space-y-4 flex-1">
        {/* Adherence Progress Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Today's Medication Status
            </span>
            <p className="text-lg font-black text-slate-900 mt-0.5">
              {takenCount} of {logs.length} Meds Taken
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-teal-50 border-2 border-teal-500 flex items-center justify-center font-bold text-teal-700 text-sm">
            {logs.length > 0 ? Math.round((takenCount / logs.length) * 100) : 0}%
          </div>
        </div>

        {/* Due Now Alert Banner */}
        {dueLog && (
          <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xl shadow-amber-500/20 animate-pop-in">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-5 h-5 animate-bounce" />
              <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                Medication DUE NOW ({dueLog.scheduled_time})
              </span>
            </div>

            <h3 className="text-2xl font-black">{dueLog.medicine_name}</h3>
            <p className="text-sm text-amber-50 mt-0.5 font-medium">{dueLog.dosage_instruction}</p>

            {dueLog.special_instructions && (
              <p className="mt-2 text-xs bg-black/10 p-2 rounded-xl text-amber-100 font-medium">
                "{dueLog.special_instructions}"
              </p>
            )}

            <button
              onClick={() => onSelectMedication(dueLog)}
              className="mt-4 w-full py-3.5 rounded-2xl bg-white text-orange-600 font-black text-base shadow-lg hover:bg-orange-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Pill className="w-5 h-5" />
              <span>Take Now</span>
            </button>
          </div>
        )}

        {/* Missed Warning Banner */}
        {missedLogs.length > 0 && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 space-y-1">
            <div className="flex items-center gap-2 font-bold text-xs text-red-700 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>Missed Medication Alert ({missedLogs.length})</span>
            </div>
            <p className="text-xs text-red-700">
              Please check with hospital staff regarding your missed dose: <span className="font-bold">{missedLogs[0].medicine_name}</span>.
            </p>
          </div>
        )}

        {/* Timeline Header */}
        <div className="pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-teal-600" />
            Today's Scheduled Medication List
          </h3>

          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading your medication list...</div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
              <Sparkles className="w-10 h-10 mx-auto text-teal-500 mb-2" />
              <p className="font-bold text-slate-800 text-base">No Medications Scheduled Today</p>
              <p className="text-xs text-slate-400 mt-1">You are all clear for today!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => {
                const isTaken = log.status === 'taken';
                const isMissed = log.status === 'missed';
                const isDue = log.status === 'due';
                const isUpcoming = log.status === 'upcoming';

                return (
                  <div
                    key={log.id}
                    onClick={() => onSelectMedication(log)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      isTaken
                        ? 'bg-emerald-50/60 border-emerald-200'
                        : isMissed
                        ? 'bg-red-50/60 border-red-200'
                        : isDue
                        ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/20'
                        : 'bg-sky-50/40 border-sky-100'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm ${
                          isTaken 
                            ? 'bg-emerald-500 text-white' 
                            : isMissed 
                            ? 'bg-red-500 text-white' 
                            : isDue
                            ? 'bg-amber-500 text-white animate-pulse'
                            : 'bg-sky-500 text-white'
                        }`}>
                          <Pill className="w-6 h-6" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 text-base">
                              {log.medicine_name}
                            </span>
                          </div>

                          <p className="text-xs font-semibold text-slate-500 mt-0.5">
                            {log.dosage_instruction}
                          </p>

                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] font-bold text-slate-600 bg-slate-200/60 px-2 py-0.5 rounded-md">
                              ⏰ {log.scheduled_time}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        {isTaken ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-4 h-4" /> TAKEN
                          </span>
                        ) : isMissed ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black bg-red-100 text-red-800">
                            <AlertTriangle className="w-4 h-4" /> MISSED
                          </span>
                        ) : isDue ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black bg-amber-500 text-white shadow-sm animate-pulse">
                            DUE / Take Now
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black bg-sky-100 text-sky-800">
                            <Clock className="w-3.5 h-3.5" /> UPCOMING
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
