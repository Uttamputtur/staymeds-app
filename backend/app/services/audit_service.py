from sqlalchemy.orm import Session
from app.models.models import AuditLog
from typing import Optional

def log_audit(
    db: Session,
    hospital_id: int,
    action: str,
    actor_name: str,
    details: str,
    patient_id: Optional[int] = None,
    medication_id: Optional[int] = None
) -> AuditLog:
    """Logs a system or staff action in the AuditLog database table."""
    audit_entry = AuditLog(
        hospital_id=hospital_id,
        action=action,
        actor_name=actor_name,
        details=details,
        patient_id=patient_id,
        medication_id=medication_id
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(audit_entry)
    return audit_entry
