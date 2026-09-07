from datetime import date, datetime
from typing import List
from sqlalchemy.orm import Session
from app.models.models import Medication, MedicationLog, Patient, StaffAlert
from app.utils.time_utils import evaluate_medication_status
from app.services.audit_service import log_audit

def sync_today_medication_logs(db: Session, hospital_id: int) -> None:
    """
    1. Ensures a MedicationLog entry exists for today for all active medications of active patients.
    2. Evaluates 4-state statuses: 'upcoming', 'due', 'taken', 'missed'.
    3. If status transitions to 'missed', creates a StaffAlert and AuditLog record.
    """
    today_str = date.today().isoformat()

    # Get active patients for hospital
    active_patients = db.query(Patient).filter(
        Patient.hospital_id == hospital_id,
        Patient.status == "active"
    ).all()
    active_patient_map = {p.id: p for p in active_patients}

    if not active_patient_map:
        return

    # Get active non-paused medications
    medications = db.query(Medication).filter(
        Medication.hospital_id == hospital_id,
        Medication.patient_id.in_(list(active_patient_map.keys())),
        Medication.is_paused == False
    ).all()

    for med in medications:
        patient = active_patient_map.get(med.patient_id)
        if not patient:
            continue

        log = db.query(MedicationLog).filter(
            MedicationLog.medication_id == med.id,
            MedicationLog.scheduled_for_date == today_str
        ).first()

        new_status = evaluate_medication_status(med.scheduled_time, current_status=log.status if log else "upcoming")

        if not log:
            log = MedicationLog(
                hospital_id=hospital_id,
                patient_id=med.patient_id,
                medication_id=med.id,
                scheduled_for_date=today_str,
                scheduled_time=med.scheduled_time,
                status=new_status
            )
            db.add(log)
            db.commit()
            db.refresh(log)

            if new_status == "missed":
                _trigger_missed_alert_and_audit(db, hospital_id, patient, med, log)
        else:
            old_status = log.status
            if old_status != "taken" and old_status != new_status:
                log.status = new_status
                db.commit()

                if new_status == "missed" and old_status != "missed":
                    _trigger_missed_alert_and_audit(db, hospital_id, patient, med, log)


def _trigger_missed_alert_and_audit(db: Session, hospital_id: int, patient: Patient, med: Medication, log: MedicationLog):
    """Triggers StaffAlert and AuditLog entry when a dose is missed."""
    # Check if alert already exists for this log
    existing_alert = db.query(StaffAlert).filter(StaffAlert.medication_log_id == log.id).first()
    if not existing_alert:
        alert = StaffAlert(
            hospital_id=hospital_id,
            patient_id=patient.id,
            medication_log_id=log.id,
            message=f"Missed Medication: {patient.name} (Room {patient.room_number}) — {med.medicine_name} scheduled for {log.scheduled_time}",
            is_read=False
        )
        db.add(alert)
        db.commit()

        log_audit(
            db=db,
            hospital_id=hospital_id,
            action="MEDICATION_MISSED",
            actor_name="StayMeds System Evaluator",
            details=f"Medication marked as MISSED: {patient.name} (Room {patient.room_number}) — {med.medicine_name} scheduled at {log.scheduled_time}",
            patient_id=patient.id,
            medication_id=med.id
        )


def mark_medication_as_taken(db: Session, log_id: int, notes: str = None) -> MedicationLog:
    """Marks a medication log as taken with current timestamp and records AuditLog."""
    log = db.query(MedicationLog).filter(MedicationLog.id == log_id).first()
    if not log:
        raise ValueError("Medication log record not found")
    
    log.status = "taken"
    log.taken_at = datetime.now()
    if notes:
        log.notes = notes
    
    db.commit()
    db.refresh(log)

    patient = db.query(Patient).filter(Patient.id == log.patient_id).first()
    med = db.query(Medication).filter(Medication.id == log.medication_id).first()

    actor_name = f"Patient {patient.name}" if patient else "Patient"
    details = f"Medication marked as TAKEN: {patient.name if patient else 'Patient'} — {med.medicine_name if med else 'Medicine'}"

    log_audit(
        db=db,
        hospital_id=log.hospital_id,
        action="MEDICATION_TAKEN",
        actor_name=actor_name,
        details=details,
        patient_id=log.patient_id,
        medication_id=log.medication_id
    )

    return log
