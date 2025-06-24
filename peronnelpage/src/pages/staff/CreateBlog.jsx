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
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  Container
} from '@mui/material';
import { 
  AddPhotoAlternate as AddPhotoIcon, 
  Delete as DeleteIcon,
  Save as SaveIcon,
  Visibility as VisibilityIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import axios from 'axios';
import { Editor } from '@tinymce/tinymce-react';
import { getAccessToken } from '../../utils/auth';

const CreateBlog = () => {
  const editorRef = useRef(null);
  const [blog, setBlog] = useState({
    title: '',
    description: '',
    content: '',
    topicId: '',
    tags: [],
    image: null,
  });
  
  const [newTag, setNewTag] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  
  // Fetch topics on component mount
  useEffect(() => {
    fetchTopics();
    // Load draft if exists
    const savedDraft = localStorage.getItem('blogDraft');
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        setBlog(draftData);
        if (draftData.image && draftData.imagePreview) {
          setPreviewImage(draftData.imagePreview);
        }
      } catch (err) {
        console.error('Error loading draft:', err);
      }
    }
  }, []);
  
  const fetchTopics = async () => {
    setLoadingTopics(true);
    try {
      const response = await axios.get('/api/topics');
      setTopics(response.data);
    } catch (error) {
      console.error('Error fetching topics:', error);
      setSnackbar({
        open: true,
        message: 'Không thể tải danh sách topic. Vui lòng thử lại sau.',
        severity: 'error'
      });
    } finally {
      setLoadingTopics(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBlog(prev => ({ ...prev, [name]: value }));
  };

  const handleTagInput = (e) => {
    if (e.key === 'Enter' && newTag.trim() !== '') {
      e.preventDefault();
      if (!blog.tags.includes(newTag.trim())) {
        setBlog(prev => ({ 
          ...prev, 
          tags: [...prev.tags, newTag.trim()]
        }));
      }
      setNewTag('');
    }
  };

  const handleDeleteTag = (tagToDelete) => {
    setBlog(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToDelete)
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBlog(prev => ({ ...prev, image: file }));
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        // Save image preview in blog for draft
        setBlog(prev => ({ ...prev, imagePreview: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSaveDraft = () => {
    // Get the current content from TinyMCE using ref
    const currentContent = editorRef.current ? editorRef.current.getContent() : '';
    
    // Update blog state with current content from editor
    const updatedBlog = {
      ...blog,
      content: currentContent
    };
    
    // Save updated blog to localStorage
    localStorage.setItem('blogDraft', JSON.stringify(updatedBlog));
    
    setSnackbar({
      open: true,
      message: 'Bản nháp đã được lưu thành công!',
      severity: 'success'
    });
  };

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
    
    setLoading(true);
    
    // Create FormData object for file upload
    const formData = new FormData();
    formData.append('title', blog.title);
    formData.append('topicId', blog.topicId);
    formData.append('description', blog.description);
    formData.append('content', currentContent);
    if (blog.image) {
      formData.append('images', blog.image);
    }
    if (blog.tags && blog.tags.length > 0) {
      blog.tags.forEach(tag => formData.append('tags', tag));
    }
    
    try {
      const token = getAccessToken();
      await axios.post('/api/staff/blog', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Blog đã được tạo thành công!',
        severity: 'success'
      });
      
      // Clear the draft after successful submission
      localStorage.removeItem('blogDraft');
      
      // Reset form
      setBlog({
        title: '',
        description: '',
        content: '',
        topicId: '',
        tags: [],
        image: null,
      });
      setPreviewImage(null);
      
      if (editorRef.current) {
        editorRef.current.setContent('');
      }
      
    } catch (error) {
      console.error('Error creating blog:', error);
      setSnackbar({
        open: true,
        message: 'Có lỗi xảy ra khi tạo blog. Vui lòng thử lại sau.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Tạo Blog Mới
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
          {/* Left side - Input fields */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Title field */}
            <TextField
              fullWidth
              required
              placeholder="title của bài blog"
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
                    ? () => <Typography sx={{ color: 'text.secondary' }}>Dropbox chọn topic</Typography>
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
                    <MenuItem key={topic.id} value={topic.id}>
                      {topic.topicName}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            
            {/* Description */}
            <TextField
              fullWidth
              placeholder="Description mô tả"
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
              // Set height to match the total height of the 3 fields on the left (3 fields at 56px each + 2 gaps at 24px each)
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
                    setBlog(prev => ({ ...prev, image: null, imagePreview: null }));
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
              // Basic config needed
              browser_spellcheck: true,
              directionality: 'ltr',
              entity_encoding: 'raw',
              convert_urls: false,
              // Remove onchange event handlers from TinyMCE's config
              setup: function(editor) {
                editor.on('init', function(e) {
                  // One time set direction on init
                  editor.getBody().style.direction = 'ltr';
                  editor.getBody().style.textAlign = 'left';
                  
                  // Focus at the end of content when initialized
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
        
        {/* Tags and buttons */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          {/* Tags */}
          <Box 
            sx={{ 
              flex: 2,
              border: '1px solid rgba(0, 0, 0, 0.23)', 
              borderRadius: 1,
              p: 2,
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              height: '56px'
            }}
          >
            <Typography sx={{ color: 'text.secondary', minWidth: 'max-content', mr: 2 }}>
              Tags
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, flexGrow: 1 }}>
              {blog.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleDeleteTag(tag)}
                  size="small"
                  color="primary"
                />
              ))}
            </Box>
            
            <TextField
              placeholder="Nhập tag và nhấn Enter để thêm"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleTagInput}
              variant="standard"
              sx={{ flexGrow: 1 }}
              InputProps={{ 
                disableUnderline: true
              }}
            />
          </Box>
          
          {/* Action buttons */}
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
            <Button
              type="button"
              variant="outlined"
              startIcon={<DescriptionIcon />}
              onClick={handleSaveDraft}
            >
              Lưu nháp
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Lưu blog'}
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

export default CreateBlog; 