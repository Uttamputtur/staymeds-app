import React, { useState } from 'react';
import { X, Pill, CheckCircle2, Clock, Info, HeartPulse } from 'lucide-react';
import api from '../services/api';

export default function MedicationDetailModal({ log, isOpen, onClose, onMarkedTaken }) {
  const [loading, setLoading] = useState(false);
  const [takenSuccess, setTakenSuccess] = useState(false);
  const [takenTimeStr, setTakenTimeStr] = useState('');

  if (!isOpen || !log) return null;

  const handleTakeNow = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/medications/${log.id}/taken`);
      const takenDate = new Date(res.data.taken_at || Date.now());
      const timeStr = takenDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setTakenTimeStr(timeStr);
      setTakenSuccess(true);
      if (onMarkedTaken) onMarkedTaken(res.data);
    } catch (err) {
      alert("Failed to confirm medication. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setTakenSuccess(false);
    onClose();
  };

  const isAlreadyTaken = log.status === 'taken' || takenSuccess;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl relative border border-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleCloseModal}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!takenSuccess ? (
          <div className="space-y-5 pt-2">
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg ${
                isAlreadyTaken ? 'bg-emerald-500' : 'bg-teal-600'
              }`}>
                <Pill className="w-7 h-7 rotate-45" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Scheduled for {log.scheduled_time}
                </span>
                <h2 className="text-2xl font-black text-slate-900">{log.medicine_name}</h2>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                <span>Dose & Instructions</span>
                <span className="text-slate-900 font-bold">{log.dosage_instruction}</span>
              </div>

              {log.special_instructions && (
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">
                    Special Note
                  </span>
                  <p className="text-xs text-slate-700 italic bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                    "{log.special_instructions}"
                  </p>
                </div>
              )}
            </div>

            {!isAlreadyTaken ? (
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleTakeNow}
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-black text-lg shadow-xl shadow-emerald-600/30 hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-6 h-6" />
                  <span>{loading ? 'Confirming...' : 'Take Now'}</span>
                </button>
                <p className="text-[11px] text-center text-slate-400 font-medium">
                  Tapping "Take Now" logs your adherence and notifies hospital staff.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600" />
                <p className="font-extrabold text-base">Medication Already Taken</p>
                <p className="text-xs text-emerald-700">
                  {log.taken_at ? `Confirmed at ${new Date(log.taken_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Confirmed'}
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Visual Confirmation Success Screen */
          <div className="py-8 text-center space-y-4 animate-pop-in">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/20">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900">Medication Taken!</h2>
              <p className="text-xs text-slate-500 mt-1">
                Recorded at <span className="font-extrabold text-slate-900">{takenTimeStr}</span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold">
              ✅ Staff dashboard updated automatically.
            </div>

            <button
              onClick={handleCloseModal}
              className="w-full py-3.5 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
