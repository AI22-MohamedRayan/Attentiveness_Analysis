import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useApp } from '../../context/AppContext';

const Layout = ({ children }) => {
  const { sidebarOpen, setSidebarOpen } = useApp();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar />
      
      {/* Main content area */}
      <div className={`
        transition-all duration-300 ease-in-out
        pt-16
        lg:ml-64
      `}>
        <main className="p-0">
          {children}
        </main>
      </div>
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;