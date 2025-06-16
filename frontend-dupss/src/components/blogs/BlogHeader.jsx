import { Box, Typography, Paper, Chip, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import { CalendarToday, Person } from '@mui/icons-material';

const FeaturedImage = styled('img')({
  width: '100%',
  borderRadius: '8px',
  boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
  marginBottom: '16px',
});

const ImageCaption = styled(Typography)({
  textAlign: 'center',
  color: '#666',
  fontSize: '0.9rem',
  marginTop: '8px',
  fontStyle: 'italic',
});

const BlogHeader = ({ title, tag, date, author, thumbnail }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Chip 
          label={tag} 
          color="primary" 
          variant="outlined" 
          sx={{ mb: 2, bgcolor: '#e9f5ff', color: '#0056b3', borderColor: '#0056b3' }} 
        />
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            mb: 2, 
            fontWeight: 600,
            color: '#333',
            lineHeight: 1.3
          }}
        >
          {title}
        </Typography>
        <Stack 
          direction="row" 
          spacing={3} 
          justifyContent="center" 
          alignItems="center"
          sx={{ color: '#666' }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <CalendarToday fontSize="small" />
            <Typography variant="body2">{date}</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Person fontSize="small" />
            <Typography variant="body2">{author}</Typography>
          </Stack>
        </Stack>
      </Box>
      
      <Paper elevation={0} sx={{ mb: 4, overflow: 'hidden', bgcolor: 'transparent' }}>
        <FeaturedImage 
          src={thumbnail} 
          alt={title} 
        />
      </Paper>
    </Box>
  );
};

export default BlogHeader; 