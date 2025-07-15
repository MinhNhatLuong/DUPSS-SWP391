import { Typography, Box, IconButton, Grid } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';

const Contact = () => {
  return (
    <section>
      <Typography 
        variant="h2" 
        component="h2" 
        sx={{ 
          fontSize: '1.8rem',
          mb: 3,
          color: '#0056b3',
          borderBottom: '2px solid #e9f5ff',
          pb: 1,
          fontWeight: 'bold'
        }}
      >
        Liên hệ với chúng tôi
      </Typography>
      
      <Box 
        sx={{ 
          bgcolor: '#f8f9fa', 
          borderRadius: '8px', 
          p: 3, 
          boxShadow: '0 3px 10px rgba(0, 0, 0, 0.05)' 
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
            <LocationOnIcon sx={{ color: '#0056b3', fontSize: '1.2rem', mr: 2, mt: 0.5 }} />
            <Typography variant="body1">
              123 Đường Nguyễn Tấn Dũng, Quận Nguyễn Thành Đạt, TP. Lương Gia Lâm
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
            <PhoneIcon sx={{ color: '#0056b3', fontSize: '1.2rem', mr: 2, mt: 0.5 }} />
            <Typography variant="body1">
              (84) 123-456-789
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <EmailIcon sx={{ color: '#0056b3', fontSize: '1.2rem', mr: 2, mt: 0.5 }} />
            <Typography variant="body1">
              info@dupss.org
            </Typography>
          </Box>
        </Box>
        
        <Grid 
          container 
          spacing={2} 
          justifyContent="center" 
          sx={{ mt: 3 }}
        >
          <Grid item>
            <IconButton
              aria-label="facebook"
              component="a"
              href="#"
              sx={{
                bgcolor: '#0056b3',
                color: 'white',
                width: '40px',
                height: '40px',
                '&:hover': { bgcolor: '#003d82', transform: 'translateY(-3px)' },
                transition: 'background-color 0.3s ease, transform 0.3s ease'
              }}
            >
              <FacebookIcon fontSize="small" />
            </IconButton>
          </Grid>
          
          <Grid item>
            <IconButton
              aria-label="twitter"
              component="a"
              href="#"
              sx={{
                bgcolor: '#0056b3',
                color: 'white',
                width: '40px',
                height: '40px',
                '&:hover': { bgcolor: '#003d82', transform: 'translateY(-3px)' },
                transition: 'background-color 0.3s ease, transform 0.3s ease'
              }}
            >
              <TwitterIcon fontSize="small" />
            </IconButton>
          </Grid>
          
          <Grid item>
            <IconButton
              aria-label="instagram"
              component="a"
              href="#"
              sx={{
                bgcolor: '#0056b3',
                color: 'white',
                width: '40px',
                height: '40px',
                '&:hover': { bgcolor: '#003d82', transform: 'translateY(-3px)' },
                transition: 'background-color 0.3s ease, transform 0.3s ease'
              }}
            >
              <InstagramIcon fontSize="small" />
            </IconButton>
          </Grid>
          
          <Grid item>
            <IconButton
              aria-label="youtube"
              component="a"
              href="#"
              sx={{
                bgcolor: '#0056b3',
                color: 'white',
                width: '40px',
                height: '40px',
                '&:hover': { bgcolor: '#003d82', transform: 'translateY(-3px)' },
                transition: 'background-color 0.3s ease, transform 0.3s ease'
              }}
            >
              <YouTubeIcon fontSize="small" />
            </IconButton>
          </Grid>
        </Grid>
      </Box>
    </section>
  );
};

export default Contact; 