from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import Hospital, AuditLog
from app.schemas.schemas import AuditLogOut
from app.routers.auth import get_current_hospital

router = APIRouter(prefix="", tags=["Audit Logging"])

@router.get("/audit-logs", response_model=List[AuditLogOut])
def get_hospital_audit_logs(
    current_hospital: Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db)
):
    """Retrieves all hospital system and staff audit trail events."""
    logs = db.query(AuditLog).filter(
        AuditLog.hospital_id == current_hospital.id
    ).order_by(AuditLog.id.desc()).all()
    return logs
