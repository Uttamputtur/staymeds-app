import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import AddPatientModal from '../components/AddPatientModal';
import { 
  Users, 
  Search, 
  UserPlus, 
  Filter, 
  ChevronRight, 
  Copy, 
  Check, 
  Bed, 
  KeyRound,
  UserCheck,
  UserX
} from 'lucide-react';

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients');
      setPatients(res.data);
    } catch (err) {
      console.error("Error fetching patients", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleCopyCode = (code, e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.room_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.patient_code.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || patient.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Directory</h1>
          <p className="text-xs text-slate-400 mt-1">Manage active patient admissions and StayMeds codes</p>
        </div>

        <button
          onClick={() => setIsAddPatientOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 shadow-lg shadow-teal-600/20 transition-all flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Patient</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by patient name, room number, or StayMeds code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
          >
            <option value="all">All Patients</option>
            <option value="active">Active Patients</option>
            <option value="discharged">Discharged</option>
          </select>
        </div>
      </div>

      {/* Patients Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Loading patient records...</div>
      ) : filteredPatients.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="font-semibold text-slate-700 text-base">No patients found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria or register a new patient.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((patient) => {
            const isActive = patient.status === 'active';

            return (
              <Link
                key={patient.id}
                to={`/patients/${patient.id}`}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-teal-50 text-teal-700 font-bold text-sm flex items-center gap-1 border border-teal-100">
                        <Bed className="w-4 h-4" /> Room {patient.room_number}
                      </span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${
                      isActive 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      {isActive ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                      {isActive ? 'Active Care' : 'Discharged'}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-lg group-hover:text-teal-600 transition-colors">
                    {patient.name}
                  </h3>
                  {patient.age && (
                    <p className="text-xs text-slate-400 mt-0.5">Age: {patient.age} years</p>
                  )}

                  {/* Patient Code Badge */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <KeyRound className="w-3 h-3 text-teal-600" /> Patient Code
                      </span>
                      <span className="text-sm font-extrabold text-teal-700 tracking-wider">
                        {patient.patient_code}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleCopyCode(patient.patient_code, e)}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-teal-600 hover:border-teal-200 transition-colors"
                      title="Copy Patient Code"
                    >
                      {copiedCode === patient.patient_code ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>Admitted: {patient.admission_date}</span>
                  <span className="font-semibold text-teal-600 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                    Details <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Add Patient Modal */}
      <AddPatientModal
        isOpen={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
        onPatientAdded={() => fetchPatients()}
      />
    </div>
  );
}
