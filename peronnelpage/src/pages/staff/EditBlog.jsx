import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  CircularProgress,
  Alert,
  Snackbar,
  Container
} from '@mui/material';
import { 
  AddPhotoAlternate as AddPhotoIcon, 
  Delete as DeleteIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import axios from 'axios';
import { Editor } from '@tinymce/tinymce-react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAccessToken } from '../../utils/auth';
import apiClient from '../../services/apiService';
import { API_URL } from '../../services/config';

const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  
  // State for blog data
  const [blog, setBlog] = useState({
    title: '',
    description: '',
    content: '',
    topicId: '',
    image: null,
  });
  
  // State for topics and UI states
  const [topics, setTopics] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalBlog, setOriginalBlog] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Fetch blog data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // First fetch topics
        let topicsData = [];
        try {
          const topicsResponse = await apiClient.get('/topics');
          if (Array.isArray(topicsResponse.data)) {
            topicsData = topicsResponse.data;
            setTopics(topicsData);
          } else {
            setTopics([]);
          }
        } catch (topicError) {
          setTopics([]);
          setSnackbar({
            open: true,
            message: 'Không thể tải danh sách topic. Vui lòng kiểm tra kết nối và thử lại.',
            severity: 'error'
          });
        }
        
        // Then fetch blog data
        try {
          const token = getAccessToken();
          
          const response = await axios.get(`${API_URL}/staff/blog/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          // Check if we have valid data
          if (!response.data) {
            throw new Error('No data received from API');
          }
          
          // Find topic ID by name
          let topicId = '';
          if (response.data.topic && topicsData.length > 0) {
            // Try exact match first
            const matchingTopic = topicsData.find(t => t.topicName === response.data.topic);
            if (matchingTopic) {
              topicId = Number(matchingTopic.id);
            } else {
              // Try case-insensitive match
              const caseInsensitiveMatch = topicsData.find(
                t => t.topicName.toLowerCase() === response.data.topic.toLowerCase()
              );
              if (caseInsensitiveMatch) {
                topicId = Number(caseInsensitiveMatch.id);
              }
            }
          }
          
          // Create blog data object
          const blogData = {
            title: response.data.title || '',
            description: response.data.description || '',
            content: response.data.content || '',
            topicId: topicId,
            image: null
          };
          
          // Store the blog data
          setBlog(blogData);
          
          // Store original data for comparison
          setOriginalBlog({
            ...blogData,
            content: response.data.content || ''
          });
          
          if (response.data.imageUrl) {
            setPreviewImage(response.data.imageUrl);
          }
        } catch (err) {
          setSnackbar({
            open: true,
            message: 'Không thể tải thông tin bài viết. Vui lòng thử lại sau.',
            severity: 'error'
          });
        } finally {
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  // Check for changes
  useEffect(() => {
    if (!originalBlog) return;
    
    // Get current content from editor
    const currentContent = editorRef.current ? editorRef.current.getContent() : blog.content;
    
    // Check if any field has changed
    const hasContentChanged = currentContent !== originalBlog.content;
    const hasTitleChanged = blog.title !== originalBlog.title;
    const hasDescriptionChanged = blog.description !== originalBlog.description;
    const hasTopicChanged = blog.topicId !== originalBlog.topicId;
    const hasImageChanged = blog.image !== null;
    
    const changes = hasContentChanged || hasTitleChanged || hasDescriptionChanged || hasTopicChanged || hasImageChanged;
    
    setHasChanges(changes);
  }, [blog, originalBlog]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBlog(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBlog(prev => ({ ...prev, image: file }));
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Save draft to local storage
  const handleSaveDraft = () => {
    try {
      const currentContent = editorRef.current ? editorRef.current.getContent() : blog.content;
      
      // Create draft object
      const draft = {
        ...blog,
        content: currentContent,
        imagePreview: previewImage
      };
      
      // Save to localStorage
      localStorage.setItem(`blogDraft_${id}`, JSON.stringify(draft));
      
      setSnackbar({
        open: true,
        message: 'Lưu bảng nháp thành công!',
        severity: 'success'
      });
      
      return true;
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Lỗi khi lưu bảng nháp',
        severity: 'error'
      });
      
      return false;
    }
  };
  
  // Load draft from local storage
  useEffect(() => {
    if (!id) return;
    
    const savedDraft = localStorage.getItem(`blogDraft_${id}`);
    if (savedDraft && !loading) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        
        setSnackbar({
          open: true,
          message: 'Đã tìm thấy bản nháp. Bạn có muốn tải lên?',
          severity: 'info'
        });
        
        // We don't automatically load the draft to avoid overwriting API data
        // User can click the "Load Draft" button if they want to
      } catch (error) {
        // Error parsing draft, ignore silently
      }
    }
  }, [id, loading]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Get the current content from TinyMCE using ref
    const currentContent = editorRef.current ? editorRef.current.getContent() : '';
    
    // Validate form
    if (!blog.title || !blog.topicId || !currentContent) {
      setSnackbar({
        open: true,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc: tiêu đề, topic và nội dung.',
        severity: 'error'
      });
      return;
    }
    
    setSaving(true);
    
    // Create FormData object for file upload
    const formData = new FormData();
    formData.append('title', blog.title);
    formData.append('topicId', blog.topicId);
    formData.append('description', blog.description);
    formData.append('content', currentContent);
    
    // Only append image if a new one is selected
    if (blog.image) {
      formData.append('coverImage', blog.image);
    }
    
    try {
      const token = getAccessToken();
      
      // Use axios directly for multipart/form-data
      const response = await axios.patch(`${API_URL}/staff/blog/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      setSnackbar({
        open: true,
        message: 'Cập nhật bài viết thành công!',
        severity: 'success'
      });
      
      // Navigate back to history page after successful update
      setTimeout(() => {
        navigate('/staff/history');
      }, 2000);
      
    } catch (err) {
      let errorMessage = 'Có lỗi xảy ra khi cập nhật bài viết';
      if (err.response) {
        errorMessage += `: ${err.response.status} - ${err.response.data?.message || JSON.stringify(err.response.data)}`;
      } else if (err.request) {
        errorMessage += ': Không nhận được phản hồi từ server';
      } else {
        errorMessage += `: ${err.message}`;
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Chỉnh Sửa Bài Viết
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
          {/* Left side - Input fields */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Title field */}
            <TextField
              fullWidth
              required
              placeholder="Tiêu đề bài blog"
              name="title"
              value={blog.title}
              onChange={handleChange}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  borderRadius: 1,
                  height: '56px'
                }
              }}
            />
            
            {/* Topic selection */}
            <FormControl fullWidth>
              <Select
                value={blog.topicId}
                name="topicId"
                onChange={handleChange}
                displayEmpty
                disabled={loadingTopics}
                sx={{ 
                  backgroundColor: 'white',
                  borderRadius: 1,
                  height: '56px',
                  '& .MuiSelect-select': {
                    py: 1.8
                  }
                }}
                renderValue={
                  blog.topicId === '' || blog.topicId === null
                    ? () => <Typography sx={{ color: 'text.secondary' }}>Chọn topic</Typography>
                    : () => {
                        const selectedTopic = topics.find(t => Number(t.id) === Number(blog.topicId));
                        return selectedTopic ? selectedTopic.topicName : '';
                      }
                }
              >
                {loadingTopics ? (
                  <MenuItem value="">
                    <CircularProgress size={20} /> Đang tải...
                  </MenuItem>
                ) : (
                  topics.map(topic => (
                    <MenuItem key={topic.id} value={Number(topic.id)}>
                      {topic.topicName}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            
            {/* Description */}
            <TextField
              fullWidth
              placeholder="Mô tả ngắn"
              name="description"
              value={blog.description}
              onChange={handleChange}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  borderRadius: 1,
                  height: '56px'
                }
              }}
            />
          </Box>
          
          {/* Right side - Image upload */}
          <Box 
            sx={{ 
              flex: 1,
              border: '1px solid rgba(0, 0, 0, 0.23)', 
              borderRadius: 1,
              backgroundColor: 'white',
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center', 
              alignItems: 'center',
              p: 2,
              height: 'calc(3 * 56px + 2 * 24px)'
            }}
          >
            {!previewImage ? (
              <>
                <Typography sx={{ my: 2, color: 'text.secondary' }}>
                  Image sử dụng cho bài blog
                </Typography>
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<AddPhotoIcon />}
                  size="small"
                  color="primary"
                  sx={{ 
                    textTransform: 'uppercase',
                    backgroundColor: '#1976d2',
                    borderRadius: 1
                  }}
                >
                  Thêm ảnh
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
              </>
            ) : (
              <Box sx={{ position: 'relative', width: '100%', height: '100%', minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={previewImage}
                  alt="Cover preview"
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '100%', 
                    objectFit: 'contain'
                  }}
                />
                <Button
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    backgroundColor: 'white',
                    color: 'error.main',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)'
                    }
                  }}
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => {
                    setPreviewImage(null);
                    setBlog(prev => ({ ...prev, image: null }));
                  }}
                >
                  Xóa
                </Button>
              </Box>
            )}
          </Box>
        </Box>
        
        {/* TinyMCE Editor */}
        <Box 
          sx={{ 
            mb: 3, 
            border: '1px solid rgba(0, 0, 0, 0.23)', 
            borderRadius: 1, 
            overflow: 'hidden',
            backgroundColor: 'white'
          }}
        >
          <Typography 
            sx={{ 
              p: 2, 
              textAlign: 'center', 
              color: 'text.secondary',
              borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
            }}
          >
            Nội dung
          </Typography>
          <Editor
            apiKey="dpd386vjz5110tuev4munelye54caj3z0xj031ujmmahsu4h"
            onInit={(evt, editor) => editorRef.current = editor}
            initialValue={blog.content}
            init={{
              height: 500,
              menubar: true,
              plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount',
                'codesample'
              ],
              toolbar: 'undo redo | blocks | ' +
                'bold italic forecolor | alignleft aligncenter ' +
                'alignright alignjustify | bullist numlist outdent indent | ' +
                'removeformat | link image media | code preview fullscreen | codesample',
              content_style: `
                body { 
                  font-family: Helvetica, Arial, sans-serif; 
                  font-size: 14px;
                  direction: ltr;
                  text-align: left;
                }
              `,
              browser_spellcheck: true,
              directionality: 'ltr',
              entity_encoding: 'raw',
              convert_urls: false,
              setup: function(editor) {
                editor.on('init', function(e) {
                  editor.getBody().style.direction = 'ltr';
                  editor.getBody().style.textAlign = 'left';
                  
                  if (editor.getContent() !== '') {
                    editor.focus();
                    editor.selection.select(editor.getBody(), true);
                    editor.selection.collapse(false);
                  }
                });
              }
            }}
          />
        </Box>
        
        {/* Action buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Button
            type="button"
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/staff/history')}
          >
            Quay lại
          </Button>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              type="button"
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={handleSaveDraft}
              disabled={saving}
            >
              Lưu nháp
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={saving || !hasChanges}
            >
              {saving ? <CircularProgress size={24} /> : 'Lưu thay đổi'}
            </Button>
          </Box>
        </Box>
      </Box>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditBlog; 