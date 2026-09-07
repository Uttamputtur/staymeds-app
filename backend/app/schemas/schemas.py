from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# --- Auth / Hospital ---
class HospitalRegister(BaseModel):
    name: str = Field(..., example="CarePlus Hospital")
    email: EmailStr = Field(..., example="staff@careplus.com")
    phone: str = Field(..., example="+1-555-0192")
    password: str = Field(..., min_length=6)
    confirm_password: str = Field(..., min_length=6)

class HospitalLogin(BaseModel):
    email: EmailStr
    password: str

class HospitalOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    hospital: HospitalOut


# --- Patient ---
class PatientCreate(BaseModel):
    name: str = Field(..., example="John Doe")
    room_number: str = Field(..., example="203")
    age: Optional[int] = Field(None, example=45)
    admission_date: Optional[str] = None

class PatientUpdate(BaseModel):
    name: Optional[str] = None
    room_number: Optional[str] = None
    age: Optional[int] = None
    status: Optional[str] = None

class PatientOut(BaseModel):
    id: int
    hospital_id: int
    patient_code: str
    name: str
    room_number: str
    age: Optional[int] = None
    admission_date: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class PatientConnectRequest(BaseModel):
    room_number: str
    patient_code: str


# --- Medication ---
class MedicationCreate(BaseModel):
    medicine_name: str = Field(..., example="Aspirin")
    dosage_instruction: str = Field(..., example="1 tablet after food")
    scheduled_time: str = Field(..., example="09:00 AM")
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    days_duration: Optional[str] = Field("Daily", example="7 days")
    special_instructions: Optional[str] = Field(None, example="Take with water")

class MedicationUpdate(BaseModel):
    medicine_name: Optional[str] = None
    dosage_instruction: Optional[str] = None
    scheduled_time: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    days_duration: Optional[str] = None
    special_instructions: Optional[str] = None
    is_paused: Optional[bool] = None

class MedicationOut(BaseModel):
    id: int
    hospital_id: int
    patient_id: int
    medicine_name: str
    dosage_instruction: str
    scheduled_time: str
    start_date: str
    end_date: Optional[str] = None
    days_duration: Optional[str] = None
    special_instructions: Optional[str] = None
    is_paused: bool
    created_at: datetime

    class Config:
        from_attributes = True


# --- Medication Log ---
class MedicationLogOut(BaseModel):
    id: int
    hospital_id: int
    patient_id: int
    medication_id: int
    scheduled_for_date: str
    scheduled_time: str
    status: str  # 'upcoming', 'due', 'taken', 'missed'
    taken_at: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime

    # Expanded nested fields for display
    medicine_name: Optional[str] = None
    dosage_instruction: Optional[str] = None
    special_instructions: Optional[str] = None
    patient_name: Optional[str] = None
    room_number: Optional[str] = None
    patient_code: Optional[str] = None

    class Config:
        from_attributes = True


# --- Staff Alert ---
class StaffAlertOut(BaseModel):
    id: int
    hospital_id: int
    patient_id: int
    medication_log_id: int
    message: str
    is_read: bool
    created_at: datetime

    patient_name: Optional[str] = None
    room_number: Optional[str] = None
    patient_code: Optional[str] = None
    medicine_name: Optional[str] = None
    scheduled_time: Optional[str] = None

    class Config:
        from_attributes = True


# --- Audit Log ---
class AuditLogOut(BaseModel):
    id: int
    hospital_id: int
    action: str
    actor_name: str
    details: str
    patient_id: Optional[int] = None
    medication_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


# --- Missed Alert ---
class MissedAlert(BaseModel):
    log_id: int
    alert_id: Optional[int] = None
    patient_id: int
    patient_name: str
    room_number: str
    patient_code: str
    medicine_name: str
    dosage_instruction: str
    scheduled_time: str
    scheduled_for_date: str
    status: str = "missed"
    is_read: bool = False


# --- Dashboard Stats ---
class DashboardStats(BaseModel):
    total_active_patients: int
    medications_scheduled_today: int
    medications_taken_today: int
    medications_pending_today: int
    medications_missed_today: int
    unread_alerts_count: int = 0
    missed_alerts: List[MissedAlert] = []
