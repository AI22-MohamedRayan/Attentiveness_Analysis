import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const CreateClass = () => {
  const { user } = useAuth();
  const { addClass } = useApp();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    subject: '',
    semester: '',
    class_name: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const subjects = [
    'Artificial Intelligence and Machine Learning (AIML)',
    'Database Management Systems (DBMS)',
    'Computer Networks (CN)',
    'Software Engineering (SE)',
    'Data Structures and Algorithms (DSA)',
    'Operating Systems (OS)',
    'Computer Organization and Architecture (COA)',
    'Theory of Computation (TOC)',
    'Compiler Design (CD)',
    'Web Technologies (WT)',
    'Mobile Application Development (MAD)',
    'Cloud Computing (CC)',
    'Internet of Things (IoT)',
    'Cybersecurity',
    'Data Mining and Analytics',
    'Computer Graphics (CG)',
    'Human Computer Interaction (HCI)',
    'Project Management',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Other'
  ];

  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!formData.subject) {
      toast.error('Please select a subject');
      return false;
    }
    if (!formData.semester) {
      toast.error('Please select a semester');
      return false;
    }
    if (!formData.class_name) {
      toast.error('Please enter a class name');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const classData = {
        subject: formData.subject,
        semester: parseInt(formData.semester),
        class_name: formData.class_name,
        description: formData.description || '',
      };

      const response = await apiService.classes.create(classData);
      const newClass = response.data;

      addClass(newClass);
      toast.success('Class created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating class:', error);
      toast.error(error.response?.data?.detail || 'Failed to create class');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="w-full px-6 py-8 bg-gray-50">

      
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={handleCancel}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Class</h1>
              <p className="text-gray-600 mt-2">
                Add a new class to start managing students and attendance
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                             transition duration-200"
                >
                  <option value="">Select a subject</option>
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Choose the subject you'll be teaching in this class
                </p>
              </div>

              {/* Semester */}
              <div>
                <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-2">
                  Semester <span className="text-red-500">*</span>
                </label>
                <select
                  id="semester"
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                             transition duration-200"
                >
                  <option value="">Select semester</option>
                  {semesters.map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Select which semester this class is for
                </p>
              </div>

              {/* Class Name */}
              <div>
                <label htmlFor="class_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Class Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="class_name"
                  name="class_name"
                  type="text"
                  value={formData.class_name}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  placeholder="e.g., CS-A, IT-B, Section-1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                             transition duration-200"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Give your class a unique name or section identifier
                </p>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  placeholder="Add any additional details about this class..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                             transition duration-200 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional description for the class (schedule, room number, etc.)
                </p>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="px-6 py-3 text-gray-700 bg-white border border-gray-300 
                             rounded-lg hover:bg-gray-50 focus:ring-2 
                             focus:ring-gray-500 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg 
                             hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 
                             focus:ring-offset-2 transition duration-200 
                             disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isLoading ? (
                    <LoadingSpinner size="small" text="" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Class
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
    
    </div>
  );
};

export default CreateClass;
