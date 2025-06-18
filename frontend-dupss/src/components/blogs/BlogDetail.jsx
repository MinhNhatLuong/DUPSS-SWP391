import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, Fade, Divider } from '@mui/material';
import axios from 'axios';
import BlogHeader from './BlogHeader';
import BlogContent from './BlogContent';
import RelatedArticles from './RelatedArticles';

const BlogDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const [blog, setBlog] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);

  const fetchBlogData = async (blogId) => {
    // Set content invisible first, but don't show loading state immediately
    setContentVisible(false);
    
    // Delay setting the loading state to avoid flickering
    const loadingTimer = setTimeout(() => {
      if (!contentVisible) {
        setLoading(true);
      }
    }, 300);
    
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      const response = await axios.get(`http://localhost:8080/api/public/blog/${blogId}`);
      setBlog({
        id: response.data.id,
        title: response.data.title,
        tag: response.data.topic,
        createdDate: response.data.createdAt,
        thumbnail: response.data.imageUrls[0],
        blogContent: response.data.content,
        authorName: response.data.authorName
      });
      
      // Fetch related articles
      const relatedResponse = await axios.get('http://localhost:8080/api/public/blogs/latest');
      setRelatedArticles(relatedResponse.data.map(article => ({
        id: article.id,
        title: article.title,
        coverImage: article.coverImage,
        summary: article.summary,
        topic: article.topic
      })));
      
      // Cancel the loading timer
      clearTimeout(loadingTimer);
      setLoading(false);
      
      // Show content after a short delay for smooth transition
      setTimeout(() => {
        setContentVisible(true);
      }, 100);
    } catch (error) {
      clearTimeout(loadingTimer);
      console.error('Error fetching blog data:', error);
      setLoading(false);
      setContentVisible(true);
    }
  };

  useEffect(() => {
    // Set a default loading title
    document.title = "Đang tải bài viết... - DUPSS";
    
    fetchBlogData(id);
    
    // Cleanup function
    return () => {
      setContentVisible(false);
    };
  }, [id, location.pathname]);
  
  // Update title when blog data is loaded
  useEffect(() => {
    if (blog) {
      document.title = `${blog.title} - DUPSS`;
    }
  }, [blog]);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        my: 15,
        flexDirection: 'column'
      }}>
        <CircularProgress size={40} thickness={4} />
        <Typography sx={{ mt: 2 }}>Đang tải...</Typography>
      </Box>
    );
  }

  if (!blog) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
        <Typography>Không tìm thấy bài viết</Typography>
      </Box>
    );
  }

  return (
    <Fade in={contentVisible} timeout={500}>
      <Container maxWidth="lg" sx={{ mt: 5, mb: 8, px: { xs: 1, sm: 2, md: 3 } }}>
        <BlogHeader 
          title={blog.title}
          tag={blog.tag}
          date={blog.createdDate}
          author={blog.authorName}
          thumbnail={blog.thumbnail}
        />
        
        <BlogContent content={blog.blogContent} />
        
        <Box sx={{ mt: 6, mb: 4 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography 
            variant="h4" 
            fontWeight="700" 
            sx={{ 
              mb: 2, 
              color: '#0056b3', 
              textAlign: 'center'
            }}
          >
            Các bài blog khác
          </Typography>
        </Box>
        
        <Box sx={{ mx: -1 }}>
          <RelatedArticles articles={relatedArticles} />
        </Box>
      </Container>
    </Fade>
  );
};

export default BlogDetail; 