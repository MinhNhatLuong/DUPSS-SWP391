import { Box, Typography, Paper, Avatar, Stack, Link } from '@mui/material';
import { Facebook, Twitter, LinkedIn } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const SocialLink = styled(Link)(({ theme }) => ({
  display: 'inline-flex',
  width: 35,
  height: 35,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#eee',
  borderRadius: '50%',
  marginRight: 10,
  color: '#333',
  transition: 'background-color 0.3s',
  '&:hover': {
    backgroundColor: '#0056b3',
    color: 'white',
  }
}));

const AuthorBio = ({ name, image, description }) => {
  return (
    <Paper 
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'center', sm: 'flex-start' },
        backgroundColor: '#f8f9fa',
        padding: 3,
        borderRadius: 2,
        marginBottom: 5,
        textAlign: { xs: 'center', sm: 'left' }
      }}
    >
      <Avatar
        src={image}
        alt={name}
        sx={{ 
          width: 100, 
          height: 100,
          marginRight: { xs: 0, sm: 3 },
          marginBottom: { xs: 2, sm: 0 },
        }}
      />
      
      <Box>
        <Typography 
          variant="h5" 
          component="h3" 
          gutterBottom 
          sx={{ color: '#333', fontWeight: 500 }}
        >
          {name}
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          paragraph
          sx={{ mb: 1.5 }}
        >
          {description}
        </Typography>
        
        <Stack direction="row" spacing={1}>
          <SocialLink href="#" aria-label="Facebook">
            <Facebook fontSize="small" />
          </SocialLink>
          <SocialLink href="#" aria-label="Twitter">
            <Twitter fontSize="small" />
          </SocialLink>
          <SocialLink href="#" aria-label="LinkedIn">
            <LinkedIn fontSize="small" />
          </SocialLink>
        </Stack>
      </Box>
    </Paper>
  );
};

export default AuthorBio; 