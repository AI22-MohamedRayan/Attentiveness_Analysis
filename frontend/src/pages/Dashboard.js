import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  Video, 
  BarChart3, 
  Plus, 
  UserPlus,
  Calendar,
  TrendingUp
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const { 
    selectedClass, 
    classes, 
    students, 
    updateClasses, 
    updateSelectedClass, 
    updateStudents,
    loadingStates,
    setLoadingState 
  } = useApp();
  
  const [dashboardStats, setDashboardStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    todayAttendance: 0,
    averageAttentiveness: 0,
  });

  // Fetch initial data
  useEffect(() => {
    fetchClasses();
  }, []);

  // Update selected class students when class changes
  useEffect(() => {
    if (selectedClass) {
      fetchClassStudents(selectedClass.id);
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    setLoadingState('classes', true);
    try {
      const response = await apiService.classes.getAll();
      const classesData = response.data;
      updateClasses(classesData);
      
      if (classesData.length > 0 && !selectedClass) {
        updateSelectedClass(classesData[0]);
      }
      
      setDashboardStats(prev => ({
        ...prev,
        totalClasses: classesData.length
      }));
      
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setLoadingState('classes', false);
    }
  };

  const fetchClassStudents = async (classId) => {
    setLoadingState('students', true);
    try {
      const response = await apiService.students.getByClass(classId);
      const studentsData = response.data;
      updateStudents(studentsData);
      
      setDashboardStats(prev => ({
        ...prev,
        totalStudents: studentsData.length
      }));
      
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoadingState('students', false);
    }
  };

  const handleClassSelect = (classData) => {
    updateSelectedClass(classData);
  };

  const quickActions = [
    {
      title: 'Create Class',
      description: 'Add a new class with subject and details',
      icon: Plus,
      href: '/create-class',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: 'Register Students',
      description: 'Add students to your classes',
      icon: UserPlus,
      href: '/register-student',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      title: 'Start Live Session',
      description: 'Begin real-time attendance tracking',
      icon: Video,
      href: '/live-attentiveness',
      color: 'bg-red-500 hover:bg-red-600',
    },
    {
      title: 'View Reports',
      description: 'Analyze attendance and attentiveness data',
      icon: BarChart3,
      href: '/reports',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
  ];

  const statsCards = [
    {
      title: 'Total Classes',
      value: dashboardStats.totalClasses,
      icon: BookOpen,
      color: 'text-blue-600 bg-blue-100',
      change: '+2 this month',
    },
    {
      title: 'Total Students',
      value: dashboardStats.totalStudents,
      icon: Users,
      color: 'text-green-600 bg-green-100',
      change: `${selectedClass ? `in ${selectedClass.subject}` : 'across all classes'}`,
    },
    {
      title: 'Today\'s Sessions',
      value: dashboardStats.todayAttendance || 0,
      icon: Calendar,
      color: 'text-orange-600 bg-orange-100',
      change: 'No sessions yet',
    },
    {
      title: 'Avg. Attentiveness',
      value: `${dashboardStats.averageAttentiveness || 85}%`,
      icon: TrendingUp,
      color: 'text-purple-600 bg-purple-100',
      change: '+3% from last week',
    },
  ];

  return (
    <div className="w-full px-6 py-8 bg-gray-50">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name || 'Teacher'}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's an overview of your classes and recent activity.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Class Selection & Students */}
        <div className="lg:col-span-2">
          {/* Class Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Select Class</h2>
              <p className="text-sm text-gray-600 mt-1">Choose a class to view students and manage activities</p>
            </div>
            
            <div className="p-6">
              {loadingStates.classes ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner text="Loading classes..." />
                </div>
              ) : classes.length > 0 ? (
                <div className="space-y-3">
                  {classes.map((classData) => (
                    <div
                      key={classData.id}
                      onClick={() => handleClassSelect(classData)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        selectedClass?.id === classData.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{classData.subject}</h3>
                          <p className="text-sm text-gray-600">
                            {classData.class_name} • Semester {classData.semester}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {selectedClass?.id === classData.id ? students.length : '...'} students
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">No classes found</p>
                  <Link
                    to="/create-class"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Class
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Students List */}
          {selectedClass && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Students in {selectedClass.subject}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Total {students.length} registered students
                    </p>
                  </div>
                  <Link
                    to="/register-student"
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Register Students
                  </Link>
                </div>
              </div>
              
              <div className="p-6">
                {loadingStates.students ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner text="Loading students..." />
                  </div>
                ) : students.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {students.map((student) => (
                      <li key={student.id} className="py-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{student.name}</p>
                          <p className="text-sm text-gray-600">{student.usn} • Sem {student.semester}</p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600">
                          Active
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-gray-600 py-8">No students found in this class.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={index}
                    to={action.href}
                    className={`flex items-center p-4 rounded-lg text-white ${action.color} transition-colors`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <div>
                      <p className="font-medium">{action.title}</p>
                      <p className="text-sm opacity-90">{action.description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;