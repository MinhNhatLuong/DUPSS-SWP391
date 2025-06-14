import { useState, useEffect } from 'react';
import { Container, Typography, Grid, Box, Chip, TextField, MenuItem, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { RelatedArticles } from './index';

// Sample blogs data
const fakeBlogs = [
  {
    id: "education-program",
    title: "Chương trình giáo dục phòng chống ma túy tại trường học",
    thumbnail: "http://thptnguyendu.hatinh.edu.vn/upload/58158/fck/42000708/2024_08_29_15_23_594.jpg",
    shortDescription: "Triển khai chương trình giáo dục phòng chống ma túy tại các trường học trên toàn quốc đang là một trong những ưu tiên hàng đầu của Bộ Giáo dục và Đào tạo nhằm nâng cao nhận thức và kỹ năng phòng tránh ma túy cho học sinh, sinh viên.",
    tag: "Giáo dục",
    createdDate: "15/11/2023"
  },
  {
    id: "drug-prevention-methods",
    title: "Phương pháp mới trong điều trị nghiện ma túy",
    thumbnail: "https://static.scientificamerican.com/sciam/cache/file/BC2412FA-1388-43B7-877759A80E201C16_source.jpg",
    shortDescription: "Các nhà khoa học đã phát triển phương pháp mới giúp điều trị hiệu quả tình trạng nghiện ma túy...",
    tag: "Nghiên cứu",
    createdDate: "10/11/2023"
  },
  {
    id: "community-activities",
    title: "Hoạt động tình nguyện phòng chống ma túy tại cộng đồng",
    thumbnail: "https://static.scientificamerican.com/sciam/cache/file/BC2412FA-1388-43B7-877759A80E201C16_source.jpg",
    shortDescription: "Các hoạt động tình nguyện phòng chống ma túy đang được triển khai rộng rãi tại nhiều địa phương...",
    tag: "Cộng đồng",
    createdDate: "05/11/2023"
  },
  {
    id: "saying-no-skills",
    title: "Kỹ năng từ chối ma túy cho thanh thiếu niên",
    thumbnail: "https://static.scientificamerican.com/sciam/cache/file/BC2412FA-1388-43B7-877759A80E201C16_source.jpg",
    shortDescription: "Làm thế nào để thanh thiếu niên có thể tự tin từ chối khi bị dụ dỗ sử dụng ma túy?",
    tag: "Giáo dục",
    createdDate: "01/11/2023"
  },
  {
    id: "health-impacts",
    title: "Tác động của ma túy đối với sức khỏe tâm thần",
    thumbnail: "https://static.scientificamerican.com/sciam/cache/file/BC2412FA-1388-43B7-877759A80E201C16_source.jpg",
    shortDescription: "Tìm hiểu về tác động lâu dài của các loại ma túy đối với sức khỏe tâm thần và các giải pháp hỗ trợ...",
    tag: "Y tế",
    createdDate: "28/10/2023"
  },
  {
    id: "law-enforcement",
    title: "Những thay đổi mới trong chính sách phòng chống ma túy",
    thumbnail: "https://static.scientificamerican.com/sciam/cache/file/BC2412FA-1388-43B7-877759A80E201C16_source.jpg",
    shortDescription: "Cập nhật về những thay đổi quan trọng trong chính sách và pháp luật phòng chống ma túy...",
    tag: "Chính sách",
    createdDate: "22/10/2023"
  },
];

const categories = [
  { value: 'all', label: 'Tất cả' },
  { value: 'Giáo dục', label: 'Giáo dục' },
  { value: 'Nghiên cứu', label: 'Nghiên cứu' },
  { value: 'Cộng đồng', label: 'Cộng đồng' },
  { value: 'Y tế', label: 'Y tế' },
  { value: 'Chính sách', label: 'Chính sách' },
];

const FilterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(4),
  flexDirection: 'column',
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
    alignItems: 'center',
  }
}));

const BlogsList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    document.title = "Blogs & Thông Tin - DUPSS";
    
    // In a real application, we would fetch the blogs from an API
    // For now, we'll use the fake data
    setTimeout(() => {
      setBlogs(fakeBlogs);
      setLoading(false);
    }, 500); // Simulate loading time
  }, []);

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         blog.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = category === 'all' || blog.tag === category;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 8, px: { xs: 1, sm: 2, md: 3 } }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom
        sx={{ 
          mb: 4, 
          textAlign: 'center',
          fontWeight: 600
        }}
      >
        Blogs & Thông tin
      </Typography>

      <FilterContainer>
        <TextField
          label="Tìm kiếm"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        
        <TextField
          select
          label="Chủ đề"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          variant="outlined"
          sx={{ minWidth: 200 }}
        >
          {categories.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </FilterContainer>
      
      {filteredBlogs.length > 0 ? (
        <Box sx={{ mx: -1 }}>
          <RelatedArticles articles={filteredBlogs} />
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', my: 5 }}>
          <Typography>Không tìm thấy bài viết nào phù hợp với tiêu chí tìm kiếm</Typography>
        </Box>
      )}
    </Container>
  );
};

export default BlogsList; 