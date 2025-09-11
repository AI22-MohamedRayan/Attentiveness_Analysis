import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Health check
  health: () => api.get('/health'),

  // Authentication
  auth: {
    login: (teacherId, password) => 
      api.post('/auth/login', { teacher_id: teacherId, password }),
    
    register: (teacherData) => 
      api.post('/auth/register', teacherData),
    
    getProfile: () => 
      api.get('/teacher/profile'),
  },

  // Classes
  classes: {
    create: (classData) => 
      api.post('/classes', classData),
    
    getAll: () => 
      api.get('/classes'),
    
    getById: (classId) => 
      api.get(`/classes/${classId}`),
    
    update: (classId, classData) => 
      api.put(`/classes/${classId}`, classData),
    
    delete: (classId) => 
      api.delete(`/classes/${classId}`),
  },

  // Students
  students: {
    register: (classId, studentData) => 
      api.post(`/classes/${classId}/students`, studentData),
    
    getByClass: (classId) => 
      api.get(`/classes/${classId}/students`),
    
    update: (classId, studentId, studentData) => 
      api.put(`/classes/${classId}/students/${studentId}`, studentData),
    
    delete: (classId, studentId) => 
      api.delete(`/classes/${classId}/students/${studentId}`),
    
    uploadFace: (classId, studentId, faceData) => {
      const formData = new FormData();
      formData.append('face_image', faceData);
      return api.post(`/classes/${classId}/students/${studentId}/face`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
  },

  // Attendance
  attendance: {
    mark: (classId, attendanceData) => 
      api.post(`/classes/${classId}/attendance`, attendanceData),
    
    get: (classId, date = null) => {
      const params = date ? { date } : {};
      return api.get(`/classes/${classId}/attendance`, { params });
    },
    
    update: (classId, attendanceId, attendanceData) => 
      api.put(`/classes/${classId}/attendance/${attendanceId}`, attendanceData),
  },

  // Reports
  reports: {
    getClassReports: (classId) => 
      api.get(`/classes/${classId}/reports`),
    
    getStudentReport: (classId, studentId) => 
      api.get(`/classes/${classId}/reports/student/${studentId}`),
    
    exportCSV: (classId, params = {}) => 
      api.get(`/classes/${classId}/reports/export/csv`, { 
        params,
        responseType: 'blob' 
      }),
    
    exportPDF: (classId, params = {}) => 
      api.get(`/classes/${classId}/reports/export/pdf`, { 
        params,
        responseType: 'blob' 
      }),
  },

  // Live session (for future WebSocket integration)
  liveSession: {
    start: (classId) => 
      api.post(`/classes/${classId}/live-session/start`),
    
    stop: (classId, sessionId) => 
      api.post(`/classes/${classId}/live-session/${sessionId}/stop`),
    
    getStatus: (classId, sessionId) => 
      api.get(`/classes/${classId}/live-session/${sessionId}/status`),
  },
};

export default api;