import React, { useState } from 'react';
import { X, Pill, Plus } from 'lucide-react';
import api from '../services/api';

export default function AddMedicationModal({ isOpen, onClose, patient, onMedicationAdded }) {
  const [medicineName, setMedicineName] = useState('');
  const [dosageInstruction, setDosageInstruction] = useState('');
  const [scheduledTime, setScheduledTime] = useState('09:00 AM');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [daysDuration, setDaysDuration] = useState('7 days');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !patient) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post(`/patients/${patient.id}/medications`, {
        medicine_name: medicineName,
        dosage_instruction: dosageInstruction,
        scheduled_time: scheduledTime,
        start_date: startDate,
        days_duration: daysDuration,
        special_instructions: specialInstructions,
      });

      if (onMedicationAdded) onMedicationAdded(res.data);

      // Reset form
      setMedicineName('');
      setDosageInstruction('');
      setScheduledTime('09:00 AM');
      setSpecialInstructions('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add medication schedule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-lg">Add Medication</h2>
            <p className="text-xs text-slate-400">
              For <span className="font-semibold text-slate-700">{patient.name}</span> (Room {patient.room_number})
            </p>
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
              Medicine Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Aspirin 100mg"
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Dosage / Instruction *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 1 tablet after food"
                value={dosageInstruction}
                onChange={(e) => setDosageInstruction(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Scheduled Time *
              </label>
              <select
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="08:00 AM">08:00 AM (Morning)</option>
                <option value="09:00 AM">09:00 AM (Breakfast)</option>
                <option value="11:30 AM">11:30 AM (Pre-lunch)</option>
                <option value="02:00 PM">02:00 PM (Afternoon)</option>
                <option value="05:00 PM">05:00 PM (Evening)</option>
                <option value="08:00 PM">08:00 PM (Dinner)</option>
                <option value="09:00 PM">09:00 PM (Bedtime)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Duration
              </label>
              <input
                type="text"
                placeholder="e.g. 7 days or Daily"
                value={daysDuration}
                onChange={(e) => setDaysDuration(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Special Instructions (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Take with a full glass of water. Avoid taking with dairy products."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/20 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {loading ? 'Scheduling...' : 'Save Medication'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
