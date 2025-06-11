import { useState, useEffect } from 'react';
import { Box, Typography, Container, Card, CardMedia, CardContent, CardActions, 
         Button, Chip, Rating, TextField, MenuItem, InputAdornment } from '@mui/material';
import { Link } from 'react-router-dom';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { styled } from '@mui/material/styles';

// Mock data for courses
const mockCourses = [
  {
    id: 9,
    topicName: "Nhận thức",
    title: "Nhận thức về tác hại của ma túy đối với sức khỏe và xã hội",
    description: "Khóa học giúp người học hiểu rõ về tác hại của ma túy đối với sức khỏe cá nhân, gia đình và những hệ lụy xã hội.",
    targetAudience: "Học Sinh",
    coverImage: "https://res.cloudinary.com/dxkvlbzzu/image/upload/v1749404874/upload/file_ciwtlv.jpg",
    content: "",
    duration: 300,
    createdAt: "2025-06-09T00:47:54.695877",
    updatedAt: null,
    creator: {
      email: "laml33366@gmail.com",
      fullName: "Lương Gia Lâm",
      avatar: null,
      role: "ROLE_MANAGER"
    },
    modules: [
      {
        id: 9,
        title: "Nhận diện các chất ma túy phổ biến",
        content: "Phân biệt thuốc lắc, cần sa, heroin qua hình ảnh",
        videoUrl: [
          {
            videoTitle: "01.Bài 1",
            url: "https://www.youtube.com/watch?v=a_frdvO7f44"
          },
          {
            videoTitle: "02.Bài 2",
            url: "https://www.youtube.com/watch?v=zBZm0gXJF2E"
          }
        ],
        duration: 30,
        orderIndex: 1,
        createdAt: "2025-06-09T00:47:54.724879",
        updatedAt: null
      },
      {
        id: 10,
        title: "Tình huống xử lý khi bị rủ rê",
        content: "Cách từ chối và tìm kiếm giúp đỡ từ người lớn",
        videoUrl: [
          {
            videoTitle: "03.Bài 3",
            url: "https://www.youtube.com/watch?v=FSyB-coD7EM"
          }
        ],
        duration: 60,
        orderIndex: 2,
        createdAt: "2025-06-09T00:47:54.729983",
        updatedAt: null
      }
    ],
    enrollmentCount: 120,
    isEnrolled: false,
    active: true,
    level: "Trung cấp",
    instructor: "ThS. Trần Minh Hiếu",
    rating: 4
  },
  {
    id: 1,
    topicName: "Phòng ngừa",
    title: "Phòng ngừa sử dụng chất gây nghiện cho thanh thiếu niên",
    description: "Khóa học cung cấp kiến thức và kỹ năng cơ bản giúp thanh thiếu niên nhận biết và phòng tránh các chất gây nghiện phổ biến.",
    targetAudience: "Thanh thiếu niên",
    coverImage: "http://thptnguyendu.hatinh.edu.vn/upload/58158/fck/42000708/2024_08_29_15_23_594.jpg",
    content: "",
    duration: 240,
    creator: {
      email: "nguyenvana@gmail.com",
      fullName: "TS. Nguyễn Văn An",
      avatar: null,
      role: "ROLE_MANAGER"
    },
    modules: [],
    enrollmentCount: 320,
    isEnrolled: false,
    active: true,
    level: "Cơ bản",
    instructor: "TS. Nguyễn Văn An",
    rating: 4.5
  },
  {
    id: 2,
    topicName: "Kỹ năng",
    title: "Kỹ năng từ chối và đối phó với áp lực đồng trang lứa",
    description: "Khóa học trang bị cho học viên các kỹ năng từ chối hiệu quả và cách đối phó với áp lực từ bạn bè khi bị rủ rê sử dụng chất cấm.",
    targetAudience: "Học sinh THPT",
    coverImage: "http://thptnguyendu.hatinh.edu.vn/upload/58158/fck/42000708/2024_08_29_15_23_594.jpg",
    content: "",
    duration: 120,
    creator: {
      email: "lehong@gmail.com",
      fullName: "ThS. Lê Thị Hồng",
      avatar: null,
      role: "ROLE_MANAGER"
    },
    modules: [],
    enrollmentCount: 210,
    isEnrolled: true,
    active: true,
    level: "Cơ bản",
    instructor: "ThS. Lê Thị Hồng",
    rating: 5
  },
  {
    id: 3,
    topicName: "Hỗ trợ",
    title: "Kỹ năng hỗ trợ người thân đang gặp vấn đề với chất gây nghiện",
    description: "Khóa học dành cho người thân của người nghiện, cung cấp kiến thức và kỹ năng để hỗ trợ quá trình cai nghiện và phục hồi.",
    targetAudience: "Người lớn",
    coverImage: "http://thptnguyendu.hatinh.edu.vn/upload/58158/fck/42000708/2024_08_29_15_23_594.jpg",
    content: "",
    duration: 360,
    creator: {
      email: "phamvannam@gmail.com",
      fullName: "PGS.TS. Phạm Văn Nam",
      avatar: null,
      role: "ROLE_MANAGER"
    },
    modules: [],
    enrollmentCount: 65,
    isEnrolled: false,
    active: true,
    level: "Nâng cao",
    instructor: "PGS.TS. Phạm Văn Nam",
    rating: 3.5
  },
  {
    id: 4,
    topicName: "Giáo dục",
    title: "Phương pháp giáo dục phòng chống ma túy cho giáo viên và phụ huynh",
    description: "Khóa học cung cấp phương pháp và công cụ giáo dục hiệu quả về phòng chống ma túy dành cho giáo viên và phụ huynh.",
    targetAudience: "Giáo viên, Phụ huynh",
    coverImage: "http://thptnguyendu.hatinh.edu.vn/upload/58158/fck/42000708/2024_08_29_15_23_594.jpg",
    content: "",
    duration: 300,
    creator: {
      email: "vuminhtam@gmail.com",
      fullName: "TS. Vũ Thị Minh Tâm",
      avatar: null,
      role: "ROLE_MANAGER"
    },
    modules: [],
    enrollmentCount: 95,
    isEnrolled: false,
    active: true,
    level: "Trung cấp",
    instructor: "TS. Vũ Thị Minh Tâm",
    rating: 4
  },
  {
    id: 5,
    topicName: "Phòng ngừa",
    title: "Phòng ngừa tái nghiện: Chiến lược và kỹ thuật hiệu quả",
    description: "Khóa học chuyên sâu về các chiến lược và kỹ thuật phòng ngừa tái nghiện, dành cho người đã cai nghiện và nhân viên y tế.",
    targetAudience: "Nhân viên y tế, Người đã cai nghiện",
    coverImage: "http://thptnguyendu.hatinh.edu.vn/upload/58158/fck/42000708/2024_08_29_15_23_594.jpg",
    content: "",
    duration: 480,
    creator: {
      email: "nguyenvanbinh@gmail.com",
      fullName: "PGS.TS. Nguyễn Văn Bình",
      avatar: null,
      role: "ROLE_MANAGER"
    },
    modules: [],
    enrollmentCount: 130,
    isEnrolled: false,
    active: true,
    level: "Nâng cao",
    instructor: "PGS.TS. Nguyễn Văn Bình",
    rating: 4.5
  }
];

// List of topics for filtering
const categories = [
  { value: "all", label: "Tất cả" },
  { value: "Phòng ngừa", label: "Phòng ngừa" },
  { value: "Nhận thức", label: "Nhận thức" },
  { value: "Kỹ năng", label: "Kỹ năng" },
  { value: "Hỗ trợ", label: "Hỗ trợ" },
  { value: "Giáo dục", label: "Giáo dục" },
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

const GridWrapper = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '24px',
  '@media (max-width: 900px)': {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  '@media (max-width: 600px)': {
    gridTemplateColumns: '1fr',
  }
});

const CourseCard = styled(Card)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s, box-shadow 0.3s',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
  }
}));

function CoursesList() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");

  // Initialize courses on component mount
  useEffect(() => {
    document.title = "Khóa học - DUPSS";
    // In a real application, this would be an API call
    setTimeout(() => {
      setCourses(mockCourses);
      setFilteredCourses(mockCourses);
      setLoading(false);
    }, 500); // Simulate loading time
  }, []);

  // Filter courses when category or search query changes
  useEffect(() => {
    let result = [...courses];
    
    // Filter by category
    if (category !== "all") {
      result = result.filter(course => course.topicName === category);
    }
    
    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(course => 
        course.title.toLowerCase().includes(query) || 
        course.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredCourses(result);
  }, [category, searchQuery, courses]);

  // Format duration from minutes to weeks
  const formatDuration = (minutes) => {
    const weeks = Math.ceil(minutes / (7 * 24 * 60));
    return `${weeks} tuần`;
  };

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
        Khóa học
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
                <SearchIcon />
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

      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <GridWrapper>
          {filteredCourses.map((course) => (
            <CourseCard key={course.id}>
              <Box sx={{ position: 'relative', paddingTop: '56.25%', overflow: 'hidden' }}>
                <CardMedia
                  component="img"
                  image={course.coverImage}
                  alt={course.title}
                  sx={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.5s', 
                    '&:hover': { transform: 'scale(1.05)' } 
                  }}
                />
                <Chip
                  label={course.topicName}
                  color="primary"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    fontWeight: 500
                  }}
                />
                <Chip
                  icon={<AccessTimeIcon />}
                  label={formatDuration(course.duration)}
                  size="small"
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    left: 16,
                    bgcolor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    '& .MuiChip-icon': {
                      color: 'white'
                    }
                  }}
                />
              </Box>
              
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h2" sx={{
                  height: '3.6em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}>
                  {course.title}
                </Typography>
                
                <Box display="flex" justifyContent="space-between" mb={1.5}>
                  <Typography variant="body2" color="text.secondary" display="flex" alignItems="center">
                    <PersonIcon fontSize="small" sx={{ mr: 0.5 }} />
                    {course.instructor}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" display="flex" alignItems="center">
                    <SignalCellularAltIcon fontSize="small" sx={{ mr: 0.5 }} />
                    {course.level}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{
                  height: '4.8em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  mb: 2
                }}>
                  {course.description}
                </Typography>
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                <Button
                  component={Link}
                  to={`/courses/${course.id}`}
                  color="primary"
                  endIcon={<ArrowForwardIcon />}
                >
                  Tham gia
                </Button>
                <Box display="flex" alignItems="center">
                  <Rating value={course.rating} precision={0.5} readOnly size="small" />
                  <Typography variant="body2" color="text.secondary" ml={0.5}>
                    ({course.enrollmentCount})
                  </Typography>
                </Box>
              </CardActions>
            </CourseCard>
          ))}
        </GridWrapper>
      ) : (
        <Box sx={{ textAlign: 'center', my: 5 }}>
          <Typography>Không tìm thấy khóa học nào phù hợp với tiêu chí tìm kiếm</Typography>
        </Box>
      )}
    </Container>
  );
}

export default CoursesList; 