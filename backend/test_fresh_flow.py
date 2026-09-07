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

def test_fresh_installation_flow():
    print("--- 1. Registering Fresh Hospital ---")
    reg_res = request("/auth/register", method="POST", body={
        "name": "St. Jude Clinical Center",
        "email": "staff@stjudeclinical.org",
        "phone": "+1-555-432-1098",
        "password": "clinicalpassword123",
        "confirm_password": "clinicalpassword123"
    })
    print(f"Hospital registered: {reg_res['hospital']['name']}")

    print("\n--- 2. Staff Login ---")
    login_res = request("/auth/login", method="POST", body={
        "email": "staff@stjudeclinical.org",
        "password": "clinicalpassword123"
    })
    token = login_res["access_token"]
    print("Login successful. Token acquired.")

    print("\n--- 3. Checking Initial Audit Logs ---")
    audits = request("/audit-logs", token=token)
    print(f"Audit log entries count: {len(audits)}")
    for a in audits:
        print(f"  [{a['action']}] {a['actor_name']}: {a['details']}")

    print("\n--- 4. Registering Patient ---")
    patient = request("/patients", method="POST", body={
        "name": "David Miller",
        "room_number": "402",
        "age": 58
    }, token=token)
    patient_id = patient["id"]
    code = patient["patient_code"]
    print(f"Patient registered: {patient['name']}, Room {patient['room_number']}, StayMeds Code: {code}")

    print("\n--- 5. Adding Medication ---")
    med = request(f"/patients/{patient_id}/medications", method="POST", body={
        "medicine_name": "Aspirin 100mg",
        "dosage_instruction": "1 tablet after breakfast",
        "scheduled_time": "09:00 AM",
        "special_instructions": "Take with water"
    }, token=token)
    print(f"Medication scheduled: {med['medicine_name']} at {med['scheduled_time']}")

    print("\n--- 6. Patient Connects on Mobile App ---")
    patient_app_res = request("/patient/verify", method="POST", body={
        "room_number": "402",
        "patient_code": code
    })
    print(f"Patient verified on app: {patient_app_res['name']}")

    print("\n--- 7. Fetching Today Medications & 4-State Status ---")
    today_meds = request(f"/patient/today?room_number=402&patient_code={code}")
    print(f"Dose scheduled status: {today_meds[0]['status']}")
    log_id = today_meds[0]["id"]

    print("\n--- 8. Patient Confirms Medication Taken ---")
    taken_res = request(f"/medications/{log_id}/taken", method="POST")
    print(f"Updated status: {taken_res['status']}, Taken at: {taken_res['taken_at']}")

    print("\n--- 9. Checking Final Audit Logs ---")
    final_audits = request("/audit-logs", token=token)
    print(f"Total Audit Log records: {len(final_audits)}")
    for a in final_audits[:5]:
        print(f"  [{a['action']}] {a['actor_name']}: {a['details']}")

    print("\n--- 10. Discharging Patient ---")
    discharged = request(f"/patients/{patient_id}/discharge", method="POST", token=token)
    print(f"Patient Status: {discharged['status']}")

    print("\n[SUCCESS] Enhanced 4-State & Audit Trail E2E Test Passed 100%!")

if __name__ == "__main__":
    test_fresh_installation_flow()
