import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Plus, 
  Users, 
  Edit3, 
  Trash2, 
  Eye,
  Calendar,
  Search,
  Filter
} from 'lucide-react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const ManageClasses = () => {
  const { user } = useAuth();
  const { 
    classes, 
    updateClasses, 
    removeClass,
    loadingStates,
    setLoadingState 
  } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [classStudentCounts, setClassStudentCounts] = useState({});

  // Fetch initial data
  useEffect(() => {
    fetchClasses();
  }, []);

  // Fetch student counts for each class
  useEffect(() => {
    if (classes.length > 0) {
      fetchStudentCounts();
    }
  }, [classes]);

  const fetchClasses = async () => {
    setLoadingState('classes', true);
    try {
      const response = await apiService.classes.getAll();
      updateClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setLoadingState('classes', false);
    }
  };

  const fetchStudentCounts = async () => {
    const counts = {};
    
    // Fetch student count for each class
    await Promise.all(
      classes.map(async (classData) => {
        try {
          const response = await apiService.students.getByClass(classData.id);
          counts[classData.id] = response.data.length;
        } catch (error) {
          counts[classData.id] = 0;
        }
      })
    );
    
    setClassStudentCounts(counts);
  };

  const handleDeleteClass = async (classId, className) => {
    if (!window.confirm(`Are you sure you want to delete "${className}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiService.classes.delete(classId);
      removeClass(classId);
      toast.success('Class deleted successfully');
    } catch (error) {
      console.error('Error deleting class:', error);
      toast.error('Failed to delete class');
    }
  };

  // Filter classes based on search and semester
  const filteredClasses = classes.filter((classData) => {
    const matchesSearch = searchTerm === '' || 
      classData.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classData.class_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSemester = selectedSemester === '' || 
      classData.semester.toString() === selectedSemester;

    return matchesSearch && matchesSemester;
  });

  const semesters = [...new Set(classes.map(c => c.semester))].sort();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Header />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 pt-16">
          <div className="container mx-auto px-6 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Manage Classes</h1>
                <p className="text-gray-600 mt-2">
                  View and manage all your classes
                </p>
              </div>
              
              <Link
                to="/create-class"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Class
              </Link>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search by subject or class name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  {/* Semester Filter */}
                  <div className="sm:w-48">
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <select
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                      >
                        <option value="">All Semesters</option>
                        {semesters.map((sem) => (
                          <option key={sem} value={sem}>
                            Semester {sem}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Classes Grid/List */}
            {loadingStates.classes ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="large" text="Loading classes..." />
              </div>
            ) : filteredClasses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClasses.map((classData) => (
                  <div key={classData.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                    {/* Class Header */}
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {classData.subject}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {classData.class_name} • Semester {classData.semester}
                          </p>
                          {classData.description && (
                            <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                              {classData.description}
                            </p>
                          )}
                        </div>
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Class Stats */}
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Students:</span>
                          <span className="font-medium text-gray-900">
                            {classStudentCounts[classData.id] || 0}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            Created: {new Date(classData.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/register-student?class=${classData.id}`}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors"
                            title="Add Students"
                          >
                            <Users className="w-3 h-3 mr-1" />
                            Add Students
                          </Link>
                          
                          <Link
                            to={`/live-attentiveness?class=${classData.id}`}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                            title="Start Live Session"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Live Session
                          </Link>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            // onClick={() => handleEditClass(classData)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit Class"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteClass(classData.id, classData.subject)}
                            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete Class"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="text-center py-12">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm || selectedSemester ? 'No classes found' : 'No classes created yet'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm || selectedSemester 
                      ? 'Try adjusting your search or filter criteria'
                      : 'Get started by creating your first class'
                    }
                  </p>
                  {!searchTerm && !selectedSemester && (
                    <Link
                      to="/create-class"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Class
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Summary Stats */}
            {classes.length > 0 && (
              <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Overview</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {classes.length}
                      </div>
                      <div className="text-sm text-gray-600">Total Classes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {Object.values(classStudentCounts).reduce((sum, count) => sum + count, 0)}
                      </div>
                      <div className="text-sm text-gray-600">Total Students</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {semesters.length}
                      </div>
                      <div className="text-sm text-gray-600">Semesters</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManageClasses;