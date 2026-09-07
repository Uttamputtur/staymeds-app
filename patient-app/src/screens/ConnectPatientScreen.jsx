import React, { useState } from 'react';
import { Pill, KeyRound, Bed, ArrowRight, ShieldCheck } from 'lucide-react';
import api from '../services/api';

export default function ConnectPatientScreen({ onConnectSuccess }) {
  const [roomNumber, setRoomNumber] = useState('');
  const [patientCode, setPatientCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!roomNumber.trim() || !patientCode.trim()) {
      setError('Please enter both Room Number and StayMeds Patient Code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/patient/verify', {
        room_number: roomNumber.trim(),
        patient_code: patientCode.trim().toUpperCase(),
      });

      onConnectSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Verification failed. Please check details with hospital staff.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-gradient-to-b from-teal-600 via-teal-700 to-slate-900 text-white">
      {/* Top Header Branding */}
      <div className="text-center pt-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl">
          <Pill className="w-10 h-10 text-teal-200 rotate-45" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white">Welcome to StayMeds</h1>
        <p className="text-teal-100 text-sm font-medium mt-1">Patient Medication Companion</p>
      </div>

      {/* Main Form Card */}
      <div className="bg-white text-slate-900 p-6 rounded-3xl shadow-2xl space-y-5 my-auto">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Connect to Your Schedule</h2>
          <p className="text-xs text-slate-500 mt-1">
            Enter your Room Number and unique StayMeds Patient Code provided by hospital staff.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleConnect} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Room Number
            </label>
            <div className="relative">
              <Bed className="w-5 h-5 text-teal-600 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                placeholder="e.g. 203"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-200 text-base font-bold text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              StayMeds Patient Code
            </label>
            <div className="relative">
              <KeyRound className="w-5 h-5 text-teal-600 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                placeholder="e.g. SM4821"
                value={patientCode}
                onChange={(e) => setPatientCode(e.target.value.toUpperCase())}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-200 text-base font-bold tracking-wider text-slate-900 uppercase focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-teal-600 text-white font-bold text-base hover:bg-teal-700 active:scale-[0.98] transition-all shadow-xl shadow-teal-600/30 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? 'Connecting...' : 'Connect'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Footer info */}
      <div className="text-center pb-4 text-xs text-teal-200/80 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-4 h-4 text-teal-300" />
        <span>Secure Patient Portal • StayMeds Hospital System</span>
      </div>
    </div>
  );
}
