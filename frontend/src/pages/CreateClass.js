import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, ArrowLeft } from 'lucide-react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
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
    
    if (!validateForm()) {
      return;
    }

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
      
      // Add to global state
      addClass(newClass);
      
      toast.success('Class created successfully!');
      
      // Navigate to dashboard or manage classes
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error creating class:', error);
      toast.error(error.response?.data?.detail || 'Failed to create class');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Header />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 pt-16">
          <div className="container mx-auto px-6 py-8 max-w-4xl">
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
                  <p className="text-gray-600 mt-1">
                    Add a new class to start managing students and attendance
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Subject Selection */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      disabled={isLoading}
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

                  {/* Semester Selection */}
                  <div>
                    <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-2">
                      Semester <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="semester"
                      name="semester"
                      required
                      value={formData.semester}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      disabled={isLoading}
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
                      required
                      value={formData.class_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      placeholder="e.g., CS-A, IT-B, Section-1"
                      disabled={isLoading}
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 resize-none"
                      placeholder="Add any additional details about this class..."
                      disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Optional description for the class (schedule, room number, etc.)
                    </p>
                  </div>

                  {/* Preview Card */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Class Preview</h3>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {formData.subject || 'Subject Name'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {formData.class_name || 'Class Name'} • Semester {formData.semester || 'X'}
                          </p>
                          {formData.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {formData.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 transition duration-200"
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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

            {/* Help Section */}
            <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-sm font-medium text-blue-900 mb-2">💡 Tips for Creating Classes</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use clear, descriptive class names like "CS-A" or "Section-1"</li>
                <li>• The subject and semester combination should be unique</li>
                <li>• Add room numbers or schedules in the description for reference</li>
                <li>• You can edit class details later from the Manage Classes page</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateClass;