import React, { useState } from 'react';
import { X, UserPlus, Copy, Check, Sparkles } from 'lucide-react';
import api from '../services/api';

export default function AddPatientModal({ isOpen, onClose, onPatientAdded }) {
  const [name, setName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdPatient, setCreatedPatient] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/patients', {
        name,
        room_number: roomNumber,
        age: age ? parseInt(age) : null,
      });

      setCreatedPatient(res.data);
      if (onPatientAdded) onPatientAdded(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add patient');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (createdPatient?.patient_code) {
      navigator.clipboard.writeText(createdPatient.patient_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setName('');
    setRoomNumber('');
    setAge('');
    setCreatedPatient(null);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!createdPatient ? (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Add New Patient</h2>
                <p className="text-xs text-slate-400">Generates StayMeds Patient Code automatically</p>
              </div>
            </div>

            {error && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-600 text-xs border border-red-100 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Room Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 203"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Age (Optional)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 45"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/20 transition-all disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Register Patient'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-7 h-7" />
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-xl">Patient Registered!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Share these login details with patient <span className="font-semibold text-slate-800">{createdPatient.name}</span> in <span className="font-semibold text-slate-800">Room {createdPatient.room_number}</span>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100 space-y-2">
              <p className="text-xs font-semibold text-teal-800 uppercase tracking-wider">
                StayMeds Patient Code
              </p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl font-extrabold text-teal-700 tracking-widest">
                  {createdPatient.patient_code}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm"
                  title="Copy Patient Code"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              {copied && (
                <p className="text-[11px] font-semibold text-teal-600">Copied to clipboard!</p>
              )}
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3 rounded-xl font-semibold text-sm bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
