import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Rating,
  CircularProgress,
  Alert,
} from '@mui/material';
import { showErrorAlert, showSuccessAlert } from '../common/AlertNotification';

const AppointmentReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAppointmentDetails();
  }, [id]);

  const fetchAppointmentDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/appointments/${id}`, {
        method: 'GET'
      });

      if (response.status === 200) {
        const data = await response.json();
        setAppointment(data);
        
        // If appointment has existing review, load it
        if (data.reviewScore) {
          setRating(data.reviewScore);
        }
        if (data.customerReview) {
          setReview(data.customerReview);
        }
      } else {
        showErrorAlert('Không thể tải thông tin cuộc hẹn.');
        navigate('/profile');
      }
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      showErrorAlert('Có lỗi xảy ra khi tải thông tin cuộc hẹn.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (rating < 0 || rating > 5) {
      showErrorAlert('Vui lòng chọn đánh giá từ 0 đến 5 sao.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`http://localhost:8080/api/appointments/${id}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reviewScore: rating,
          customerReview: review
        })
      });

      if (response.status === 200) {
        showSuccessAlert('Gửi đánh giá cuộc tư vấn thành công!');
        // Refresh appointment data
        fetchAppointmentDetails();
      } else {
        showErrorAlert('Gửi đánh giá cuộc tư vấn thất bại!');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      showErrorAlert('Gửi đánh giá cuộc tư vấn thất bại!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackButton = () => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      navigate('/profile');
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!appointment) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">Không tìm thấy thông tin cuộc hẹn.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 2, boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 600, color: '#0056b3' }}>
          Đánh giá cuộc tư vấn
        </Typography>

        <Box sx={{ mt: 3, mb: 3 }}>
          <Typography variant="body1" sx={{ 
            fontStyle: appointment.review ? 'italic' : 'normal',
            color: appointment.review ? 'text.secondary' : 'error.main',
            mb: 2
          }}>
            {appointment.review 
              ? "Bạn đã đánh giá cuộc họp này rồi, không thể đánh giá lại!" 
              : "Bạn chỉ có thể đánh giá cuộc họp này một lần duy nhất!"}
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmitReview} noValidate sx={{ mt: 1 }}>
          <Box sx={{ mb: 3 }}>
            <Typography component="legend" sx={{ mb: 1 }}>Đánh giá của bạn (0-5 sao)</Typography>
            <Rating
              name="rating"
              value={rating}
              precision={1}
              onChange={(event, newValue) => {
                setRating(newValue);
              }}
              size="large"
              max={5}
              disabled={appointment.review}
            />
          </Box>

          <TextField
            margin="normal"
            required
            fullWidth
            id="review"
            label="Nhận xét của bạn"
            name="review"
            autoComplete="off"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            multiline
            rows={4}
            disabled={appointment.review}
          />

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', height: '40px' }}>
            <Button
              variant="outlined"
              onClick={handleBackButton}
              sx={{ width: '150px', fontWeight: 600 }}
            >
              Quay lại
            </Button>

            {!appointment.review && (
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={submitting}
                sx={{ width: '150px', fontWeight: 600 }}
              >
                {submitting ? <CircularProgress size={24} /> : 'Gửi đánh giá'}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default AppointmentReview; 