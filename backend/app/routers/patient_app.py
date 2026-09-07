from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from app.database import get_db
from app.models.models import Patient, Medication, MedicationLog, Hospital
from app.schemas.schemas import PatientConnectRequest, PatientOut, MedicationLogOut
from app.services.medication_service import sync_today_medication_logs, mark_medication_as_taken

router = APIRouter(prefix="", tags=["Patient App API"])


@router.post("/patient/verify", response_model=PatientOut)
def verify_patient_connection(data: PatientConnectRequest, db: Session = Depends(get_db)):
    """Verifies room number and patient code entered by patient in mobile app."""
    patient = db.query(Patient).filter(
        Patient.room_number.ilike(data.room_number.strip()),
        Patient.patient_code.ilike(data.patient_code.strip())
    ).first()

    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid Room Number or StayMeds Patient Code. Please double check with hospital staff."
        )

    if patient.status == "discharged":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This patient record has been discharged. Reminders are no longer active."
        )

    # Sync today's logs for patient's hospital
    sync_today_medication_logs(db, hospital_id=patient.hospital_id)

    return patient


@router.get("/patient/today", response_model=List[MedicationLogOut])
def get_patient_today_medications(
    room_number: str,
    patient_code: str,
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(
        Patient.room_number.ilike(room_number.strip()),
        Patient.patient_code.ilike(patient_code.strip())
    ).first()

    if not patient or patient.status == "discharged":
        raise HTTPException(status_code=404, detail="Active patient record not found")

    # Sync today's logs
    sync_today_medication_logs(db, hospital_id=patient.hospital_id)

    today_str = date.today().isoformat()
    logs = db.query(MedicationLog).filter(
        MedicationLog.patient_id == patient.id,
        MedicationLog.scheduled_for_date == today_str
    ).order_by(MedicationLog.scheduled_time.asc()).all()

    result = []
    for log in logs:
        med = db.query(Medication).filter(Medication.id == log.medication_id).first()
        if med and not med.is_paused:
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


@router.post("/medications/{log_id}/taken", response_model=MedicationLogOut)
def record_medication_taken(log_id: int, db: Session = Depends(get_db)):
    """Patient clicks 'Take Now' -> updates medication log to 'taken'."""
    try:
        log = mark_medication_as_taken(db, log_id)
        med = db.query(Medication).filter(Medication.id == log.medication_id).first()
        patient = db.query(Patient).filter(Patient.id == log.patient_id).first()

        return MedicationLogOut(
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
            medicine_name=med.medicine_name if med else "",
            dosage_instruction=med.dosage_instruction if med else "",
            special_instructions=med.special_instructions if med else "",
            patient_name=patient.name if patient else "",
            room_number=patient.room_number if patient else "",
            patient_code=patient.patient_code if patient else ""
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
