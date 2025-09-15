from deepface.basemodels import Facenet
from deepface.commons import functions
import numpy as np
import cv2
import os
import time
import json

# ---- CONFIG ----
DB_PATH = "students"
TARGET_SIZE = (160, 160)
ALLOWED_EXT = (".jpg", ".jpeg", ".png")
THRESHOLD = 10  # smaller = stricter
DISPLAY_TIME = 10  # seconds to show name

# ---- HELPER FUNCTIONS ----
def parse_identity_from_folder(folder_name):
    parts = folder_name.split("_", 1)
    if len(parts) == 2:
        return parts[0], parts[1]  # USN, Name
    return "UNKNOWN", folder_name

# ---- LOAD MODEL ----
print("🔄 Loading Facenet model...")
model = Facenet.loadModel()
print("✅ Model loaded!")

# ---- PREPARE DATABASE EMBEDDINGS ----
database_embeddings = []
for student_folder in os.listdir(DB_PATH):
    folder_path = os.path.join(DB_PATH, student_folder)
    if not os.path.isdir(folder_path):
        continue

    usn, name = parse_identity_from_folder(student_folder)
    embeddings = []

    for img_name in os.listdir(folder_path):
        if not img_name.lower().endswith(ALLOWED_EXT):
            continue

        img_path = os.path.join(folder_path, img_name)
        img = functions.preprocess_face(img_path, target_size=TARGET_SIZE, enforce_detection=False)

        if img is None:
            continue

        embedding = model.predict(img)
        embeddings.append(embedding)

    if embeddings:
        mean_embedding = np.mean(embeddings, axis=0)
        database_embeddings.append((usn, name, mean_embedding))

# ---- ATTENDANCE TRACKER ----
attendance = {}           # {usn: {"name": name, "time": timestamp}}
display_tracker = {}      # {usn: detection_time}

# ---- FACE RECOGNITION FUNCTION ----
def recognize_faces(frame):
    identities = []

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.2, minNeighbors=5)

    for (x, y, w, h) in faces:
        face_img = frame[y:y+h, x:x+w]
        img = functions.preprocess_face(face_img, target_size=TARGET_SIZE, enforce_detection=False)
        if img is None:
            continue

        frame_embedding = model.predict(img)

        min_dist = float('inf')
        identity = "Unknown"

        for usn, name, db_emb in database_embeddings:
            dist = np.linalg.norm(frame_embedding - db_emb)
            if dist < min_dist:
                min_dist = dist
                identity = f"{usn} - {name}" if min_dist < THRESHOLD else "Unknown"

        identities.append(((x, y, w, h), identity))
    return identities

# ---- REAL-TIME WEBCAM LOOP ----
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("❌ Could not open webcam.")
    exit()

print("🔄 Starting webcam recognition. Press 'q' to quit.")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    current_time = time.time()
    results = recognize_faces(frame)

    for (x, y, w, h), student_info in results:
        if student_info != "Unknown":
            usn, name = student_info.split(" - ")

            # Record attendance if first time detected
            if usn not in attendance:
                attendance[usn] = {"name": name, "time": time.strftime("%Y-%m-%d %H:%M:%S")}

            # Only draw if within DISPLAY_TIME seconds
            if usn not in display_tracker:
                display_tracker[usn] = current_time

            if current_time - display_tracker[usn] < DISPLAY_TIME:
                # Draw bounding box
                cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
                cv2.putText(frame, student_info, (x, y - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)

    cv2.imshow("Student Recognition", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()

# ---- SAVE ATTENDANCE TO JSON ----
with open("attendance.json", "w") as f:
    json.dump(attendance, f, indent=4)

print("🎯 Attendance saved to attendance.json")
print(json.dumps(attendance, indent=4))
