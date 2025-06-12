import React from 'react';
import { Box, Typography, Button, Alert, AlertTitle, CircularProgress } from '@mui/material';

const SurveyResult = ({ result, onSubmit, onBack, submitting = false }) => {
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom align="center">
        Kết quả khảo sát
      </Typography>
      
      <Alert 
        severity={result.score > 4 ? "warning" : "success"}
        sx={{ my: 3, p: 2 }}
      >
        <AlertTitle>Điểm số của bạn: {result.score}</AlertTitle>
        {result.message}
      </Alert>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          variant="outlined"
          onClick={onBack}
          disabled={submitting}
        >
          Quay lại
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={onSubmit}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={20} /> : null}
        >
          {submitting ? 'Đang gửi...' : 'Lưu kết quả'}
        </Button>
      </Box>
    </Box>
  );
};

export default SurveyResult; 