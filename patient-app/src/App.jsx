import React, { useState, useEffect } from 'react';
import ConnectPatientScreen from './screens/ConnectPatientScreen';
import TodayMedsScreen from './screens/TodayMedsScreen';
import MedicationDetailModal from './screens/MedicationDetailModal';

export default function App() {
  const [patient, setPatient] = useState(() => {
    const saved = localStorage.getItem('staymeds_patient_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [selectedMedication, setSelectedMedication] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleConnectSuccess = (patientData) => {
    setPatient(patientData);
    localStorage.setItem('staymeds_patient_session', JSON.stringify(patientData));
  };

  const handleDisconnect = () => {
    setPatient(null);
    localStorage.removeItem('staymeds_patient_session');
  };

  const handleSelectMedication = (log) => {
    setSelectedMedication(log);
    setIsModalOpen(true);
  };

  return (
    <div className="mobile-wrapper">
      {!patient ? (
        <ConnectPatientScreen onConnectSuccess={handleConnectSuccess} />
      ) : (
        <>
          <TodayMedsScreen
            patient={patient}
            onDisconnect={handleDisconnect}
            onSelectMedication={handleSelectMedication}
          />
          <MedicationDetailModal
            log={selectedMedication}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onMarkedTaken={() => {
              // Trigger auto re-fetch in screen if needed
            }}
          />
        </>
      )}
    </div>
  );
}
