import urllib.request
import json

BASE_URL = "http://localhost:8000/api"

def request(endpoint, method="GET", body=None, token=None):
    url = f"{BASE_URL}{endpoint}"
    data = json.dumps(body).encode("utf-8") if body else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode("utf-8"))

def test_e2e():
    print("--- 1. Testing Staff Login ---")
    login_res = request("/auth/login", method="POST", body={
        "email": "staff@careplus.com",
        "password": "password123"
    })
    token = login_res["access_token"]
    print("Logged in as CarePlus Hospital. Token acquired.")

    print("\n--- 2. Creating New Patient ---")
    patient = request("/patients", method="POST", body={
        "name": "E2E Test Patient",
        "room_number": "309",
        "age": 52
    }, token=token)
    patient_id = patient["id"]
    code = patient["patient_code"]
    print(f"Created Patient: {patient['name']}, Room {patient['room_number']}, StayMeds Code: {code}")

    print("\n--- 3. Scheduling Medication ---")
    med = request(f"/patients/{patient_id}/medications", method="POST", body={
        "medicine_name": "Ibuprofen 400mg",
        "dosage_instruction": "1 tablet after meals",
        "scheduled_time": "02:00 PM",
        "special_instructions": "Take with water"
    }, token=token)
    print(f"Scheduled medication: {med['medicine_name']} at {med['scheduled_time']}")

    print("\n--- 4. Testing Patient App Verification ---")
    patient_app_res = request("/patient/verify", method="POST", body={
        "room_number": "309",
        "patient_code": code
    })
    print(f"Patient verified successfully: {patient_app_res['name']}")

    print("\n--- 5. Fetching Patient Today Medications ---")
    today_meds = request(f"/patient/today?room_number=309&patient_code={code}")
    print(f"Found {len(today_meds)} scheduled dose for today.")
    log_id = today_meds[0]["id"]
    print(f"Log ID: {log_id}, Status: {today_meds[0]['status']}")

    print("\n--- 6. Marking Medication as Taken ---")
    taken_res = request(f"/medications/{log_id}/taken", method="POST")
    print(f"Medication marked taken! Status: {taken_res['status']}, Taken at: {taken_res['taken_at']}")

    print("\n--- 7. Verifying Staff Dashboard Stats ---")
    stats = request("/dashboard/stats", token=token)
    print(f"Active Patients: {stats['total_active_patients']}")
    print(f"Scheduled Today: {stats['medications_scheduled_today']}")
    print(f"Taken Today: {stats['medications_taken_today']}")
    print(f"Pending Today: {stats['medications_pending_today']}")
    print(f"Missed Today: {stats['medications_missed_today']}")
    print(f"Missed Alerts Count: {len(stats['missed_alerts'])}")

    print("\n--- 8. Discharging Patient ---")
    discharged = request(f"/patients/{patient_id}/discharge", method="POST", token=token)
    print(f"Patient Status: {discharged['status']}")

    print("\n[SUCCESS] E2E Full-Stack Verification Passed Successfully!")

if __name__ == "__main__":
    test_e2e()
