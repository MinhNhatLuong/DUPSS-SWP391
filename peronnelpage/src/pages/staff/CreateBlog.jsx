import React, { useState } from 'react';
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
  InputAdornment,
  IconButton,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  AddPhotoAlternate as AddPhotoIcon, 
  Delete as DeleteIcon,
  Save as SaveIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

const CreateBlog = () => {
  const [blog, setBlog] = useState({
    title: '',
    summary: '',
    content: '',
    category: '',
    tags: [],
    coverImage: null,
    published: false
  });
  
  const [newTag, setNewTag] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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
      setBlog(prev => ({ ...prev, coverImage: file }));
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would normally send the data to an API
    console.log('Blog to submit:', blog);
    
    // Show success message
    setSnackbar({
      open: true,
      message: 'Blog đã được lưu thành công!',
      severity: 'success'
    });
    
    // In a real implementation, you would redirect or clear the form after successful submission
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Tạo Blog Mới
      </Typography>
      
      <Paper sx={{ p: 3, mt: 2 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Tiêu đề"
                name="title"
                value={blog.title}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Danh mục</InputLabel>
                <Select
                  value={blog.category}
                  name="category"
                  label="Danh mục"
                  onChange={handleChange}
                >
                  <MenuItem value="technology">Công nghệ</MenuItem>
                  <MenuItem value="health">Sức khỏe</MenuItem>
                  <MenuItem value="education">Giáo dục</MenuItem>
                  <MenuItem value="lifestyle">Lối sống</MenuItem>
                  <MenuItem value="psychology">Tâm lý học</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tags"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleTagInput}
                variant="outlined"
                placeholder="Nhập tag và nhấn Enter"
                helperText="Nhập tag và nhấn Enter để thêm"
                InputProps={{
                  startAdornment: blog.tags.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mr: 1 }}>
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
                  ) : null
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tóm tắt"
                name="summary"
                value={blog.summary}
                onChange={handleChange}
                variant="outlined"
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<AddPhotoIcon />}
                sx={{ mb: 2 }}
              >
                Thêm ảnh bìa
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
              
              {previewImage && (
                <Box sx={{ mt: 2, position: 'relative', width: 'fit-content' }}>
                  <img
                    src={previewImage}
                    alt="Cover preview"
                    style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'cover' }}
                  />
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 5,
                      right: 5,
                      bgcolor: 'rgba(255, 255, 255, 0.7)'
                    }}
                    onClick={() => {
                      setPreviewImage(null);
                      setBlog(prev => ({ ...prev, coverImage: null }));
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Nội dung"
                name="content"
                value={blog.content}
                onChange={handleChange}
                variant="outlined"
                multiline
                rows={10}
              />
            </Grid>
            
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                type="button"
                variant="outlined"
                startIcon={<VisibilityIcon />}
              >
                Xem trước
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
              >
                Lưu blog
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
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