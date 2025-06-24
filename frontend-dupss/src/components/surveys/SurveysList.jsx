import { useState, useEffect } from 'react';
import { Container, Typography, Grid, CircularProgress, Box } from '@mui/material';
import SurveyCard from './SurveyCard';
import { fetchSurveys } from '../../services/surveyService';
import { showSuccessAlert, showErrorAlert } from '../common/AlertNotification';

const SurveysList = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get survey list from service
    const getSurveys = async () => {
      setLoading(true);
      
      try {
        const data = await fetchSurveys();
        setSurveys(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching surveys:', err);
        setError('Đã xảy ra lỗi khi tải danh sách khảo sát. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    getSurveys();
  }, []);

  // Kiểm tra và hiển thị thông báo từ localStorage
  useEffect(() => {
    const checkSubmissionResult = () => {
      const resultJson = localStorage.getItem('surveySubmissionResult');
      if (!resultJson) return;
      
      try {
        const result = JSON.parse(resultJson);
        
        if (result.success) {
          showSuccessAlert(result.message || 'Lưu khảo sát thành công');
        } else {
          showErrorAlert(result.message || 'Có lỗi xảy ra khi lưu khảo sát');
        }
        
        // Xóa thông báo sau khi hiển thị
        localStorage.removeItem('surveySubmissionResult');
      } catch (error) {
        console.error('Lỗi khi xử lý thông báo khảo sát:', error);
        localStorage.removeItem('surveySubmissionResult');
      }
    };
    
    // Cho phép trang render trước khi hiển thị thông báo
    setTimeout(checkSubmissionResult, 500);
  }, []);

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Box sx={{ p: 3, bgcolor: '#ffebee', borderRadius: 1, mt: 4 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 8, px: { xs: 1, sm: 2, md: 3 } }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 4, fontWeight: 600, color: '#0056b3' }}>
        Các bài khảo sát đánh giá rủi ro
      </Typography>
      
      {surveys.length === 0 ? (
        <Typography align="center">Không có bài khảo sát nào</Typography>
      ) : (
        <Grid container spacing={4}>
          {surveys.map((survey) => (
            <Grid item xs={12} key={survey.id}>
              <SurveyCard survey={survey} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default SurveysList; 