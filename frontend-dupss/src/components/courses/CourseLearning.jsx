import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Paper, List, ListItem, ListItemText, 
         ListItemButton, ListItemIcon, Collapse, Checkbox,
         IconButton, styled, Breadcrumbs, Link } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import api from '../../services/authService';

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
  padding: 0,
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
  marginBottom: 0,
}));

const VideoPlayer = styled('iframe')(({ theme }) => ({
  position: 'absolute', 
  top: 0, 
  left: 0, 
  width: '100%', 
  height: '100%', 
  border: 0,
}));

// Breadcrumb container
const BreadcrumbContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: '#f5f5f5',
  borderBottom: '1px solid #e0e0e0',
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

// 添加YouTube IFrame API脚本加载函数
function loadYouTubeAPI() {
  if (window.YT) return Promise.resolve();

  return new Promise((resolve) => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    
    window.onYouTubeIframeAPIReady = () => {
      resolve();
    };
  });
}

function CourseLearning() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const progressTrackingRef = useRef(false);
  const videoPlayerContainerRef = useRef(null);

  useEffect(() => {
    // 获取课程数据
    const fetchCourseData = async () => {
      setLoading(true);
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          // 如果没有token，重定向到课程详情页
          navigate(`/courses/${id}`, {
            state: {
              showAlert: true,
              alertMessage: 'Bạn cần đăng nhập để xem khóa học này!',
              alertSeverity: 'error'
            }
          });
          return;
        }

        // Sử dụng api instance từ authService
        const response = await api.get(`/courses/detail/${id}`);

        setCourse(response.data);
        
        // 将响应数据映射到组件状态
        const mappedModules = response.data.modules.map(module => ({
          ...module,
          videoUrl: module.videos.map(video => ({
            id: video.id,
            videoTitle: video.title,
            url: video.videoUrl,
            completed: video.watched,
            duration: 0 // API没有提供时长，设为0
          })),
          isExpanded: false // 默认所有section都是关闭的
        }));

        // 查找包含未观看视频的第一个section
        let sectionWithUnwatchedVideo = null;
        let firstUnwatchedVideo = null;

        // 遍历所有模块查找第一个包含未观看视频的模块
        for (const module of mappedModules) {
          const unwatchedVideo = module.videoUrl.find(video => !video.completed);
          if (unwatchedVideo) {
            sectionWithUnwatchedVideo = module;
            firstUnwatchedVideo = unwatchedVideo;
            break;
          }
        }

        // 如果找到了含有未观看视频的section，则展开它
        if (sectionWithUnwatchedVideo) {
          const updatedModules = mappedModules.map(module => ({
            ...module,
            isExpanded: module.id === sectionWithUnwatchedVideo.id
          }));
          setModules(updatedModules);
          setCurrentVideo(firstUnwatchedVideo);
        } else {
          // 如果所有视频都已观看，则默认展开第一个section
          if (mappedModules.length > 0) {
            const updatedModules = mappedModules.map((module, index) => ({
              ...module,
              isExpanded: index === 0
            }));
            setModules(updatedModules);
            
            // 选择第一个section的第一个视频
            if (mappedModules[0].videoUrl.length > 0) {
              setCurrentVideo(mappedModules[0].videoUrl[0]);
            }
          } else {
            setModules(mappedModules);
          }
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
        // 重定向到课程详情页并显示错误信息
        navigate(`/courses/${id}`, {
          state: {
            showAlert: true,
            alertMessage: 'Có lỗi xảy ra, hãy thử lại sau!',
            alertSeverity: 'error'
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id, navigate]);

  const handleToggleModule = (moduleId) => {
    setModules(prevModules => 
      prevModules.map(module => 
        module.id === moduleId 
          ? { ...module, isExpanded: !module.isExpanded } 
          : module
      )
    );
  };

  // 播放状态变化时的回调
  const onPlayerStateChange = (event) => {
    // 当视频正在播放时(YT.PlayerState.PLAYING = 1)
    if (event.data === 1 && !progressTrackingRef.current) {
      progressTrackingRef.current = true;
      
      // 每秒检查一次进度
      const progressInterval = setInterval(() => {
        if (!playerRef.current) {
          clearInterval(progressInterval);
          return;
        }
        
        try {
          const currentTime = playerRef.current.getCurrentTime();
          const duration = playerRef.current.getDuration();
          const progress = (currentTime / duration) * 100;
          
          // 如果进度大于80%且视频未标记为已完成，则自动标记
          if (progress >= 80 && currentVideo && !currentVideo.completed) {
            clearInterval(progressInterval);
            progressTrackingRef.current = false;
            
            // 使用静默更新方式，避免重新加载视频
            silentMarkVideoComplete(currentVideo.id);
          }
        } catch (error) {
          console.error('Error tracking video progress:', error);
          clearInterval(progressInterval);
          progressTrackingRef.current = false;
        }
      }, 1000);
    } else if (event.data === 0 || event.data === 2) {
      // 视频结束(0)或暂停(2)时停止进度跟踪
      progressTrackingRef.current = false;
    }
  };

  // 添加静默更新函数，避免重新加载视频
  const silentMarkVideoComplete = async (videoId) => {
    try {
      // 调用API标记视频为已观看
      await api.post(`/courses/videos/watched/${videoId}?watched=true`);
      
      // 直接更新状态，但不触发播放器重新创建
      setModules(prevModules => {
        return prevModules.map(module => {
          const updatedVideos = module.videoUrl.map(video => {
            if (video.id === videoId) {
              return { ...video, completed: true };
            }
            return video;
          });
          
          return { ...module, videoUrl: updatedVideos };
        });
      });
      
      // 只更新当前视频的completed状态，不替换整个currentVideo对象
      if (currentVideo && currentVideo.id === videoId) {
        setCurrentVideo(prev => ({ ...prev, completed: true }));
      }
    } catch (error) {
      console.error('Error silently updating video watch status:', error);
    }
  };

  // 恢复handleVideoCompletion函数用于手动标记/取消标记
  const handleVideoCompletion = async (videoId, isCompleted) => {
    try {
      // 调用API更新视频观看状态
      await api.post(`/courses/videos/watched/${videoId}?watched=${!isCompleted}`);
      
      // 使用函数式更新，避免触发不必要的播放器重新创建
      setModules(prevModules => {
        return prevModules.map(module => {
          const updatedVideos = module.videoUrl.map(video => {
            if (video.id === videoId) {
              return { ...video, completed: !isCompleted };
            }
            return video;
          });
          
          return { ...module, videoUrl: updatedVideos };
        });
      });
      
      // 如果当前视频是被标记的视频，只更新completed状态
      if (currentVideo && currentVideo.id === videoId) {
        setCurrentVideo(prev => ({ ...prev, completed: !isCompleted }));
      }
    } catch (error) {
      console.error('Error updating video watch status:', error);
    }
  };

  // 修改createPlayer函数，使用current player state
  const createPlayer = useCallback(async () => {
    if (!currentVideo) return;
    
    try {
      await loadYouTubeAPI();
      
      // 保存当前播放器的状态（如果存在）
      let currentTime = 0;
      let wasPlaying = false;
      
      if (playerRef.current) {
        try {
          currentTime = playerRef.current.getCurrentTime();
          wasPlaying = playerRef.current.getPlayerState() === 1; // 1 = playing
          playerRef.current.destroy();
        } catch (e) {
          console.error('Error saving player state', e);
        }
      }
      
      const videoId = getYoutubeId(currentVideo.url);
      
      if (!videoId || !videoPlayerContainerRef.current) return;
      
      playerRef.current = new window.YT.Player(videoPlayerContainerRef.current, {
        videoId: videoId,
        playerVars: {
          autoplay: wasPlaying ? 1 : 0,
          start: Math.floor(currentTime),
          modestbranding: 1,
          rel: 0
        },
        events: {
          onStateChange: onPlayerStateChange,
          onReady: onPlayerReady
        }
      });
    } catch (error) {
      console.error('Error creating YouTube player:', error);
    }
  }, [currentVideo]);

  // 播放器准备就绪时的回调
  const onPlayerReady = (event) => {
    // 播放器已准备就绪
    console.log('Player ready');
  };

  // 更新处理视频选择的函数，在选择新视频时重新创建播放器
  const handleSelectVideo = (video) => {
    setCurrentVideo(video);
    progressTrackingRef.current = false;
  };

  // 当currentVideo变化时创建新的播放器，但增加判断以避免不必要的重新渲染
  useEffect(() => {
    // 只有当视频URL变化时才重新创建播放器
    if (currentVideo && (!playerRef.current || playerRef.current.getVideoUrl() !== currentVideo.url)) {
      createPlayer();
    }
    
    return () => {
      if (playerRef.current) {
        progressTrackingRef.current = false;
        // 清理播放器
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.error('Error destroying player', e);
        }
      }
    };
  }, [currentVideo?.url, createPlayer]); // 只依赖于URL变化，而不是整个currentVideo对象

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
    <Box>
      {/* Breadcrumb */}
      <BreadcrumbContainer>
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" sx={{ color: '#0056b3' }} />} 
          aria-label="breadcrumb"
        >
          <Link 
            component={RouterLink} 
            to="/courses" 
            sx={{ color: '#0056b3', '&:hover': { color: '#003d82' } }}
            underline="hover"
          >
            Khóa học
          </Link>
          <Link 
            component={RouterLink} 
            to={`/courses/${id}`} 
            sx={{ color: '#0056b3', '&:hover': { color: '#003d82' } }}
            underline="hover"
          >
            {course?.title || 'Chi tiết khóa học'}
          </Link>
          <Typography sx={{ color: '#0056b3', fontWeight: 500 }}>Bài giảng</Typography>
        </Breadcrumbs>
      </BreadcrumbContainer>
    
      <PageContainer>
        {/* Video Panel - Left side */}
        <VideoPanel>
          {currentVideo ? (
            <Box sx={{ width: '100%', height: '100%' }}>
              {/* Video Player */}
              <VideoContainer>
                <Box 
                  ref={videoPlayerContainerRef}
                  sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                />
              </VideoContainer>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
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
                        {getModuleCompletionCount(module)} | {module.videos ? `${module.videos.length} videos` : '0 videos'}
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
                                handleVideoCompletion(video.id, video.completed);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              color="success"
                              size="small"
                            />
                          </ListItemIcon>
                          <ListItemText 
                            primary={video.videoTitle.includes(":") ? video.videoTitle.split(":")[1] : video.videoTitle} 
                            secondary={video.duration > 0 ? formatDuration(video.duration) : null}
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
    </Box>
  );
}

export default CourseLearning; 