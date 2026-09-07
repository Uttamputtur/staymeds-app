from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.database import get_db
from app.models.models import Hospital, Patient, Medication, MedicationLog
from app.schemas.schemas import PatientCreate, PatientUpdate, PatientOut, MedicationOut
from app.routers.auth import get_current_hospital
from app.utils.time_utils import generate_patient_code
from app.services.audit_service import log_audit

router = APIRouter(prefix="/patients", tags=["Patient Management"])


def generate_unique_code(db: Session) -> str:
    for _ in range(100):
        code = generate_patient_code()
        existing = db.query(Patient).filter(Patient.patient_code == code).first()
        if not existing:
            return code
    raise RuntimeError("Failed to generate unique patient code")


@router.get("", response_model=List[PatientOut])
def get_patients(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_hospital: Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db)
):
    query = db.query(Patient).filter(Patient.hospital_id == current_hospital.id)
    if status_filter:
        query = query.filter(Patient.status == status_filter.lower())
    return query.order_by(Patient.id.desc()).all()


@router.post("", response_model=PatientOut, status_code=status.HTTP_201_CREATED)
def create_patient(
    patient_in: PatientCreate,
    current_hospital: Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db)
):
    code = generate_unique_code(db)
    patient = Patient(
        hospital_id=current_hospital.id,
        patient_code=code,
        name=patient_in.name,
        room_number=patient_in.room_number,
        age=patient_in.age,
        admission_date=patient_in.admission_date or date.today().isoformat(),
        status="active"
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)

    # Audit Log
    log_audit(
        db=db,
        hospital_id=current_hospital.id,
        action="PATIENT_CREATED",
        actor_name=f"Hospital Staff",
        details=f"Patient registered: {patient.name} (Room {patient.room_number}, Code {patient.patient_code})",
        patient_id=patient.id
    )

    return patient


@router.get("/{patient_id}", response_model=PatientOut)
def get_patient_detail(
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
    return patient


@router.put("/{patient_id}", response_model=PatientOut)
def update_patient(
    patient_id: int,
    patient_in: PatientUpdate,
    current_hospital: Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(
        Patient.id == patient_id,
        Patient.hospital_id == current_hospital.id
    ).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    changes = []
    if patient_in.name is not None:
        patient.name = patient_in.name
        changes.append(f"Name -> {patient_in.name}")
    if patient_in.room_number is not None:
        changes.append(f"Room {patient.room_number} -> {patient_in.room_number}")
        patient.room_number = patient_in.room_number
    if patient_in.age is not None:
        patient.age = patient_in.age
        changes.append(f"Age -> {patient_in.age}")
    if patient_in.status is not None:
        patient.status = patient_in.status
        changes.append(f"Status -> {patient_in.status}")

    db.commit()
    db.refresh(patient)

    # Audit Log
    log_audit(
        db=db,
        hospital_id=current_hospital.id,
        action="PATIENT_UPDATED",
        actor_name=f"Hospital Staff",
        details=f"Updated patient details for {patient.name}: {', '.join(changes)}",
        patient_id=patient.id
    )

    return patient


@router.post("/{patient_id}/discharge", response_model=PatientOut)
def discharge_patient(
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

    patient.status = "discharged"
    
    # Pause/stop all patient medications
    meds = db.query(Medication).filter(Medication.patient_id == patient_id).all()
    for med in meds:
        med.is_paused = True

    db.commit()
    db.refresh(patient)

    # Audit Log
    log_audit(
        db=db,
        hospital_id=current_hospital.id,
        action="PATIENT_DISCHARGED",
        actor_name=f"Hospital Staff",
        details=f"Discharged patient: {patient.name} (Room {patient.room_number}). Reminders and schedules paused.",
        patient_id=patient.id
    )

    return patient


@router.get("/{patient_id}/medications", response_model=List[MedicationOut])
def get_patient_medications(
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

    meds = db.query(Medication).filter(
        Medication.patient_id == patient_id,
        Medication.hospital_id == current_hospital.id
    ).all()
    return meds
