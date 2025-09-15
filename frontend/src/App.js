import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/common/Layout'; // Import the Layout component

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateClass from './pages/CreateClass';
import ManageClasses from './pages/ManageClasses';
import RegisterStudent from './pages/RegisterStudent';
import LiveAttentiveness from './pages/LiveAttentiveness';
import Reports from './pages/Reports';
import Profile from './pages/Profile';

// Styles
import './styles/globals.css';
import './styles/components.css';
import './styles/pages.css';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <div className="App">
            <Routes>
              {/* Public Routes - No Layout */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes - With Layout */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/create-class"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <CreateClass />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/manage-classes"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ManageClasses />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/register-student"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <RegisterStudent />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/live-attentiveness"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <LiveAttentiveness />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Reports />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Profile />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              
              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            
            {/* Toast notifications */}
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  theme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  theme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;