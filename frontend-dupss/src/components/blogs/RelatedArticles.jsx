import { Box, Typography, Grid, Card, CardMedia, CardContent, Chip, Link } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';

const ArticleCard = styled(Card)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s',
  height: '100%',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: 'translateY(-5px)',
  }
}));

const ArticleImage = styled('div')({
  height: '220px',
  width: '100%',
  overflow: 'hidden',
  position: 'relative',
});

const StyledCardMedia = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  objectPosition: 'center',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  }
});

const ArticleChip = styled(Chip)(({ theme }) => ({
  backgroundColor: '#e9f5ff',
  color: '#0056b3',
  marginBottom: theme.spacing(1),
  fontSize: '0.8rem',
  width: 'fit-content',
  display: 'inline-flex',
}));

const ReadMoreLink = styled(RouterLink)(({ theme }) => ({
  color: '#0056b3',
  fontWeight: 500,
  display: 'inline-flex',
  alignItems: 'center',
  textDecoration: 'none',
  '& svg': {
    marginLeft: theme.spacing(0.5),
    transition: 'transform 0.3s',
  },
  '&:hover svg': {
    transform: 'translateX(3px)',
  }
}));

const GridWrapper = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '16px',
  '@media (max-width: 900px)': {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  '@media (max-width: 600px)': {
    gridTemplateColumns: '1fr',
  }
});

const RelatedArticles = ({ articles }) => {
  return (
    <Box sx={{ mt: 6, mb: 3 }}>
      <Typography 
        variant="h5" 
        component="h3" 
        gutterBottom
        sx={{ 
          color: '#333', 
          textAlign: 'center',
          mb: 3
        }}
      >
        Bài viết liên quan
      </Typography>
      
      <GridWrapper>
        {articles.map((article) => (
          <ArticleCard key={article.id}>
            <ArticleImage>
              <StyledCardMedia
                src={article.thumbnail}
                alt={article.title}
                loading="lazy"
              />
            </ArticleImage>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
              <ArticleChip label={article.tag} size="small" />
              
              <Typography 
                variant="h6" 
                component="h4" 
                gutterBottom
                sx={{ 
                  fontSize: '1rem', 
                  lineHeight: 1.4,
                  mb: 1,
                  fontWeight: 'bold',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}
              >
                {article.title}
              </Typography>
              
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  mb: 2, 
                  flexGrow: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical'
                }}
              >
                {article.shortDescription}
              </Typography>
              
              <ReadMoreLink to={`/blogs/${article.id}`}>
                Đọc tiếp <ArrowForward fontSize="small" />
              </ReadMoreLink>
            </CardContent>
          </ArticleCard>
        ))}
      </GridWrapper>
    </Box>
  );
};

export default RelatedArticles; 