import { Box, Typography, Container } from '@mui/material';
import CoreValues from './CoreValues';
import MissionVision from './MissionVision';
import History from './History';
import LeadershipTeam from './LeadershipTeam';
import Partners from './Partners';
import Contact from './Contact';
import { useEffect } from 'react';

const AboutUs = () => {
  useEffect(() => {
    document.title = "Về Chúng Tôi - DUPSS";
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      {/* Header Section */}
      <Box sx={{ mb: 5, textAlign: 'center' }}>
        <Typography variant="h1" component="h1" sx={{ fontSize: '2.5rem', mb: 1, color: '#333' }}>
          Về DUPSS
        </Typography>
        <Typography variant="subtitle1" sx={{ fontSize: '1.2rem', color: '#666', mb: 5 }}>
          Dự án Phòng ngừa Sử dụng Ma túy trong Cộng đồng
        </Typography>

        {/* Featured Image */}
        <Box sx={{ mb: 4, position: 'relative' }}>
          <img 
            src="https://static.scientificamerican.com/sciam/cache/file/BC2412FA-1388-43B7-877759A80E201C16_source.jpg" 
            alt="DUPSS Team" 
            style={{ 
              width: '100%', 
              borderRadius: '8px',
              boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)'  
            }} 
          />
          <Typography 
            variant="caption" 
            component="p"
            sx={{ 
              textAlign: 'center', 
              color: '#666', 
              mt: 1, 
              fontStyle: 'italic',
              fontSize: '0.9rem'
            }}
          >
            Đội ngũ DUPSS trong một buổi tuyên truyền tại cộng đồng
          </Typography>
        </Box>
      </Box>

      {/* Main Content */}
      <Box>
        {/* Mission and Vision Sections */}
        <MissionVision />
        
        {/* Core Values Section */}
        <Box sx={{ mt: 5 }}>
          <CoreValues />
        </Box>
        
        {/* History Section */}
        <Box sx={{ mt: 5 }}>
          <History />
        </Box>
        
        {/* Leadership Team Section */}
        <Box sx={{ mt: 5 }}>
          <LeadershipTeam />
        </Box>
        
        {/* Partners Section */}
        <Box sx={{ mt: 5 }}>
          <Partners />
        </Box>
        
        {/* Contact Section */}
        <Box sx={{ mt: 5 }}>
          <Contact />
        </Box>
      </Box>
    </Container>
  );
};

export default AboutUs; 