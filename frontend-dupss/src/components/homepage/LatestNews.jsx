import { Box, Typography, Container, Grid, Card, CardMedia, CardContent, Button, Chip, styled } from '@mui/material';

const SectionTitle = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  fontSize: '2rem',
  marginBottom: '40px',
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
}));

const NewsCard = styled(Card)(({ theme, featured }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s, box-shadow 0.3s',
  borderRadius: '8px',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
  }
}));

const NewsImage = styled(CardMedia)(({ theme }) => ({
  height: '200px',
  width: '100%',
  transition: 'transform 0.3s',
  '&:hover': {
    transform: 'scale(1.05)',
  }
}));

const FeaturedNewsImage = styled(CardMedia)(({ theme }) => ({
  height: '250px',
  width: '100%',
  transition: 'transform 0.3s',
  '&:hover': {
    transform: 'scale(1.05)',
  }
}));

const NewsTag = styled(Chip)(({ theme }) => ({
  backgroundColor: '#0056b3',
  color: 'white',
  fontWeight: 500,
  marginBottom: '10px',
  borderRadius: '4px',
  textTransform: 'uppercase',
  fontSize: '0.75rem',
}));

const NewsTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.2rem',
  fontWeight: 600,
  marginBottom: '10px',
  color: '#333',
}));

const ReadMoreButton = styled(Button)(({ theme }) => ({
  color: '#0056b3',
  padding: 0,
  marginTop: '10px',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: 'transparent',
    textDecoration: 'underline',
  }
}));

const ViewAllButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#0056b3',
  color: 'white',
  padding: '10px 20px',
  margin: '20px auto 0',
  display: 'block',
  borderRadius: '4px',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#003d82',
  }
}));

// Mock data for the news cards
const newsData = [
  {
    id: 1,
    title: 'Nghiên cứu mới về tác động của ma túy đối với thanh thiếu niên',
    description: 'Các nhà nghiên cứu đã phát hiện ra những tác động lâu dài của việc sử dụng ma túy đối với sự phát triển não bộ ở thanh thiếu niên...',
    image: 'https://static.scientificamerican.com/sciam/cache/file/BC2412FA-1388-43B7-877759A80E201C16_source.jpg',
    tag: 'Nổi bật',
    featured: true,
  },
  {
    id: 2,
    title: 'Chương trình giáo dục phòng chống ma túy tại trường học',
    description: 'Triển khai chương trình giáo dục phòng chống ma túy tại các trường học trên toàn quốc...',
    image: 'https://static.scientificamerican.com/sciam/cache/file/BC2412FA-1388-43B7-877759A80E201C16_source.jpg',
    tag: 'Giáo dục',
  },
  {
    id: 3,
    title: 'Hoạt động tình nguyện phòng chống ma túy tại cộng đồng',
    description: 'Các hoạt động tình nguyện phòng chống ma túy đang được triển khai rộng rãi tại nhiều địa phương...',
    image: 'https://static.scientificamerican.com/sciam/cache/file/BC2412FA-1388-43B7-877759A80E201C16_source.jpg',
    tag: 'Cộng đồng',
  },
  {
    id: 4,
    title: 'Phương pháp mới trong điều trị nghiện ma túy',
    description: 'Các nhà khoa học đã phát triển phương pháp mới giúp điều trị hiệu quả tình trạng nghiện ma túy...',
    image: 'https://static.scientificamerican.com/sciam/cache/file/BC2412FA-1388-43B7-877759A80E201C16_source.jpg',
    tag: 'Nghiên cứu',
  },
];

const LatestNews = () => {
  // Separate featured news from regular news
  const featuredNews = newsData.find(news => news.featured);
  const regularNews = newsData.filter(news => !news.featured);

  return (
    <Box sx={{ py: 6 }}>
      <Container maxWidth="lg">
        <SectionTitle variant="h2">Tin tức & Cập nhật mới nhất</SectionTitle>
        
        <Grid container spacing={3}>
          {/* Featured News */}
          {featuredNews && (
            <Grid item xs={12}>
              <NewsCard className="featured-card">
                <Grid container>
                  <Grid item xs={12} md={5} className="featured-image" sx={{ overflow: 'hidden' }}>
                    <FeaturedNewsImage
                      image={featuredNews.image}
                      title={featuredNews.title}
                    />
                  </Grid>
                  <Grid item xs={12} md={7} className="featured-content">
                    <CardContent sx={{ p: 3 }}>
                      <NewsTag label={featuredNews.tag} />
                      <NewsTitle variant="h3">{featuredNews.title}</NewsTitle>
                      <Typography variant="body2" sx={{ color: '#666' }}>{featuredNews.description}</Typography>
                      <ReadMoreButton href="/article-education-program">Đọc tiếp</ReadMoreButton>
                    </CardContent>
                  </Grid>
                </Grid>
              </NewsCard>
            </Grid>
          )}
          
          {/* Regular News Grid */}
          {regularNews.map((news, index) => (
            <Grid item xs={12} sm={6} md={4} key={news.id}>
              <NewsCard>
                <Box sx={{ overflow: 'hidden' }}>
                  <NewsImage 
                    image={news.image}
                    title={news.title}
                  />
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <NewsTag label={news.tag} />
                  <NewsTitle variant="h3">{news.title}</NewsTitle>
                  <Typography variant="body2" sx={{ color: '#666' }}>{news.description}</Typography>
                  <ReadMoreButton href="/article-education-program">Đọc tiếp</ReadMoreButton>
                </CardContent>
              </NewsCard>
            </Grid>
          ))}
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <ViewAllButton href="/blogs">Xem tất cả tin tức</ViewAllButton>
        </Box>
      </Container>
    </Box>
  );
};

export default LatestNews; 