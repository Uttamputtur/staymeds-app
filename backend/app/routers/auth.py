from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Hospital
from app.schemas.schemas import HospitalRegister, HospitalLogin, Token, HospitalOut
from app.auth.security import hash_password, verify_password, create_access_token, decode_access_token
from app.services.audit_service import log_audit

router = APIRouter(prefix="/auth", tags=["Hospital Authentication"])
security_scheme = HTTPBearer()

def get_current_hospital(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> Hospital:
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    hospital_id = int(payload["sub"])
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hospital account not found")
    return hospital


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_hospital(data: HospitalRegister, db: Session = Depends(get_db)):
    if data.password != data.confirm_password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Passwords do not match")
    
    existing = db.query(Hospital).filter(Hospital.email == data.email.lower()).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Hospital with this email already registered")

    hospital = Hospital(
        name=data.name,
        email=data.email.lower(),
        phone=data.phone,
        password_hash=hash_password(data.password)
    )
    db.add(hospital)
    db.commit()
    db.refresh(hospital)

    # Log Audit Event
    log_audit(
        db=db,
        hospital_id=hospital.id,
        action="HOSPITAL_REGISTERED",
        actor_name=f"Hospital Administrator",
        details=f"Hospital account created: {hospital.name} ({hospital.email})"
    )

    access_token = create_access_token(subject=hospital.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "hospital": hospital
    }


@router.post("/login", response_model=Token)
def login_hospital(data: HospitalLogin, db: Session = Depends(get_db)):
    hospital = db.query(Hospital).filter(Hospital.email == data.email.lower()).first()
    if not hospital or not verify_password(data.password, hospital.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid hospital email or password")

    # Log Audit Event
    log_audit(
        db=db,
        hospital_id=hospital.id,
        action="STAFF_LOGIN",
        actor_name=f"Hospital Staff",
        details=f"Staff signed in: {hospital.email}"
    )

    access_token = create_access_token(subject=hospital.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "hospital": hospital
    }


@router.get("/me", response_model=HospitalOut)
def get_me(current_hospital: Hospital = Depends(get_current_hospital)):
    return current_hospital
