import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, List, ListItem, ListItemText, 
         ListItemButton, ListItemIcon, Collapse, Checkbox,
         IconButton, styled } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

// Main container layout
const PageContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: 'calc(100vh - 64px)', // Adjust based on your header height
  overflow: 'hidden',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    height: 'auto',
  }
}));

// Video panel
const VideoPanel = styled(Box)(({ theme }) => ({
  flex: '1 1 70%',
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'auto',
  [theme.breakpoints.down('md')]: {
    flex: '1 1 auto',
  }
}));

// Sidebar panel
const SidebarPanel = styled(Box)(({ theme }) => ({
  flex: '0 0 30%',
  maxWidth: '30%',
  borderLeft: '1px solid #e0e0e0',
  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.down('md')]: {
    flex: '1 1 auto',
    maxWidth: '100%',
    borderLeft: 'none',
    borderTop: '1px solid #e0e0e0',
  }
}));

// Styled components
const SidebarWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}));

const ContentHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: '1px solid #e0e0e0',
  backgroundColor: '#fff'
}));

const ContentList = styled(Box)(({ theme }) => ({
  overflowY: 'auto',
  flexGrow: 1,
}));

const SectionHeader = styled(ListItemButton)(({ theme }) => ({
  padding: theme.spacing(2, 2),
  borderBottom: '1px solid #f0f0f0',
  '&:hover': {
    backgroundColor: 'rgba(0,0,0,0.02)',
  }
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '1rem',
}));

const SectionInfo = styled(Typography)(({ theme }) => ({
  color: 'rgba(0,0,0,0.6)',
  fontSize: '0.875rem',
  marginTop: theme.spacing(0.5)
}));

const VideoContainer = styled(Box)(({ theme }) => ({
  position: 'relative', 
  width: '100%',
  paddingBottom: '56.25%', // 16:9 aspect ratio
  height: 0, 
  overflow: 'hidden',
  marginBottom: theme.spacing(3),
}));

const VideoPlayer = styled('iframe')(({ theme }) => ({
  position: 'absolute', 
  top: 0, 
  left: 0, 
  width: '100%', 
  height: '100%', 
  border: 0,
}));

// Mock course data
const mockCourse = {
  id: 9,
  topicName: "Nhận thức",
  title: "Nhận thức về tác hại của ma túy đối với sức khỏe và xã hội",
  description: "Khóa học giúp người học hiểu rõ về tác hại của ma túy đối với sức khỏe cá nhân, gia đình và những hệ lụy xã hội.",
  targetAudience: "Học Sinh",
  coverImage: "https://res.cloudinary.com/dxkvlbzzu/image/upload/v1749404874/upload/file_ciwtlv.jpg",
  content: "<p>Khóa học cung cấp kiến thức và kỹ năng cơ bản giúp học sinh nhận biết và phòng tránh các chất gây nghiện phổ biến. Bạn sẽ được học về cách nhận diện các loại chất gây nghiện, tác hại của chúng đối với sức khỏe và cuộc sống, cũng như các kỹ năng từ chối khi bị rủ rê sử dụng.</p>",
  duration: 300,
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
          id: 1,
          videoTitle: "01.Bài 1: Nhận diện các loại ma túy thông dụng",
          url: "https://www.youtube.com/watch?v=a_frdvO7f44",
          completed: true,
          duration: 420
        },
        {
          id: 2,
          videoTitle: "02.Bài 2: Phân biệt ma túy tổng hợp và tự nhiên",
          url: "https://www.youtube.com/watch?v=zBZm0gXJF2E",
          completed: false,
          duration: 380
        }
      ],
      duration: 800,
      orderIndex: 1,
      isExpanded: true
    },
    {
      id: 10,
      title: "Tình huống xử lý khi bị rủ rê",
      content: "Cách từ chối và tìm kiếm giúp đỡ từ người lớn",
      videoUrl: [
        {
          id: 3,
          videoTitle: "03.Bài 3: Kỹ năng từ chối tình huống nguy hiểm",
          url: "https://www.youtube.com/watch?v=FSyB-coD7EM",
          completed: false,
          duration: 550
        }
      ],
      duration: 550,
      orderIndex: 2,
      isExpanded: false
    },
    {
      id: 11,
      title: "Ảnh hưởng của ma túy đến não bộ",
      content: "Tác động sinh lý và biến đổi hành vi",
      videoUrl: [
        {
          id: 4,
          videoTitle: "04.Bài 4: Cơ chế tác động của ma túy lên não bộ",
          url: "https://www.youtube.com/watch?v=FSyB-coD7EM",
          completed: false,
          duration: 470
        },
        {
          id: 5,
          videoTitle: "05.Bài 5: Các triệu chứng cai và phục hồi",
          url: "https://www.youtube.com/watch?v=FSyB-coD7EM",
          completed: false,
          duration: 390
        }
      ],
      duration: 860,
      orderIndex: 3,
      isExpanded: false
    }
  ],
  enrollmentCount: 1250,
  isEnrolled: true,
  active: true,
  instructor: "ThS. Trần Minh Hiếu"
};

// Helper function to extract YouTube video ID
const getYoutubeId = (url) => {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
};

function CourseLearning() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const videoRef = useRef(null);

  useEffect(() => {
    // In a real application, this would be an API call using the ID
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setCourse(mockCourse);
      setModules(mockCourse.modules);
      
      // Set first video as current by default
      if (mockCourse.modules.length > 0 && mockCourse.modules[0].videoUrl.length > 0) {
        setCurrentVideo(mockCourse.modules[0].videoUrl[0]);
      }
      
      setLoading(false);
    }, 500);
  }, [id]);

  const handleToggleModule = (moduleId) => {
    setModules(prevModules => 
      prevModules.map(module => 
        module.id === moduleId 
          ? { ...module, isExpanded: !module.isExpanded } 
          : module
      )
    );
  };

  const handleSelectVideo = (video) => {
    setCurrentVideo(video);
  };

  const handleVideoCompletion = (videoId) => {
    // Update modules and videos to mark as completed
    const updatedModules = modules.map(module => {
      const updatedVideos = module.videoUrl.map(video => {
        if (video.id === videoId) {
          return { ...video, completed: !video.completed };
        }
        return video;
      });
      
      return { ...module, videoUrl: updatedVideos };
    });
    
    setModules(updatedModules);
    
    // Update current video if it's the one being marked
    if (currentVideo && currentVideo.id === videoId) {
      setCurrentVideo({ ...currentVideo, completed: !currentVideo.completed });
    }
  };

  const calculateProgress = () => {
    let totalVideos = 0;
    let completedVideos = 0;
    
    modules.forEach(module => {
      module.videoUrl.forEach(video => {
        totalVideos++;
        if (video.completed) completedVideos++;
      });
    });
    
    return totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}hr ${minutes}min`;
    } else {
      return `${minutes}min`;
    }
  };

  const getModuleCompletionCount = (module) => {
    const total = module.videoUrl.length;
    const completed = module.videoUrl.filter(video => video.completed).length;
    return `${completed} / ${total}`;
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <Typography>Đang tải...</Typography>
    </Box>;
  }

  return (
    <PageContainer>
      {/* Video Panel - Left side */}
      <VideoPanel>
        {currentVideo ? (
          <Box>
            {/* Video Player */}
            <VideoContainer>
              <VideoPlayer 
                ref={videoRef}
                src={`https://www.youtube.com/embed/${getYoutubeId(currentVideo.url)}`}
                title={currentVideo.videoTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </VideoContainer>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
            <Typography>Vui lòng chọn một video để bắt đầu</Typography>
          </Box>
        )}
      </VideoPanel>
      
      {/* Course Curriculum Sidebar - Right side */}
      <SidebarPanel>
        <SidebarWrapper>
          <ContentHeader>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Course content</Typography>
          </ContentHeader>
          
          <ContentList>
            {modules.map((module, index) => (
              <Box key={module.id}>
                <SectionHeader onClick={() => handleToggleModule(module.id)}>
                  <Box sx={{ width: '100%' }}>
                    <SectionTitle>
                      Section {index + 1}: {module.title}
                    </SectionTitle>
                    <SectionInfo>
                      {getModuleCompletionCount(module)} | {formatDuration(module.duration)}
                    </SectionInfo>
                  </Box>
                  <IconButton edge="end" sx={{ ml: 1 }}>
                    {module.isExpanded ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </SectionHeader>
                
                <Collapse in={module.isExpanded} timeout="auto">
                  <List component="div" disablePadding sx={{ bgcolor: 'rgba(0,0,0,0.01)' }}>
                    {module.videoUrl.map((video) => (
                      <ListItemButton 
                        key={video.id}
                        selected={currentVideo && currentVideo.id === video.id}
                        onClick={() => handleSelectVideo(video)}
                        sx={{ 
                          pl: 4, 
                          py: 1.5,
                          borderLeft: currentVideo && currentVideo.id === video.id ? 
                            '4px solid #3f51b5' : '4px solid transparent'
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Checkbox
                            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                            checkedIcon={<CheckBoxIcon fontSize="small" />}
                            checked={video.completed}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleVideoCompletion(video.id);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            color="success"
                            size="small"
                          />
                        </ListItemIcon>
                        <ListItemText 
                          primary={video.videoTitle.split(":")[1] || video.videoTitle} 
                          secondary={formatDuration(video.duration)}
                          primaryTypographyProps={{
                            fontSize: '0.9rem',
                            fontWeight: currentVideo && currentVideo.id === video.id ? 600 : 400
                          }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </Box>
            ))}
          </ContentList>
        </SidebarWrapper>
      </SidebarPanel>
    </PageContainer>
  );
}

export default CourseLearning; 