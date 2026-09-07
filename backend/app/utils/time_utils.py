import random
import string
from typing import Optional
from datetime import datetime, time, date, timedelta

def generate_patient_code() -> str:
    """Generates a unique StayMeds Patient Code, e.g., SM4821"""
    digits = ''.join(random.choices(string.digits, k=4))
    return f"SM{digits}"

def parse_time_string(time_str: str) -> Optional[time]:
    """Parse time string in formats like '09:00 AM', '2:00 PM', '14:00', '9:00'"""
    if not time_str:
        return None
    time_str = time_str.strip()
    
    formats = [
        "%I:%M %p",  # 09:00 AM, 02:00 PM
        "%I:%M%p",   # 09:00AM, 02:00PM
        "%H:%M",     # 14:00, 09:00
        "%I %p",     # 9 AM, 2 PM
    ]
    for fmt in formats:
        try:
            return datetime.strptime(time_str, fmt).time()
        except ValueError:
            pass
    return None

def evaluate_medication_status(scheduled_time_str: str, current_status: str = "upcoming", grace_minutes: int = 15) -> str:
    """
    Evaluates 4 medication statuses based on current time:
    - TAKEN: Already confirmed by patient (preserved)
    - UPCOMING: Scheduled time is in the future (current time < scheduled_time - grace_minutes)
    - DUE: Scheduled window active (scheduled_time - grace_minutes <= current time <= scheduled_time + grace_minutes)
    - MISSED: Current time > scheduled_time + grace_minutes without confirmation
    """
    if current_status == "taken":
        return "taken"

    parsed_t = parse_time_string(scheduled_time_str)
    if not parsed_t:
        return current_status or "upcoming"

    now = datetime.now()
    scheduled_dt = datetime.combine(now.date(), parsed_t)

    due_start = scheduled_dt - timedelta(minutes=grace_minutes)
    grace_cutoff = scheduled_dt + timedelta(minutes=grace_minutes)

    if now < due_start:
        return "upcoming"
    elif due_start <= now <= grace_cutoff:
        return "due"
    else:
        return "missed"
