import React from 'react';
import { Box, Typography, Button, Alert, AlertTitle, CircularProgress } from '@mui/material';

const SurveyResult = ({ result, onSubmit, onBack, submitting = false }) => {
  // 确定结果颜色
  const getResultSeverity = () => {
    if (result.score <= 1) return "success"; // 低风险，绿色
    return "warning"; // 有风险或高风险，黄色
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 'bold', mb: 4 }}>
        Kết quả {result.title || 'Khảo sát'}
      </Typography>
      
      <Typography variant="h5" gutterBottom align="center" sx={{ mb: 5 }}>
        Điểm số của bạn:
      </Typography>

      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          mb: 5 
        }}
      >
        <Box 
          sx={{ 
            width: 150, 
            height: 150, 
            borderRadius: '50%', 
            bgcolor: 'rgba(232, 244, 253, 0.8)', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}
        >
          <Typography 
            variant="h2" 
            sx={{ 
              fontWeight: 'bold', 
              color: '#0071bc' 
            }}
          >
            {result.score}/{result.maxScore}
          </Typography>
        </Box>
      </Box>
      
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
        Đánh giá kết quả:
      </Typography>
      
      <Box 
        sx={{ 
          p: 3, 
          borderRadius: 2, 
          bgcolor: getResultSeverity() === 'success' ? 'rgba(200, 230, 201, 0.8)' : 'rgba(255, 236, 179, 0.8)', 
          borderLeft: `8px solid ${getResultSeverity() === 'success' ? '#4caf50' : '#ff9800'}`,
          mb: 4
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 'bold', 
            color: getResultSeverity() === 'success' ? '#2e7d32' : '#e65100',
            mb: 1
          }}
        >
          {getResultSeverity() === 'success' ? 'Không có nguy cơ:' : 'Có nguy cơ:'}
        </Typography>
        <Typography variant="body1">
          {result.message}
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          variant="outlined"
          onClick={onBack}
          disabled={submitting}
          size="large"
        >
          Quay lại
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={onSubmit}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={20} /> : null}
          size="large"
        >
          {submitting ? 'Đang gửi...' : 'Lưu kết quả'}
        </Button>
      </Box>
    </Box>
  );
};

export default SurveyResult; 