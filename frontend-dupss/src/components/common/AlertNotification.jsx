import React, { useState, useEffect } from 'react';
import { Alert, Snackbar } from '@mui/material';

// 创建一个全局事件总线，用于在组件之间通信
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

// 显示成功提示的辅助函数
export const showSuccessAlert = (message) => {
  alertEventBus.emit('show', { message, severity: 'success' });
};

// 显示错误提示的辅助函数
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
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert 
        onClose={handleClose} 
        severity={severity} 
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default AlertNotification; 