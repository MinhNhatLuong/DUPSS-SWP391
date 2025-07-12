import React, { useState, useEffect } from 'react';
import { Alert, Snackbar } from '@mui/material';

// Create a global event bus for communication between components
export const alertEventBus = {
  listeners: {},
  subscribe(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  },
  unsubscribe(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  },
  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => callback(data));
  }
};

// Helper function to show success alert
export const showSuccessAlert = (message) => {
  alertEventBus.emit('show', { message, severity: 'success' });
};

// Helper function to show error alert
export const showErrorAlert = (message) => {
  alertEventBus.emit('show', { message, severity: 'error' });
};

const AlertNotification = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('success');

  useEffect(() => {
    const handleAlertShow = (data) => {
      setMessage(data.message);
      setSeverity(data.severity);
      setOpen(true);
    };

    alertEventBus.subscribe('show', handleAlertShow);

    return () => {
      alertEventBus.unsubscribe('show', handleAlertShow);
    };
  }, []);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={1500}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{ 
        top: '20px', 
        right: '20px' 
      }}
    >
      <Alert 
        onClose={handleClose} 
        severity={severity} 
        variant="filled"
        sx={{ 
          width: '100%',
          minWidth: '300px',
          fontSize: '1.1rem',
          padding: '12px 16px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          '& .MuiAlert-icon': {
            fontSize: '24px'
          }
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default AlertNotification; 