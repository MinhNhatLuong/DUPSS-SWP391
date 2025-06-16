import { Box } from '@mui/material';
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
  return (
    <Box sx={{ mb: 5 }}>
      <ContentWrapper dangerouslySetInnerHTML={{ __html: content }} />
    </Box>
  );
};

export default BlogContent; 