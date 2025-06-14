import { useState, useEffect } from 'react';
import { Container, Typography, Grid, CircularProgress, Box } from '@mui/material';
import SurveyCard from './SurveyCard';
import { fetchSurveys } from '../../services/surveyService';

const SurveysList = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Lấy danh sách khảo sát từ service
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
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