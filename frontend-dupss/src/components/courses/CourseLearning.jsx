import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Paper, List, ListItem, ListItemText, 
         ListItemButton, ListItemIcon, Collapse, Checkbox,
         IconButton, styled, Breadcrumbs, Link, Button, Alert } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AssignmentIcon from '@mui/icons-material/Assignment';
import api from '../../services/authService';

// Main container layout
const PageContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: 'calc(100vh - 112px)', // Adjust height, considering Breadcrumb height
  overflow: 'hidden',
  backgroundColor: '#fff',
  border: '1px solid #e0e0e0',
  borderTop: 'none',
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
  height: '100%',
  [theme.breakpoints.down('md')]: {
    flex: '1 1 auto',
    height: '60vh',
  }
}));

// Sidebar panel - Adjust styles to ensure perfect integration with the video area
const SidebarPanel = styled(Box)(({ theme }) => ({
  flex: '0 0 30%',
  maxWidth: '30%',
  borderLeft: '1px solid #e0e0e0',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  margin: 0,
  padding: 0,
  backgroundColor: '#fdfdfd',
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
  height: '100%',
  paddingBottom: 0,
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

// Progress Info container
const ProgressInfoContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: '#f5f8ff',
  borderBottom: '1px solid #e0e0e0',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  }
}));

// Helper function to extract YouTube video ID
const getYoutubeId = (url) => {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
};

// Add YouTube IFrame API script loading function
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
  const [courseProgress, setCourseProgress] = useState(0);
  const [videoStats, setVideoStats] = useState({ total: 0, completed: 0 });
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const progressTrackingRef = useRef(false);
  const videoPlayerContainerRef = useRef(null);

  useEffect(() => {
    // Get course data
    const fetchCourseData = async () => {
      setLoading(true);
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          // If no token, redirect to course details page
          navigate(`/courses/${id}`, {
            state: {
              showAlert: true,
              alertMessage: 'Bạn cần đăng nhập để xem khóa học này!',
              alertSeverity: 'error'
            }
          });
          return;
        }

        // Use api instance from authService
        const response = await api.get(`/courses/detail/${id}`);

        setCourse(response.data);
        // Lấy giá trị progress từ API response, đảm bảo không vượt quá 100%
        setCourseProgress(Math.min(100, response.data.progress || 0));
        
        // Map response data to component state
        const mappedModules = response.data.modules.map(module => ({
          ...module,
          videoUrl: module.videos.map(video => ({
            id: video.id,
            videoTitle: video.title,
            url: video.videoUrl,
            completed: video.watched,
            duration: 0 // API doesn't provide duration, set to 0
          })),
          isExpanded: false // Default all sections are closed
        }));

        // Tính toán và lưu trữ số lượng video và số video đã xem
        let totalCount = 0;
        let completedCount = 0;
        mappedModules.forEach(module => {
          module.videoUrl.forEach(video => {
            totalCount++;
            if (video.completed) completedCount++;
          });
        });
        setVideoStats({ total: totalCount, completed: completedCount });

        // Find first section with unwatched videos
        let sectionWithUnwatchedVideo = null;
        let firstUnwatchedVideo = null;

        // Iterate through all modules to find the first one with unwatched videos
        for (const module of mappedModules) {
          const unwatchedVideo = module.videoUrl.find(video => !video.completed);
          if (unwatchedVideo) {
            sectionWithUnwatchedVideo = module;
            firstUnwatchedVideo = unwatchedVideo;
            break;
          }
        }

        // If found a section with unwatched videos, expand it
        if (sectionWithUnwatchedVideo) {
          const updatedModules = mappedModules.map(module => ({
            ...module,
            isExpanded: module.id === sectionWithUnwatchedVideo.id
          }));
          setModules(updatedModules);
          setCurrentVideo(firstUnwatchedVideo);
        } else {
          // If all videos are watched, expand the first section by default
          if (mappedModules.length > 0) {
            const updatedModules = mappedModules.map((module, index) => ({
              ...module,
              isExpanded: index === 0
            }));
            setModules(updatedModules);
            
            // Select first video of first section
            if (mappedModules[0].videoUrl.length > 0) {
              setCurrentVideo(mappedModules[0].videoUrl[0]);
            }
          } else {
            setModules(mappedModules);
          }
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
        // Redirect to course detail page and display error message
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

  // Modified callback for video playback state changes, with more detailed comments
  const onPlayerStateChange = (event) => {
    // When video is playing (YT.PlayerState.PLAYING = 1)
    if (event.data === 1 && !progressTrackingRef.current) {
      progressTrackingRef.current = true;
      
      // Check progress every second
      const progressInterval = setInterval(() => {
        if (!playerRef.current) {
          clearInterval(progressInterval);
          return;
        }
        
        try {
          // Kiểm tra lại xem video hiện tại có tồn tại và đã được hoàn thành chưa
          if (!currentVideo) {
            clearInterval(progressInterval);
            progressTrackingRef.current = false;
            return;
          }
          
          // Tìm video hiện tại trong modules để kiểm tra trạng thái mới nhất
          let isCurrentlyCompleted = false;
          for (const module of modules) {
            for (const video of module.videoUrl) {
              if (video.id === currentVideo.id && video.completed) {
                isCurrentlyCompleted = true;
                break;
              }
            }
            if (isCurrentlyCompleted) break;
          }
          
          // Nếu video đã được đánh dấu hoàn thành từ trước, dừng theo dõi
          if (isCurrentlyCompleted) {
            clearInterval(progressInterval);
            progressTrackingRef.current = false;
            return;
          }
          
          const currentTime = playerRef.current.getCurrentTime();
          const duration = playerRef.current.getDuration();
          const progress = (currentTime / duration) * 100;
          
          // If progress is over 80% and video is not marked as completed, auto-mark it
          if (progress >= 80 && currentVideo && !currentVideo.completed) {
            clearInterval(progressInterval);
            progressTrackingRef.current = false;
            
            // Use silent update method to avoid reloading the video
            silentMarkVideoComplete(currentVideo.id);
          }
        } catch (error) {
          console.error('Error tracking video progress:', error);
          clearInterval(progressInterval);
          progressTrackingRef.current = false;
        }
      }, 1000);
    } else if (event.data === 0 || event.data === 2) {
      // Video ended (0) or paused (2), stop progress tracking
      progressTrackingRef.current = false;
    }
  };

  // Optimize silent update function to ensure player is not recreated
  const silentMarkVideoComplete = async (videoId) => {
    try {
      // Kiểm tra xem video đã được đánh dấu là hoàn thành chưa
      let videoAlreadyCompleted = false;
      const currentModules = [...modules];
      
      for (const module of currentModules) {
        for (const video of module.videoUrl) {
          if (video.id === videoId && video.completed) {
            videoAlreadyCompleted = true;
            break;
          }
        }
        if (videoAlreadyCompleted) break;
      }
      
      // Nếu video đã hoàn thành, không cập nhật gì thêm
      if (videoAlreadyCompleted) {
        console.log('Video already marked as completed');
        return;
      }

      // Cập nhật UI trước khi gọi API
      setModules(prevModules => {
        let updatedModules = prevModules.map(module => {
          const updatedVideos = module.videoUrl.map(video => {
            if (video.id === videoId) {
              return { ...video, completed: true };
            }
            return video;
          });
          
          return { ...module, videoUrl: updatedVideos };
        });
        return updatedModules;
      });
      
      // Đếm số lượng video hoàn thành hiện tại
      let totalVideos = 0;
      let completedVideos = 0;
      
      currentModules.forEach(module => {
        module.videoUrl.forEach(video => {
          totalVideos++;
          if (video.completed || video.id === videoId) completedVideos++;
        });
      });
      
      // Đảm bảo không vượt quá tổng số video
      completedVideos = Math.min(completedVideos, totalVideos);
      
      // Cập nhật tiến độ một cách chính xác
      const newProgress = Math.min(100, totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0);
      
      // Cập nhật state
      setVideoStats({ 
        total: totalVideos, 
        completed: completedVideos 
      });
      setCourseProgress(newProgress);
      
      // Cập nhật currentVideo nếu cần
      if (currentVideo && currentVideo.id === videoId) {
        setCurrentVideo(prev => {
          if (prev.completed) return prev;
          return { ...prev, completed: true };
        });
      }
      
      // Gọi API (không chờ đợi kết quả)
      api.post(`/courses/videos/watched/${videoId}?watched=true`)
        .catch(error => {
          console.error('Error silently updating video watch status:', error);
          // Hoàn tác UI nếu API lỗi
          setModules(prevModules => {
            let updatedModules = prevModules.map(module => {
              const updatedVideos = module.videoUrl.map(video => {
                if (video.id === videoId) {
                  return { ...video, completed: false };
                }
                return video;
              });
              return { ...module, videoUrl: updatedVideos };
            });
            return updatedModules;
          });
          
          if (currentVideo && currentVideo.id === videoId) {
            setCurrentVideo(prev => ({ ...prev, completed: false }));
          }
          
          // Tính lại số video đã hoàn thành
          let newTotalVideos = 0;
          let newCompletedVideos = 0;
          
          prevModules.forEach(module => {
            module.videoUrl.forEach(video => {
              newTotalVideos++;
              if (video.completed && video.id !== videoId) newCompletedVideos++;
            });
          });
          
          const correctedProgress = Math.min(100, newTotalVideos > 0 ? 
            (newCompletedVideos / newTotalVideos) * 100 : 0);
            
          setVideoStats({
            total: newTotalVideos,
            completed: newCompletedVideos
          });
          setCourseProgress(correctedProgress);
        });
    } catch (error) {
      console.error('Error updating video state:', error);
    }
  };

  // Optimize manual mark/unmark function to avoid video reload
  const handleVideoCompletion = async (videoId, isCompleted) => {
    try {
      // Cập nhật UI ngay lập tức
      setModules(prevModules => {
        let updatedModules = prevModules.map(module => {
          const updatedVideos = module.videoUrl.map(video => {
            if (video.id === videoId) {
              return { ...video, completed: !isCompleted };
            }
            return video;
          });
          
          return { ...module, videoUrl: updatedVideos };
        });
        
        return updatedModules;
      });
      
      // Tính toán lại tiến độ từ dữ liệu hiện tại
      let totalVideos = 0;
      let completedVideos = 0;
      
      // Sử dụng một bản sao của modules hiện tại và cập nhật trạng thái của video đang xử lý
      const currentModules = [...modules];
      for (const module of currentModules) {
        for (const video of module.videoUrl) {
          totalVideos++;
          
          if ((video.id === videoId && !isCompleted) || (video.id !== videoId && video.completed)) {
            completedVideos++;
          }
        }
      }
      
      // Đảm bảo không vượt quá tổng số video
      completedVideos = Math.min(completedVideos, totalVideos);
      
      // Cập nhật tiến độ một cách chính xác
      const newProgress = Math.min(100, totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0);
      
      // Cập nhật state
      setVideoStats({ 
        total: totalVideos, 
        completed: completedVideos 
      });
      setCourseProgress(newProgress);
      
      if (currentVideo && currentVideo.id === videoId) {
        setCurrentVideo(prev => {
          return { ...prev, completed: !isCompleted };
        });
      }
      
      // Gọi API (không chờ đợi kết quả)
      api.post(`/courses/videos/watched/${videoId}?watched=${!isCompleted}`)
        .catch(error => {
          console.error('Error updating video watch status:', error);
          // Hoàn tác UI nếu API lỗi
          setModules(prevModules => {
            let updatedModules = prevModules.map(module => {
              const updatedVideos = module.videoUrl.map(video => {
                if (video.id === videoId) {
                  return { ...video, completed: isCompleted };
                }
                return video;
              });
              return { ...module, videoUrl: updatedVideos };
            });
            return updatedModules;
          });
          
          if (currentVideo && currentVideo.id === videoId) {
            setCurrentVideo(prev => ({ ...prev, completed: isCompleted }));
          }
          
          // Tính lại tiến độ chính xác
          let newTotalVideos = 0;
          let newCompletedVideos = 0;
          
          prevModules.forEach(module => {
            module.videoUrl.forEach(video => {
              newTotalVideos++;
              if (video.completed) newCompletedVideos++;
            });
          });
          
          const correctedProgress = Math.min(100, newTotalVideos > 0 ? 
            (newCompletedVideos / newTotalVideos) * 100 : 0);
            
          setVideoStats({
            total: newTotalVideos,
            completed: newCompletedVideos
          });
          setCourseProgress(correctedProgress);
        });
    } catch (error) {
      console.error('Error handling video completion:', error);
    }
  };

  // Thay thế hàm cập nhật tiến độ bằng hàm mới tính toán tiến độ từ state
  // Giữ lại hàm này để tương thích với các phần còn lại của code
  const updateProgressAfterVideoChange = (currentModules) => {
    let totalVideos = 0;
    let completedVideos = 0;
    
    currentModules.forEach(module => {
      module.videoUrl.forEach(video => {
        totalVideos++;
        if (video.completed) completedVideos++;
      });
    });
    
    setVideoStats({ total: totalVideos, completed: completedVideos });
    const newProgress = Math.min(100, totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0);
    setCourseProgress(newProgress);
  };

  // Optimize createPlayer function to ensure player correctly fills container
  const createPlayer = useCallback(async () => {
    if (!currentVideo) return;
    
    try {
      await loadYouTubeAPI();
      
      // Save current player state (if exists)
      let currentTime = 0;
      let wasPlaying = false;
      
      // Check if we really need to recreate the player
      const videoId = getYoutubeId(currentVideo.url);
      const currentPlayerVideoId = playerRef.current && playerRef.current.getVideoData ? 
        playerRef.current.getVideoData().video_id : null;
      
      // If the current player is already playing this video, no need to recreate
      if (playerRef.current && currentPlayerVideoId === videoId) {
        console.log('Same video is already playing, not recreating player');
        return;
      }
      
      if (playerRef.current) {
        try {
          currentTime = playerRef.current.getCurrentTime();
          wasPlaying = playerRef.current.getPlayerState() === 1; // 1 = playing
          playerRef.current.destroy();
        } catch (e) {
          console.error('Error saving player state', e);
        }
      }
      
      if (!videoId || !videoPlayerContainerRef.current) return;
      
      // Create container element
      const playerContainer = document.createElement('div');
      playerContainer.id = 'youtube-player-' + Date.now();
      playerContainer.style.width = '100%';
      playerContainer.style.height = '100%';
      
      // Clear existing content
      while (videoPlayerContainerRef.current.firstChild) {
        videoPlayerContainerRef.current.removeChild(videoPlayerContainerRef.current.firstChild);
      }
      
      // Add new container
      videoPlayerContainerRef.current.appendChild(playerContainer);
      
      // Create YouTube player and set it to fill the entire container
      playerRef.current = new window.YT.Player(playerContainer.id, {
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
        },
        height: '100%',
        width: '100%'
      });
    } catch (error) {
      console.error('Error creating YouTube player:', error);
    }
  }, [currentVideo?.url]); // Only depend on URL, not the entire currentVideo object

  // Callback when player is ready
  const onPlayerReady = (event) => {
    // Player is ready
    console.log('Player ready');
  };

  // Optimize video selection function to avoid reloading when selecting the same video
  const handleSelectVideo = (video) => {
    // If selecting the currently playing video, do nothing
    if (currentVideo && currentVideo.id === video.id) {
      console.log('Same video selected, no action needed');
      return;
    }
    
    setCurrentVideo(video);
    progressTrackingRef.current = false;
  };

  // Create new player when currentVideo changes, add conditions to avoid unnecessary re-rendering
  useEffect(() => {
    // Only recreate the player when video URL changes
    if (currentVideo && (!playerRef.current || 
        (playerRef.current.getVideoData && playerRef.current.getVideoData().video_id !== getYoutubeId(currentVideo.url)))
    ) {
      createPlayer();
    }
    
    return () => {
      if (playerRef.current) {
        progressTrackingRef.current = false;
        // Clean up the player
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.error('Error destroying player', e);
        }
      }
    };
  }, [currentVideo?.url, createPlayer]); // Only depend on URL changes, not the entire currentVideo object

  const calculateProgress = () => {
    let totalVideos = 0;
    let completedVideos = 0;
    
    modules.forEach(module => {
      module.videoUrl.forEach(video => {
        totalVideos++;
        if (video.completed) completedVideos++;
      });
    });
    
    return Math.min(100, totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0);
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

  const handleSurveyClick = () => {
    // Navigate to the quiz page
    navigate(`/courses/${id}/quiz`);
  };

  // Format progress với 2 chữ số thập phân
  const formatProgress = (progress) => {
    if (progress === undefined || progress === null) return '0.00';
    return progress.toFixed(2);
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

      {/* Progress Info Section */}
      <ProgressInfoContainer>
        <Box sx={{ flex: '1 1 auto' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Tiến độ hiện tại: <span style={{ color: courseProgress >= 100 ? '#27ae60' : '#0056b3' }}>{formatProgress(courseProgress)}%</span>
          </Typography>
          <Typography variant="body2" sx={{ color: '#505050' }}>
            Sau khi xem hết video với tiến độ là 100%, bạn sẽ được tham gia làm kiểm tra để có thể hoàn thành khóa học
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AssignmentIcon />}
          disabled={courseProgress < 100 || (course && course.enrollmentStatus === "COMPLETED")}
          onClick={handleSurveyClick}
          sx={{ 
            fontWeight: 'bold',
            bgcolor: courseProgress >= 100 ? '#27ae60' : undefined,
            '&:hover': {
              bgcolor: courseProgress >= 100 ? '#219653' : undefined,
            }
          }}
        >
          Làm kiểm tra
        </Button>
      </ProgressInfoContainer>
    
      <PageContainer>
        {/* Video Panel - Left side */}
        <VideoPanel>
          {currentVideo ? (
            <Box sx={{ width: '100%', height: '100%', display: 'flex' }}>
              {/* Video Player */}
              <VideoContainer>
                <Box 
                  ref={videoPlayerContainerRef}
                  sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '100%',
                    border: 0
                  }}
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