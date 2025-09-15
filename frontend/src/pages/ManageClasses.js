import React, { useState } from "react";
import {
  BookOpen,
  Plus,
  Users,
  Edit3,
  Trash2,
  Eye,
  Calendar,
  Search,
  Filter,
} from "lucide-react";

const ManageClasses = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  
  // Mock data
  const classes = [
    {
      id: 1,
      subject: "Artificial Intelligence and Machine Learning (AIML)",
      class_name: "CSE 7th Semester", 
      semester: 7,
      description: "Advanced AI/ML concepts and applications",
      created_at: "2025-01-15T10:00:00Z"
    }
  ];
  
  const classStudentCounts = { 1: 0 };
  const loadingStates = { classes: false };

  const filteredClasses = classes.filter((cls) => {
    const matchSearch =
      searchTerm === "" ||
      cls.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.class_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSem =
      selectedSemester === "" || cls.semester.toString() === selectedSemester;
    return matchSearch && matchSem;
  });

  const semesters = [...new Set(classes.map((c) => c.semester))].sort();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Classes</h1>
          <p className="text-gray-600 mt-2">View and manage all your classes</p>
        </div>

        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">
          <Plus className="w-4 h-4 mr-2 flex-shrink-0" />
          Create Class
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute left-3 top-2.5 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by subject or class name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Semester Filter */}
          <div className="sm:w-48 relative">
            <div className="absolute left-3 top-5 pointer-events-none p-5">
              <Filter className="w-5 h-5 top-5 text-gray-400" />
            </div>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full pl-11 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-sm"
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

      {/* Class Cards */}
      {loadingStates.classes ? (
        <div className="flex justify-center py-12">
          <div className="text-center">Loading classes...</div>
        </div>
      ) : filteredClasses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => (
            <div
              key={cls.id}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition"
            >
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">{cls.subject}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {cls.class_name} • Semester {cls.semester}
                </p>
                {cls.description && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                    {cls.description}
                  </p>
                )}
              </div>

              <div className="px-6 py-4 border-b bg-gray-50">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-600">{classStudentCounts[cls.id] || 0} Students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-600">{new Date(cls.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    <button className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition">
                      <Users className="w-4 h-4 flex-shrink-0" />
                      Add Students
                    </button>
                    <button className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition">
                      <Eye className="w-4 h-4 flex-shrink-0" />
                      Live Session
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      className="inline-flex items-center justify-center w-9 h-9 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      className="inline-flex items-center justify-center w-9 h-9 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete"
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
        <div className="text-center py-12 bg-white rounded-lg border">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || selectedSemester
              ? "No classes found"
              : "No classes created yet"}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedSemester
              ? "Try adjusting your search or filters"
              : "Get started by creating your first class"}
          </p>
          {!searchTerm && !selectedSemester && (
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              <Plus className="w-4 h-4 mr-2 flex-shrink-0" />
              Create Your First Class
            </button>
          )}
        </div>
      )}

      {/* Overview */}
      {classes.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Overview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {classes.length}
              </div>
              <div className="text-sm text-gray-600">Total Classes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {Object.values(classStudentCounts).reduce((sum, c) => sum + c, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Students</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {semesters.length}
              </div>
              <div className="text-sm text-gray-600">Semesters</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageClasses;