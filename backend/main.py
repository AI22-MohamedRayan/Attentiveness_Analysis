# backend/main.py
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
from typing import Optional, List
import jwt
import bcrypt
import os
from bson import ObjectId
import uvicorn

# Models
from models import (
    Teacher, TeacherLogin, TeacherResponse,
    Class, ClassCreate, ClassResponse,
    Student, StudentCreate, StudentResponse,
    AttendanceRecord, AttendanceCreate
)

# Database connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb+srv://mohammedraiyanrs_db_user:nOTlK1jWGQ8XBDnA@cluster0.u7gswbr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
DATABASE_NAME = "attentiveness_system"

client = AsyncIOMotorClient(MONGODB_URL)
db = client[DATABASE_NAME]

# Collections
teachers_collection = db["teachers"]
classes_collection = db["classes"]
students_collection = db["students"]
attendance_collection = db["attendance_attentiveness"]

# Security
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

app = FastAPI(title="Attentiveness Analysis API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security scheme
security = HTTPBearer()

# Helper functions
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

async def get_current_teacher(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        teacher_id: str = payload.get("sub")
        if teacher_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication")
    
    teacher = await teachers_collection.find_one({"_id": ObjectId(teacher_id)})
    if teacher is None:
        raise HTTPException(status_code=401, detail="Teacher not found")
    
    return teacher

# Helper to convert ObjectId to string
def serialize_doc(doc):
    if doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc

# API Routes

@app.post("/auth/login")
async def login(teacher_login: TeacherLogin):
    teacher = await teachers_collection.find_one({"teacher_id": teacher_login.teacher_id})
    
    if not teacher or not verify_password(teacher_login.password, teacher["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": str(teacher["_id"])})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "teacher": {
            "id": str(teacher["_id"]),
            "name": teacher["name"],
            "teacher_id": teacher["teacher_id"],
            "department": teacher["department"]
        }
    }

@app.post("/auth/register")
async def register_teacher(teacher: Teacher):
    # Check if teacher already exists
    existing_teacher = await teachers_collection.find_one({"teacher_id": teacher.teacher_id})
    if existing_teacher:
        raise HTTPException(status_code=400, detail="Teacher ID already exists")
    
    # Hash password
    hashed_password = get_password_hash(teacher.password)
    
    teacher_doc = {
        "name": teacher.name,
        "teacher_id": teacher.teacher_id,
        "department": teacher.department,
        "password": hashed_password,
        "created_at": datetime.utcnow()
    }
    
    result = await teachers_collection.insert_one(teacher_doc)
    
    return {
        "message": "Teacher registered successfully",
        "teacher_id": str(result.inserted_id)
    }

@app.get("/teacher/profile")
async def get_teacher_profile(current_teacher: dict = Depends(get_current_teacher)):
    return TeacherResponse(
        id=str(current_teacher["_id"]),
        name=current_teacher["name"],
        teacher_id=current_teacher["teacher_id"],
        department=current_teacher["department"]
    )

@app.post("/classes", response_model=ClassResponse)
async def create_class(class_data: ClassCreate, current_teacher: dict = Depends(get_current_teacher)):
    class_doc = {
        "subject": class_data.subject,
        "semester": class_data.semester,
        "teacher_id": ObjectId(current_teacher["_id"]),
        "class_name": class_data.class_name,
        "description": class_data.description,
        "created_at": datetime.utcnow()
    }
    
    result = await classes_collection.insert_one(class_doc)
    class_doc["id"] = str(result.inserted_id)
    del class_doc["_id"]
    class_doc["teacher_id"] = str(class_doc["teacher_id"])
    
    return class_doc

@app.get("/classes", response_model=List[ClassResponse])
async def get_teacher_classes(current_teacher: dict = Depends(get_current_teacher)):
    classes_cursor = classes_collection.find({"teacher_id": ObjectId(current_teacher["_id"])})
    classes = await classes_cursor.to_list(length=100)
    
    result = []
    for class_doc in classes:
        class_doc["id"] = str(class_doc["_id"])
        del class_doc["_id"]
        class_doc["teacher_id"] = str(class_doc["teacher_id"])
        result.append(class_doc)
    
    return result

@app.get("/classes/{class_id}")
async def get_class(class_id: str, current_teacher: dict = Depends(get_current_teacher)):
    class_doc = await classes_collection.find_one({
        "_id": ObjectId(class_id),
        "teacher_id": ObjectId(current_teacher["_id"])
    })
    
    if not class_doc:
        raise HTTPException(status_code=404, detail="Class not found")
    
    return serialize_doc(class_doc)

@app.post("/classes/{class_id}/students", response_model=StudentResponse)
async def register_student(
    class_id: str, 
    student_data: StudentCreate, 
    current_teacher: dict = Depends(get_current_teacher)
):
    # Verify class belongs to teacher
    class_doc = await classes_collection.find_one({
        "_id": ObjectId(class_id),
        "teacher_id": ObjectId(current_teacher["_id"])
    })
    
    if not class_doc:
        raise HTTPException(status_code=404, detail="Class not found")
    
    # Check if student already exists in this class
    existing_student = await students_collection.find_one({
        "usn": student_data.usn,
        "class_id": ObjectId(class_id)
    })
    
    if existing_student:
        raise HTTPException(status_code=400, detail="Student already registered in this class")
    
    student_doc = {
        "name": student_data.name,
        "usn": student_data.usn,
        "semester": student_data.semester,
        "department": student_data.department,
        "class_id": ObjectId(class_id),
        "face_embedding": None,  # To be updated when face is captured
        "registered_at": datetime.utcnow()
    }
    
    result = await students_collection.insert_one(student_doc)
    student_doc["id"] = str(result.inserted_id)
    del student_doc["_id"]
    student_doc["class_id"] = str(student_doc["class_id"])
    
    return student_doc

@app.get("/classes/{class_id}/students", response_model=List[StudentResponse])
async def get_class_students(class_id: str, current_teacher: dict = Depends(get_current_teacher)):
    # Verify class belongs to teacher
    class_doc = await classes_collection.find_one({
        "_id": ObjectId(class_id),
        "teacher_id": ObjectId(current_teacher["_id"])
    })
    
    if not class_doc:
        raise HTTPException(status_code=404, detail="Class not found")
    
    students_cursor = students_collection.find({"class_id": ObjectId(class_id)})
    students = await students_cursor.to_list(length=100)
    
    result = []
    for student in students:
        student["id"] = str(student["_id"])
        del student["_id"]
        student["class_id"] = str(student["class_id"])
        # Don't return face_embedding for privacy
        if "face_embedding" in student:
            del student["face_embedding"]
        result.append(student)
    
    return result

@app.post("/classes/{class_id}/attendance")
async def mark_attendance(
    class_id: str,
    attendance_data: AttendanceCreate,
    current_teacher: dict = Depends(get_current_teacher)
):
    # Verify class belongs to teacher
    class_doc = await classes_collection.find_one({
        "_id": ObjectId(class_id),
        "teacher_id": ObjectId(current_teacher["_id"])
    })
    
    if not class_doc:
        raise HTTPException(status_code=404, detail="Class not found")
    
    # Create attendance records
    attendance_records = []
    for record in attendance_data.records:
        attendance_doc = {
            "student_id": ObjectId(record.student_id),
            "class_id": ObjectId(class_id),
            "date": attendance_data.date,
            "present": record.present,
            "attentiveness_score": record.attentiveness_score,
            "session_duration": attendance_data.session_duration,
            "created_at": datetime.utcnow()
        }
        attendance_records.append(attendance_doc)
    
    if attendance_records:
        await attendance_collection.insert_many(attendance_records)
    
    return {"message": "Attendance marked successfully", "records_count": len(attendance_records)}

@app.get("/classes/{class_id}/attendance")
async def get_attendance_records(
    class_id: str,
    date: Optional[str] = None,
    current_teacher: dict = Depends(get_current_teacher)
):
    # Verify class belongs to teacher
    class_doc = await classes_collection.find_one({
        "_id": ObjectId(class_id),
        "teacher_id": ObjectId(current_teacher["_id"])
    })
    
    if not class_doc:
        raise HTTPException(status_code=404, detail="Class not found")
    
    query = {"class_id": ObjectId(class_id)}
    if date:
        query["date"] = date
    
    attendance_cursor = attendance_collection.find(query)
    attendance_records = await attendance_cursor.to_list(length=1000)
    
    # Get student details for each record
    result = []
    for record in attendance_records:
        student = await students_collection.find_one({"_id": record["student_id"]})
        if student:
            result.append({
                "id": str(record["_id"]),
                "student_name": student["name"],
                "student_usn": student["usn"],
                "date": record["date"],
                "present": record["present"],
                "attentiveness_score": record.get("attentiveness_score", 0.0),
                "session_duration": record.get("session_duration", 0)
            })
    
    return result

@app.get("/classes/{class_id}/reports")
async def get_class_reports(class_id: str, current_teacher: dict = Depends(get_current_teacher)):
    # Verify class belongs to teacher
    class_doc = await classes_collection.find_one({
        "_id": ObjectId(class_id),
        "teacher_id": ObjectId(current_teacher["_id"])
    })
    
    if not class_doc:
        raise HTTPException(status_code=404, detail="Class not found")
    
    # Get all students in the class
    students_cursor = students_collection.find({"class_id": ObjectId(class_id)})
    students = await students_cursor.to_list(length=100)
    
    reports = []
    
    for student in students:
        # Get attendance records for this student
        attendance_cursor = attendance_collection.find({
            "student_id": student["_id"],
            "class_id": ObjectId(class_id)
        })
        attendance_records = await attendance_cursor.to_list(length=1000)
        
        total_classes = len(attendance_records)
        present_classes = len([r for r in attendance_records if r["present"]])
        attendance_percentage = (present_classes / total_classes * 100) if total_classes > 0 else 0
        
        avg_attentiveness = 0
        if attendance_records:
            attentiveness_scores = [r.get("attentiveness_score", 0) for r in attendance_records if r["present"]]
            avg_attentiveness = sum(attentiveness_scores) / len(attentiveness_scores) if attentiveness_scores else 0
        
        reports.append({
            "student_id": str(student["_id"]),
            "student_name": student["name"],
            "student_usn": student["usn"],
            "attendance_percentage": round(attendance_percentage, 2),
            "average_attentiveness": round(avg_attentiveness, 2),
            "total_classes": total_classes,
            "present_classes": present_classes
        })
    
    return reports

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)