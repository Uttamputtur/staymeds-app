from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from app.database import get_db
from app.models.models import Hospital, Patient, Medication, MedicationLog
from app.schemas.schemas import DashboardStats, MissedAlert, MedicationLogOut
from app.routers.auth import get_current_hospital
from app.services.medication_service import sync_today_medication_logs

router = APIRouter(prefix="", tags=["Dashboard & Analytics"])


@router.get("/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(
    current_hospital: Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db)
):
    # Ensure logs for today are synced & evaluated for missed status
    sync_today_medication_logs(db, hospital_id=current_hospital.id)

    today_str = date.today().isoformat()

    # Active Patients
    active_patients_count = db.query(Patient).filter(
        Patient.hospital_id == current_hospital.id,
        Patient.status == "active"
    ).count()

    # Today's Medication Logs for hospital
    today_logs = db.query(MedicationLog).filter(
        MedicationLog.hospital_id == current_hospital.id,
        MedicationLog.scheduled_for_date == today_str
    ).all()

    total_scheduled = len(today_logs)
    taken_count = sum(1 for log in today_logs if log.status == "taken")
    pending_count = sum(1 for log in today_logs if log.status == "pending")
    missed_count = sum(1 for log in today_logs if log.status == "missed")

    # Build missed alerts list
    missed_alerts: List[MissedAlert] = []
    missed_logs = [log for log in today_logs if log.status == "missed"]
    for log in missed_logs:
        patient = db.query(Patient).filter(Patient.id == log.patient_id).first()
        med = db.query(Medication).filter(Medication.id == log.medication_id).first()
        if patient and med:
            alert = MissedAlert(
                log_id=log.id,
                patient_id=patient.id,
                patient_name=patient.name,
                room_number=patient.room_number,
                patient_code=patient.patient_code,
                medicine_name=med.medicine_name,
                dosage_instruction=med.dosage_instruction,
                scheduled_time=log.scheduled_time,
                scheduled_for_date=log.scheduled_for_date,
                status="missed"
            )
            missed_alerts.append(alert)

    return DashboardStats(
        total_active_patients=active_patients_count,
        medications_scheduled_today=total_scheduled,
        medications_taken_today=taken_count,
        medications_pending_today=pending_count,
        medications_missed_today=missed_count,
        missed_alerts=missed_alerts
    )


@router.get("/alerts/missed", response_model=List[MissedAlert])
def get_missed_alerts(
    current_hospital: Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db)
):
    stats = get_dashboard_stats(current_hospital, db)
    return stats.missed_alerts


@router.get("/medication-history/all", response_model=List[MedicationLogOut])
def get_all_medication_logs(
    current_hospital: Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db)
):
    sync_today_medication_logs(db, hospital_id=current_hospital.id)
    logs = db.query(MedicationLog).filter(
        MedicationLog.hospital_id == current_hospital.id
    ).order_by(MedicationLog.scheduled_for_date.desc(), MedicationLog.id.desc()).all()

    result = []
    for log in logs:
        med = db.query(Medication).filter(Medication.id == log.medication_id).first()
        patient = db.query(Patient).filter(Patient.id == log.patient_id).first()
        if med and patient:
            item = MedicationLogOut(
                id=log.id,
                hospital_id=log.hospital_id,
                patient_id=log.patient_id,
                medication_id=log.medication_id,
                scheduled_for_date=log.scheduled_for_date,
                scheduled_time=log.scheduled_time,
                status=log.status,
                taken_at=log.taken_at,
                notes=log.notes,
                created_at=log.created_at,
                medicine_name=med.medicine_name,
                dosage_instruction=med.dosage_instruction,
                special_instructions=med.special_instructions,
                patient_name=patient.name,
                room_number=patient.room_number,
                patient_code=patient.patient_code
            )
            result.append(item)
    return result
