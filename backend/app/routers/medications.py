from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from app.database import get_db
from app.models.models import Hospital, Patient, Medication, MedicationLog
from app.schemas.schemas import MedicationCreate, MedicationUpdate, MedicationOut, MedicationLogOut
from app.routers.auth import get_current_hospital
from app.services.audit_service import log_audit
from app.utils.time_utils import evaluate_medication_status

router = APIRouter(prefix="", tags=["Medication Management"])


@router.post("/patients/{patient_id}/medications", response_model=MedicationOut, status_code=status.HTTP_201_CREATED)
def add_medication_for_patient(
    patient_id: int,
    med_in: MedicationCreate,
    current_hospital: Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(
        Patient.id == patient_id,
        Patient.hospital_id == current_hospital.id
    ).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    if patient.status == "discharged":
        raise HTTPException(status_code=400, detail="Cannot add medication for a discharged patient")

    medication = Medication(
        hospital_id=current_hospital.id,
        patient_id=patient_id,
        medicine_name=med_in.medicine_name,
        dosage_instruction=med_in.dosage_instruction,
        scheduled_time=med_in.scheduled_time,
        start_date=med_in.start_date or date.today().isoformat(),
        end_date=med_in.end_date,
        days_duration=med_in.days_duration or "Daily",
        special_instructions=med_in.special_instructions,
        is_paused=False
    )
    db.add(medication)
    db.commit()
    db.refresh(medication)

    today_str = date.today().isoformat()
    if medication.start_date <= today_str:
        initial_status = evaluate_medication_status(medication.scheduled_time, current_status="upcoming")
        log = MedicationLog(
            hospital_id=current_hospital.id,
            patient_id=patient_id,
            medication_id=medication.id,
            scheduled_for_date=today_str,
            scheduled_time=medication.scheduled_time,
            status=initial_status
        )
        db.add(log)
        db.commit()

    # Audit Log
    log_audit(
        db=db,
        hospital_id=current_hospital.id,
        action="MEDICATION_CREATED",
        actor_name=f"Hospital Staff",
        details=f"Scheduled medication for {patient.name}: {medication.medicine_name} at {medication.scheduled_time} ({medication.dosage_instruction})",
        patient_id=patient.id,
        medication_id=medication.id
    )

    return medication


@router.put("/medications/{medication_id}", response_model=MedicationOut)
def update_medication(
    medication_id: int,
    med_in: MedicationUpdate,
    current_hospital: Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db)
):
    medication = db.query(Medication).filter(
        Medication.id == medication_id,
        Medication.hospital_id == current_hospital.id
    ).first()
    if not medication:
        raise HTTPException(status_code=404, detail="Medication record not found")

    patient = db.query(Patient).filter(Patient.id == medication.patient_id).first()

    if med_in.medicine_name is not None:
        medication.medicine_name = med_in.medicine_name
    if med_in.dosage_instruction is not None:
        medication.dosage_instruction = med_in.dosage_instruction
    if med_in.scheduled_time is not None:
        medication.scheduled_time = med_in.scheduled_time
    if med_in.start_date is not None:
        medication.start_date = med_in.start_date
    if med_in.end_date is not None:
        medication.end_date = med_in.end_date
    if med_in.days_duration is not None:
        medication.days_duration = med_in.days_duration
    if med_in.special_instructions is not None:
        medication.special_instructions = med_in.special_instructions
    if med_in.is_paused is not None:
        medication.is_paused = med_in.is_paused

    db.commit()
    db.refresh(medication)

    # Audit Log
    log_audit(
        db=db,
        hospital_id=current_hospital.id,
        action="MEDICATION_UPDATED",
        actor_name=f"Hospital Staff",
        details=f"Updated medication schedule for {patient.name if patient else 'Patient'}: {medication.medicine_name} (Paused: {medication.is_paused})",
        patient_id=medication.patient_id,
        medication_id=medication.id
    )

    return medication


@router.delete("/medications/{medication_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_medication(
    medication_id: int,
    current_hospital: Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db)
):
    medication = db.query(Medication).filter(
        Medication.id == medication_id,
        Medication.hospital_id == current_hospital.id
    ).first()
    if not medication:
        raise HTTPException(status_code=404, detail="Medication record not found")

    patient = db.query(Patient).filter(Patient.id == medication.patient_id).first()

    # Audit Log
    log_audit(
        db=db,
        hospital_id=current_hospital.id,
        action="MEDICATION_DELETED",
        actor_name=f"Hospital Staff",
        details=f"Deleted medication schedule for {patient.name if patient else 'Patient'}: {medication.medicine_name}",
        patient_id=medication.patient_id,
        medication_id=medication.id
    )

    db.delete(medication)
    db.commit()
    return None


@router.get("/patients/{patient_id}/medication-history", response_model=List[MedicationLogOut])
def get_patient_medication_history(
    patient_id: int,
    current_hospital: Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(
        Patient.id == patient_id,
        Patient.hospital_id == current_hospital.id
    ).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    logs = db.query(MedicationLog).filter(
        MedicationLog.patient_id == patient_id,
        MedicationLog.hospital_id == current_hospital.id
    ).order_by(MedicationLog.scheduled_for_date.desc(), MedicationLog.id.desc()).all()

    result = []
    for log in logs:
        med = db.query(Medication).filter(Medication.id == log.medication_id).first()
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
            medicine_name=med.medicine_name if med else "Unknown",
            dosage_instruction=med.dosage_instruction if med else "",
            special_instructions=med.special_instructions if med else "",
            patient_name=patient.name,
            room_number=patient.room_number,
            patient_code=patient.patient_code
        )
        result.append(item)
    return result
