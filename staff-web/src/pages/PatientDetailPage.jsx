import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import AddMedicationModal from '../components/AddMedicationModal';
import { 
  Bed, 
  KeyRound, 
  UserCheck, 
  UserX, 
  Copy, 
  Check, 
  Plus, 
  Pill, 
  Calendar, 
  LogOut, 
  Edit3, 
  History,
  Trash2,
  Clock,
  AlertCircle
} from 'lucide-react';

export default function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [medications, setMedications] = useState([]);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddMedOpen, setIsAddMedOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEditingRoom, setIsEditingRoom] = useState(false);
  const [newRoomNumber, setNewRoomNumber] = useState('');

  const fetchPatientDetails = async () => {
    try {
      const [patientRes, medsRes, historyRes] = await Promise.all([
        api.get(`/patients/${id}`),
        api.get(`/patients/${id}/medications`),
        api.get(`/patients/${id}/medication-history`)
      ]);

      setPatient(patientRes.data);
      setMedications(medsRes.data);
      setHistoryLogs(historyRes.data);
      setNewRoomNumber(patientRes.data.room_number);
    } catch (err) {
      console.error("Error fetching patient details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientDetails();
  }, [id]);

  const handleCopyCode = () => {
    if (patient?.patient_code) {
      navigator.clipboard.writeText(patient.patient_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUpdateRoom = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/patients/${id}`, { room_number: newRoomNumber });
      setPatient(res.data);
      setIsEditingRoom(false);
    } catch (err) {
      alert("Failed to update room number");
    }
  };

  const handleDischarge = async () => {
    if (window.confirm(`Are you sure you want to discharge patient ${patient.name}? Reminders will stop and status will become inactive.`)) {
      try {
        const res = await api.post(`/patients/${id}/discharge`);
        setPatient(res.data);
        fetchPatientDetails();
      } catch (err) {
        alert("Failed to discharge patient");
      }
    }
  };

  const handleDeleteMedication = async (medId) => {
    if (window.confirm("Are you sure you want to delete this medication schedule?")) {
      try {
        await api.delete(`/medications/${medId}`);
        fetchPatientDetails();
      } catch (err) {
        alert("Failed to delete medication");
      }
    }
  };

  const handleTogglePauseMedication = async (med) => {
    try {
      await api.put(`/medications/${med.id}`, { is_paused: !med.is_paused });
      fetchPatientDetails();
    } catch (err) {
      alert("Failed to update medication status");
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400 text-sm">Loading patient file...</div>;
  }

  if (!patient) {
    return <div className="p-12 text-center text-red-500 font-semibold">Patient record not found</div>;
  }

  const isActive = patient.status === 'active';

  return (
    <div className="space-y-6">
      {/* Top Patient Header Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                isActive 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}>
                {isActive ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                {isActive ? 'Active Admission' : 'Discharged'}
              </span>

              <span className="text-xs font-semibold text-slate-400">
                Admitted on {patient.admission_date}
              </span>
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {patient.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
              <div className="flex items-center gap-2">
                <Bed className="w-4 h-4 text-teal-600" />
                <span>Room Number: </span>
                {!isEditingRoom ? (
                  <span className="font-bold text-slate-900 flex items-center gap-2">
                    {patient.room_number}
                    {isActive && (
                      <button
                        onClick={() => setIsEditingRoom(true)}
                        className="text-xs text-teal-600 hover:underline flex items-center gap-0.5"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                    )}
                  </span>
                ) : (
                  <form onSubmit={handleUpdateRoom} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newRoomNumber}
                      onChange={(e) => setNewRoomNumber(e.target.value)}
                      className="w-20 px-2 py-0.5 rounded border border-slate-300 text-xs font-bold"
                    />
                    <button type="submit" className="text-xs px-2 py-0.5 rounded bg-teal-600 text-white font-bold">
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingRoom(false)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Cancel
                    </button>
                  </form>
                )}
              </div>

              {patient.age && (
                <>
                  <span className="text-slate-300">•</span>
                  <span>Age: {patient.age} years</span>
                </>
              )}
            </div>
          </div>

          {/* StayMeds Patient Code Banner & Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100 flex items-center gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-teal-600" /> StayMeds Patient Code
                </span>
                <span className="text-2xl font-extrabold text-teal-700 tracking-wider">
                  {patient.patient_code}
                </span>
              </div>
              <button
                onClick={handleCopyCode}
                className="p-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm"
                title="Copy Patient Code"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {isActive && (
              <button
                onClick={handleDischarge}
                className="px-4 py-3 rounded-2xl border border-red-200 text-red-600 font-semibold text-xs hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Discharge Patient</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Medication Management Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Pill className="w-5 h-5 text-teal-600" />
              Medication Schedule
            </h2>
            <p className="text-xs text-slate-400">Authorized medication schedules for this patient</p>
          </div>

          {isActive && (
            <button
              onClick={() => setIsAddMedOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 shadow-lg shadow-teal-600/20 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Medication</span>
            </button>
          )}
        </div>

        {medications.length === 0 ? (
          <div className="p-8 text-center bg-slate-50/50 rounded-2xl border border-slate-100">
            <Pill className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-600">No active medication schedules.</p>
            <p className="text-xs text-slate-400 mt-0.5">Click "Add Medication" to schedule daily doses.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medications.map((med) => (
              <div
                key={med.id}
                className={`p-4 rounded-2xl border ${
                  med.is_paused 
                    ? 'bg-slate-50 border-slate-200 opacity-60' 
                    : 'bg-white border-slate-100 hover:border-teal-200 shadow-sm'
                } transition-all`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-teal-700 text-sm bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-100">
                        {med.scheduled_time}
                      </span>
                      {med.is_paused && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                          Paused
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 text-base mt-2">{med.medicine_name}</h3>
                    <p className="text-xs text-slate-600 font-medium">{med.dosage_instruction}</p>

                    {med.special_instructions && (
                      <p className="mt-2 text-xs text-slate-500 italic bg-amber-50/60 p-2 rounded-lg border border-amber-100">
                        "{med.special_instructions}"
                      </p>
                    )}

                    <div className="mt-3 text-[11px] text-slate-400 space-y-0.5">
                      <p>Duration: {med.days_duration || 'Daily'}</p>
                      <p>Started: {med.start_date}</p>
                    </div>
                  </div>

                  {isActive && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleTogglePauseMedication(med)}
                        className={`p-2 rounded-xl text-xs font-semibold border transition-colors ${
                          med.is_paused 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                        title={med.is_paused ? 'Resume Medication' : 'Pause Medication'}
                      >
                        {med.is_paused ? 'Resume' : 'Pause'}
                      </button>

                      <button
                        onClick={() => handleDeleteMedication(med.id)}
                        className="p-2 rounded-xl text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors"
                        title="Delete Medication"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Patient Medication Adherence History */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <History className="w-5 h-5 text-teal-600" />
          Medication Logs & Adherence History
        </h2>

        {historyLogs.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No historical records logged yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3">Scheduled Date</th>
                  <th className="pb-3">Time</th>
                  <th className="pb-3">Medication</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Confirmed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {historyLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 font-medium text-slate-900">{log.scheduled_for_date}</td>
                    <td className="py-3 font-semibold text-slate-600">{log.scheduled_time}</td>
                    <td className="py-3 font-semibold text-slate-900">{log.medicine_name}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        log.status === 'taken' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : log.status === 'missed' 
                          ? 'bg-red-50 text-red-700 border border-red-200 animate-pulse' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {log.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">
                      {log.taken_at ? new Date(log.taken_at).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Medication Modal */}
      <AddMedicationModal
        isOpen={isAddMedOpen}
        onClose={() => setIsAddMedOpen(false)}
        patient={patient}
        onMedicationAdded={() => fetchPatientDetails()}
      />
    </div>
  );
}
