# backend/models.py
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Teacher Models
class Teacher(BaseModel):
    name: str
    teacher_id: str
    department: str
    password: str

class TeacherLogin(BaseModel):
    teacher_id: str
    password: str

class TeacherResponse(BaseModel):
    id: str
    name: str
    teacher_id: str
    department: str

# Class Models
class ClassCreate(BaseModel):
    subject: str
    semester: int
    class_name: str
    description: Optional[str] = None

class Class(BaseModel):
    id: str
    subject: str
    semester: int
    class_name: str
    description: Optional[str] = None
    teacher_id: str
    created_at: datetime

class ClassResponse(BaseModel):
    id: str
    subject: str
    semester: int
    class_name: str
    description: Optional[str] = None
    teacher_id: str
    created_at: datetime

# Student Models
class StudentCreate(BaseModel):
    name: str
    usn: str
    semester: int
    department: str

class Student(BaseModel):
    id: str
    name: str
    usn: str
    semester: int
    department: str
    class_id: str
    face_embedding: Optional[List[float]] = None
    registered_at: datetime

class StudentResponse(BaseModel):
    id: str
    name: str
    usn: str
    semester: int
    department: str
    class_id: str
    registered_at: datetime

# Attendance Models
class AttendanceRecordItem(BaseModel):
    student_id: str
    present: bool
    attentiveness_score: Optional[float] = 0.0

class AttendanceCreate(BaseModel):
    date: str
    records: List[AttendanceRecordItem]
    session_duration: Optional[int] = 0  # in minutes

class AttendanceRecord(BaseModel):
    id: str
    student_id: str
    class_id: str
    date: str
    present: bool
    attentiveness_score: Optional[float] = 0.0
    session_duration: Optional[int] = 0
    created_at: datetime

# Report Models
class StudentReport(BaseModel):
    student_id: str
    student_name: str
    student_usn: str
    attendance_percentage: float
    average_attentiveness: float
    total_classes: int
    present_classes: int