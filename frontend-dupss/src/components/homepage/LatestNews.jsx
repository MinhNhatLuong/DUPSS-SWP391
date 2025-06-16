import { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Card, CardContent, Chip } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';

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
  height: '200px',
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

const ReadMoreLink = styled(Link)(({ theme }) => ({
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
  gap: '30px',
  '@media (max-width: 1024px)': {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  '@media (max-width: 768px)': {
    gridTemplateColumns: '1fr',
  }
});

const LatestNews = () => {
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get('/api/public/blogs/latest');
        setNewsData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching news:', error);
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <section className="latest-news">
      <Box sx={{ maxWidth: '1200px', mx: 'auto', py: 6, px: { xs: 2, sm: 3, md: 4 } }}>
        <Typography 
          variant="h4" 
          component="h2" 
          sx={{ 
            textAlign: 'center', 
            mb: 5,
            fontWeight: 600,
            color: '#0056b3',
            position: 'relative',
            '&::after': {
              content: '""',
              display: 'block',
              width: '50px',
              height: '3px',
              backgroundColor: '#0056b3',
              margin: '15px auto 0',
            }
          }}
        >
          Tin tức & Cập nhật mới nhất
        </Typography>
        
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography>Đang tải...</Typography>
          </Box>
        ) : (
          <GridWrapper>
            {newsData.map(news => (
              <ArticleCard key={news.id}>
                <ArticleImage>
                  <StyledCardMedia
                    src={news.coverImage || 'https://via.placeholder.com/300x200'}
                    alt={news.title}
                    loading="lazy"
                  />
                </ArticleImage>
                <CardContent sx={{ 
                  flexGrow: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  p: 2.5
                }}>
                  <ArticleChip label={news.topic} size="small" />
                  
                  <Typography 
                    variant="h6" 
                    component="h3" 
                    sx={{ 
                      fontSize: '1.2rem',
                      lineHeight: 1.4,
                      mb: 1.25,
                      fontWeight: 'bold',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {news.title}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      mb: 2, 
                      flexGrow: 1,
                      color: '#666',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {news.summary}
                  </Typography>
                  
                  <ReadMoreLink to={`/blogs/${news.id}`}>
                    Đọc tiếp <ArrowForward fontSize="small" />
                  </ReadMoreLink>
                </CardContent>
              </ArticleCard>
            ))}
          </GridWrapper>
        )}
        
        <Box sx={{ 
          textAlign: 'center', 
          mt: 5
        }}>
          <ReadMoreLink to="/blogs" 
            sx={{
              display: 'inline-block',
              padding: '10px 25px',
              backgroundColor: 'transparent',
              color: '#0056b3',
              border: '1px solid #0056b3',
              borderRadius: '4px',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: '#0056b3',
                color: 'white'
              }
            }}
          >
            Xem tất cả tin tức <ArrowForward fontSize="small" />
          </ReadMoreLink>
        </Box>
      </Box>
    </section>
  );
};

export default LatestNews;