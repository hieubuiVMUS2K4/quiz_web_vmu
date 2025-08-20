import React, { useEffect } from 'react';
import HeaderExt from '../components/Layout/HeaderExt';
import ConnectionStatus from '../components/ConnectionStatus';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, Navigate } from 'react-router-dom';

const LayoutPage = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Layout initialization effect if needed
  }, []);

  // Check if trying to access admin page without admin role
  const isAdminRoute = location.pathname.includes('/admin');
  if (isAdminRoute && user?.role !== 'admin') {
    return <Navigate to="/home" replace />;
  }

  return (
    <div style={{ paddingTop: '60px', minHeight: '100vh' }}>
      <ConnectionStatus />
      <HeaderExt />
      <div className="flex-grow-1">
        {children}
      </div>
    </div>
  );
};

export default LayoutPage;
