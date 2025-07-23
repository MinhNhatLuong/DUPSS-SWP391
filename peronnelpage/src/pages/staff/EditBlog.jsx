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
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Fetch blog data and topics
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const token = getAccessToken();
        
        const response = await axios.get(`${API_URL}/staff/blog/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Blog data fetched:', response.data);
        
        // Check if we have valid data
        if (!response.data) {
          throw new Error('No data received from API');
        }
        
        // Convert topicId to number if it's a string to match with dropdown values
        const topicId = response.data.topicId ? 
          (typeof response.data.topicId === 'string' ? parseInt(response.data.topicId, 10) : response.data.topicId) : 
          '';
          
        console.log('Setting blog data with topicId:', topicId);
        
        setBlog({
          title: response.data.title || '',
          description: response.data.description || '',
          content: response.data.content || '',
          topicId: topicId,
        });
        
        if (response.data.imageUrl) {
          setPreviewImage(response.data.imageUrl);
        }
      } catch (err) {
        console.error('Error fetching blog:', err);
        setSnackbar({
          open: true,
          message: 'Không thể tải thông tin bài viết. Vui lòng thử lại sau.',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    const fetchTopics = async () => {
      setLoadingTopics(true);
      try {
        const response = await apiClient.get('/topics');
        console.log('Topics fetched:', response.data);
        setTopics(response.data);
      } catch (err) {
        console.error('Error fetching topics:', err);
        setSnackbar({
          open: true,
          message: 'Không thể tải danh sách topic. Vui lòng kiểm tra kết nối và thử lại.',
          severity: 'error'
        });
      } finally {
        setLoadingTopics(false);
      }
    };
    
    fetchBlog();
    fetchTopics();
  }, [id]);
  
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
      formData.append('images', blog.image);
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
      
      console.log('Blog update successful:', response.data);
      
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
      console.error('Error updating blog:', err);
      
      // Get more detailed error information
      let errorMessage = 'Có lỗi xảy ra khi cập nhật bài viết';
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        errorMessage += `: ${err.response.status} - ${err.response.data?.message || JSON.stringify(err.response.data)}`;
      } else if (err.request) {
        console.error('Error request:', err.request);
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
                  blog.topicId === '' 
                    ? () => <Typography sx={{ color: 'text.secondary' }}>Chọn topic</Typography>
                    : () => {
                        const selectedTopic = topics.find(t => t.id === blog.topicId);
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
                    <MenuItem key={topic.id} value={typeof topic.id === 'string' ? parseInt(topic.id, 10) : topic.id}>
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
          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : 'Lưu thay đổi'}
          </Button>
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