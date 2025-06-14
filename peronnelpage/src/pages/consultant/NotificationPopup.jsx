import React, { useEffect, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';
import NotificationService from '../../services/NotificationService';

export default function NotificationPopup() {
  const [open, setOpen] = useState(false);
  const [notif, setNotif] = useState({ type: 'info', message: '', description: '' });

  useEffect(() => {
    const unsub = NotificationService.subscribe((n) => {
      setNotif(n);
      setOpen(true);
    });
    return unsub;
  }, []);

  const handleClose = () => setOpen(false);

  return (
    <Snackbar
      open={open}
      autoHideDuration={3500}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert severity={notif.type} onClose={handleClose} sx={{ width: '100%' }}>
        <strong>{notif.message}</strong>
        {notif.description && <div>{notif.description}</div>}
      </Alert>
    </Snackbar>
  );
} 