import { Box, Link, Chip, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';

const ContentWrapper = styled(Box)(({ theme }) => ({
  '& p': {
    marginBottom: '20px',
    lineHeight: 1.8,
  },
  '& .article-intro': {
    fontSize: '1.2rem',
    color: '#555',
    marginBottom: '30px',
    fontWeight: 500,
  },
  '& h2': {
    fontSize: '1.8rem',
    margin: '40px 0 20px',
    color: '#0056b3',
  },
  '& blockquote': {
    borderLeft: '4px solid #0056b3',
    padding: '20px',
    backgroundColor: '#f5f5f5',
    margin: '30px 0',
    fontStyle: 'italic',
    color: '#555',
  },
  '& ul.article-list': {
    margin: '20px 0 30px 20px',
    paddingLeft: '20px',
  },
  '& ul.article-list li': {
    marginBottom: '15px',
    position: 'relative',
  },
  '& ul.article-list li strong': {
    color: '#333',
  },
  '& .article-tags': {
    marginTop: '40px',
    paddingTop: '20px',
    borderTop: '1px solid #eee',
  },
  '& .article-share': {
    marginTop: '20px',
  },
  [theme.breakpoints.down('sm')]: {
    '& h2': {
      fontSize: '1.5rem',
    },
  },
}));

const BlogContent = ({ content }) => {
  // Tags for this blog post
  const tags = ['Giáo dục', 'Phòng chống ma túy', 'Trường học', 'Thanh thiếu niên'];

  return (
    <Box sx={{ mb: 5 }}>
      <ContentWrapper dangerouslySetInnerHTML={{ __html: content }} />
      
      <Box sx={{ 
        mt: 5, 
        pt: 2, 
        borderTop: '1px solid #eee',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 2
      }}>
        <Box component="span" fontWeight="600" mr={1}>
          Tags:
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {tags.map((tag, index) => (
            <Chip
              key={index}
              label={tag}
              component={Link}
              href="#"
              clickable
              sx={{ 
                bgcolor: '#f0f7ff', 
                color: '#0056b3',
                '&:hover': {
                  bgcolor: '#0056b3',
                  color: 'white'
                }
              }}
            />
          ))}
        </Stack>
      </Box>
      
      <Box sx={{ 
        mt: 2, 
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 2
      }}>
        <Box component="span" fontWeight="600" mr={1}>
          Chia sẻ:
        </Box>
        <Stack direction="row" spacing={1}>
          {['facebook', 'twitter', 'linkedin', 'email'].map((platform, index) => (
            <Link
              key={index}
              href="#"
              sx={{
                display: 'inline-flex',
                width: 40,
                height: 40,
                borderRadius: '50%',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                bgcolor: getShareColor(platform),
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-3px)'
                }
              }}
            >
              <i className={`fab fa-${platform === 'email' ? 'envelope' : platform}`}></i>
            </Link>
          ))}
        </Stack>
      </Box>
    </Box>
  );
};

const getShareColor = (platform) => {
  switch (platform) {
    case 'facebook':
      return '#3b5998';
    case 'twitter':
      return '#1da1f2';
    case 'linkedin':
      return '#0077b5';
    case 'email':
      return '#ea4335';
    default:
      return '#333';
  }
};

export default BlogContent; 