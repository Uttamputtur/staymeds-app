from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(50), nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.now)

    patients = relationship("Patient", back_populates="hospital", cascade="all, delete-orphan")
    medications = relationship("Medication", back_populates="hospital", cascade="all, delete-orphan")
    medication_logs = relationship("MedicationLog", back_populates="hospital", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="hospital", cascade="all, delete-orphan")
    alerts = relationship("StaffAlert", back_populates="hospital", cascade="all, delete-orphan")


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False, index=True)
    patient_code = Column(String(20), unique=True, index=True, nullable=False)  # e.g., SM4821
    name = Column(String(255), nullable=False)
    room_number = Column(String(50), nullable=False, index=True)
    age = Column(Integer, nullable=True)
    admission_date = Column(String(20), default=lambda: date.today().isoformat())
    status = Column(String(20), default="active")  # 'active', 'discharged'
    created_at = Column(DateTime, default=datetime.now)

    hospital = relationship("Hospital", back_populates="patients")
    medications = relationship("Medication", back_populates="patient", cascade="all, delete-orphan")
    medication_logs = relationship("MedicationLog", back_populates="patient", cascade="all, delete-orphan")


class Medication(Base):
    __tablename__ = "medications"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    medicine_name = Column(String(255), nullable=False)
    dosage_instruction = Column(String(255), nullable=False)
    scheduled_time = Column(String(20), nullable=False)        # e.g., "09:00 AM" or "14:00"
    start_date = Column(String(20), nullable=False)            # e.g., "2026-09-07"
    end_date = Column(String(20), nullable=True)
    days_duration = Column(String(50), nullable=True)
    special_instructions = Column(Text, nullable=True)
    is_paused = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.now)

    hospital = relationship("Hospital", back_populates="medications")
    patient = relationship("Patient", back_populates="medications")
    logs = relationship("MedicationLog", back_populates="medication", cascade="all, delete-orphan")


class MedicationLog(Base):
    __tablename__ = "medication_logs"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    medication_id = Column(Integer, ForeignKey("medications.id"), nullable=False, index=True)
    
    scheduled_for_date = Column(String(20), nullable=False)   # e.g., "2026-09-07"
    scheduled_time = Column(String(20), nullable=False)        # e.g., "09:00 AM"
    status = Column(String(20), default="upcoming")            # 'upcoming', 'due', 'taken', 'missed'
    taken_at = Column(DateTime, nullable=True)
    notes = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.now)

    hospital = relationship("Hospital", back_populates="medication_logs")
    patient = relationship("Patient", back_populates="patient_logs" if False else "medication_logs")
    medication = relationship("Medication", back_populates="logs")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False, index=True)
    action = Column(String(100), nullable=False)               # e.g. "PATIENT_CREATED"
    actor_name = Column(String(255), nullable=False)            # e.g. "Hospital Staff"
    details = Column(Text, nullable=False)                     # e.g. "John Doe - Aspirin 100mg"
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=True)
    medication_id = Column(Integer, ForeignKey("medications.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.now)

    hospital = relationship("Hospital", back_populates="audit_logs")


class StaffAlert(Base):
    __tablename__ = "staff_alerts"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    medication_log_id = Column(Integer, ForeignKey("medication_logs.id"), nullable=False, index=True)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.now)

    hospital = relationship("Hospital", back_populates="alerts")
