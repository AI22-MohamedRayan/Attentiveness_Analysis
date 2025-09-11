import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Loading states for different operations
  const [loadingStates, setLoadingStates] = useState({
    classes: false,
    students: false,
    attendance: false,
    reports: false,
  });

  const setLoadingState = (key, value) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Update classes and reset related state
  const updateClasses = (newClasses) => {
    setClasses(newClasses);
    
    // If selected class is no longer in the list, clear it
    if (selectedClass && !newClasses.find(cls => cls.id === selectedClass.id)) {
      setSelectedClass(null);
      setStudents([]);
    }
  };

  // Update selected class and clear students (will be refetched)
  const updateSelectedClass = (classData) => {
    setSelectedClass(classData);
    setStudents([]);
  };

  // Update students for current class
  const updateStudents = (newStudents) => {
    setStudents(newStudents);
  };

  // Add a new class to the list
  const addClass = (newClass) => {
    setClasses(prev => [...prev, newClass]);
  };

  // Update existing class in the list
  const updateClass = (updatedClass) => {
    setClasses(prev => 
      prev.map(cls => cls.id === updatedClass.id ? updatedClass : cls)
    );
    
    // Update selected class if it's the one being updated
    if (selectedClass && selectedClass.id === updatedClass.id) {
      setSelectedClass(updatedClass);
    }
  };

  // Remove class from the list
  const removeClass = (classId) => {
    setClasses(prev => prev.filter(cls => cls.id !== classId));
    
    // Clear selected class if it's the one being removed
    if (selectedClass && selectedClass.id === classId) {
      setSelectedClass(null);
      setStudents([]);
    }
  };

  // Add student to current class
  const addStudent = (newStudent) => {
    setStudents(prev => [...prev, newStudent]);
  };

  // Update existing student
  const updateStudent = (updatedStudent) => {
    setStudents(prev => 
      prev.map(student => 
        student.id === updatedStudent.id ? updatedStudent : student
      )
    );
  };

  // Remove student from current class
  const removeStudent = (studentId) => {
    setStudents(prev => prev.filter(student => student.id !== studentId));
  };

  // Clear all data (used on logout)
  const clearData = () => {
    setSelectedClass(null);
    setClasses([]);
    setStudents([]);
    setLoading(false);
    setLoadingStates({
      classes: false,
      students: false,
      attendance: false,
      reports: false,
    });
  };

  const value = {
    // State
    selectedClass,
    classes,
    students,
    loading,
    loadingStates,
    sidebarOpen,
    
    // Setters
    setLoading,
    setLoadingState,
    setSidebarOpen,
    
    // Class management
    updateClasses,
    updateSelectedClass,
    addClass,
    updateClass,
    removeClass,
    
    // Student management
    updateStudents,
    addStudent,
    updateStudent,
    removeStudent,
    
    // Utility
    clearData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};