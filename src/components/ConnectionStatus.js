import React, { useState, useEffect } from 'react';
import { Alert } from 'react-bootstrap';
import api from '../services/api';

const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        await api.get('/topics?_limit=1');
        if (!isOnline) {
          setIsOnline(true);
          setShowAlert(true);
          setTimeout(() => setShowAlert(false), 3000);
        }
      } catch (error) {
        if (isOnline) {
          setIsOnline(false);
          setShowAlert(true);
        }
      }
    };

    // Check immediately
    checkConnection();

    // Check every 10 seconds
    const interval = setInterval(checkConnection, 10000);

    return () => clearInterval(interval);
  }, [isOnline]);

  if (!showAlert) return null;

  return (
    <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 9999 }}>
      <Alert 
        variant={isOnline ? 'success' : 'danger'} 
        dismissible 
        onClose={() => setShowAlert(false)}
        className="shadow"
      >
        <i className={`bi bi-${isOnline ? 'wifi' : 'wifi-off'} me-2`}></i>
        {isOnline ? 'Đã kết nối lại máy chủ' : 'Mất kết nối máy chủ'}
      </Alert>
    </div>
  );
};

export default ConnectionStatus;
