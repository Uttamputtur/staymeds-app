from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import Hospital, StaffAlert, Patient, MedicationLog, Medication
from app.schemas.schemas import StaffAlertOut
from app.routers.auth import get_current_hospital
from app.services.medication_service import sync_today_medication_logs

router = APIRouter(prefix="", tags=["Staff Alerts"])

@router.get("/alerts/unread-count")
def get_unread_alerts_count(
    current_hospital: Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db)
):
    sync_today_medication_logs(db, hospital_id=current_hospital.id)
    count = db.query(StaffAlert).filter(
        StaffAlert.hospital_id == current_hospital.id,
        StaffAlert.is_read == False
    ).count()
    return {"unread_count": count}

@router.get("/alerts/all", response_model=List[StaffAlertOut])
def get_all_staff_alerts(
    current_hospital: Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db)
):
    sync_today_medication_logs(db, hospital_id=current_hospital.id)

    alerts = db.query(StaffAlert).filter(
        StaffAlert.hospital_id == current_hospital.id
    ).order_by(StaffAlert.id.desc()).all()

    result = []
    for alert in alerts:
        patient = db.query(Patient).filter(Patient.id == alert.patient_id).first()
        log = db.query(MedicationLog).filter(MedicationLog.id == alert.medication_log_id).first()
        med = db.query(Medication).filter(Medication.id == log.medication_id).first() if log else None

        item = StaffAlertOut(
            id=alert.id,
            hospital_id=alert.hospital_id,
            patient_id=alert.patient_id,
            medication_log_id=alert.medication_log_id,
            message=alert.message,
            is_read=alert.is_read,
            created_at=alert.created_at,
            patient_name=patient.name if patient else "",
            room_number=patient.room_number if patient else "",
            patient_code=patient.patient_code if patient else "",
            medicine_name=med.medicine_name if med else "",
            scheduled_time=log.scheduled_time if log else ""
        )
        result.append(item)
    return result

@router.post("/alerts/{alert_id}/read", response_model=StaffAlertOut)
def mark_alert_as_read(
    alert_id: int,
    current_hospital: Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db)
):
    alert = db.query(StaffAlert).filter(
        StaffAlert.id == alert_id,
        StaffAlert.hospital_id == current_hospital.id
    ).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.is_read = True
    db.commit()
    db.refresh(alert)

    patient = db.query(Patient).filter(Patient.id == alert.patient_id).first()
    log = db.query(MedicationLog).filter(MedicationLog.id == alert.medication_log_id).first()
    med = db.query(Medication).filter(Medication.id == log.medication_id).first() if log else None

    return StaffAlertOut(
        id=alert.id,
        hospital_id=alert.hospital_id,
        patient_id=alert.patient_id,
        medication_log_id=alert.medication_log_id,
        message=alert.message,
        is_read=alert.is_read,
        created_at=alert.created_at,
        patient_name=patient.name if patient else "",
        room_number=patient.room_number if patient else "",
        patient_code=patient.patient_code if patient else "",
        medicine_name=med.medicine_name if med else "",
        scheduled_time=log.scheduled_time if log else ""
    )
