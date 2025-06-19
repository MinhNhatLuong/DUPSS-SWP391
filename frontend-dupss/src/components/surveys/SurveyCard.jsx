import React from 'react';
import { Card, CardContent, CardMedia, CardActions, Button, Box, Typography, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const SurveyCard = ({ survey }) => {
  const navigate = useNavigate();

  const handleStartSurvey = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate(`/surveys/${survey.surveyId}`);
  };

  return (
    <Card sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', md: 'row' }, 
      height: 'auto',
      minHeight: { md: 400 },
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)'
      }
    }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        width: { xs: '100%', md: '50%' },
        height: '100%'
      }}>
        <CardContent sx={{ 
          flex: '1 0 auto', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between', 
          height: '100%' 
        }}>
          <div>
            <Typography component="h5" variant="h5" gutterBottom fontWeight="bold">
              {survey.surveyTitle}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ 
              overflow: 'visible',
              '& h3': { 
                fontSize: '1.2rem', 
                fontWeight: 'bold', 
                mt: 2, 
                mb: 1,
                color: 'text.primary' 
              },
              '& ul': { 
                pl: 0 
              },
              '& p': { 
                mb: 1.5 
              }
            }}>
              <Typography 
                variant="body1" 
                color="text.secondary" 
                component="div"
                dangerouslySetInnerHTML={{ __html: survey.description }} 
              />
            </Box>
          </div>
          <CardActions>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleStartSurvey}
              sx={{ mt: 2, fontWeight: 'bold' }}
            >
              Làm bài khảo sát
            </Button>
          </CardActions>
        </CardContent>
      </Box>
      <CardMedia
        component="img"
        sx={{ 
          width: { xs: '100%', md: '50%' },
          height: { xs: 200, md: 'auto' },
          objectFit: 'cover'
        }}
        image={survey.surveyImage}
        alt={survey.surveyTitle}
      />
    </Card>
  );
};

export default SurveyCard; 