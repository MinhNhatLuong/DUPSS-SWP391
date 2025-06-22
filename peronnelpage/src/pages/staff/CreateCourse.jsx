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
  IconButton,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  CloudUpload as UploadIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material';

const CreateCourse = () => {
  const [course, setCourse] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    thumbnail: null,
    modules: []
  });

  const [openModuleDialog, setOpenModuleDialog] = useState(false);
  const [currentModule, setCurrentModule] = useState(null);
  const [moduleIndex, setModuleIndex] = useState(-1);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourse(prev => ({ ...prev, [name]: value }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCourse(prev => ({ ...prev, thumbnail: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenModuleDialog = (module = null, index = -1) => {
    setCurrentModule(module || { title: '', content: '', videoUrl: '', duration: '' });
    setModuleIndex(index);
    setOpenModuleDialog(true);
  };

  const handleCloseModuleDialog = () => {
    setOpenModuleDialog(false);
    setCurrentModule(null);
  };

  const handleSaveModule = () => {
    if (moduleIndex === -1) {
      // Add new module
      setCourse(prev => ({
        ...prev,
        modules: [...prev.modules, currentModule]
      }));
    } else {
      // Update existing module
      setCourse(prev => {
        const updatedModules = [...prev.modules];
        updatedModules[moduleIndex] = currentModule;
        return { ...prev, modules: updatedModules };
      });
    }
    handleCloseModuleDialog();
  };

  const handleDeleteModule = (index) => {
    setCourse(prev => {
      const updatedModules = [...prev.modules];
      updatedModules.splice(index, 1);
      return { ...prev, modules: updatedModules };
    });
  };

  const handleModuleChange = (e) => {
    const { name, value } = e.target;
    setCurrentModule(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would normally send the data to an API
    console.log('Course to submit:', course);
    
    // Show success message
    setSnackbar({
      open: true,
      message: 'Khóa học đã được lưu thành công!',
      severity: 'success'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Tạo Khóa Học Mới
      </Typography>
      
      <Paper sx={{ p: 3, mt: 2 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Tên khóa học"
                name="title"
                value={course.title}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Danh mục</InputLabel>
                <Select
                  value={course.category}
                  name="category"
                  label="Danh mục"
                  onChange={handleChange}
                >
                  <MenuItem value="psychology">Tâm lý học</MenuItem>
                  <MenuItem value="self-help">Phát triển bản thân</MenuItem>
                  <MenuItem value="communication">Kỹ năng giao tiếp</MenuItem>
                  <MenuItem value="relationship">Mối quan hệ</MenuItem>
                  <MenuItem value="stress-management">Quản lý căng thẳng</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Mức độ</InputLabel>
                <Select
                  value={course.difficulty}
                  name="difficulty"
                  label="Mức độ"
                  onChange={handleChange}
                >
                  <MenuItem value="beginner">Cơ bản</MenuItem>
                  <MenuItem value="intermediate">Trung cấp</MenuItem>
                  <MenuItem value="advanced">Nâng cao</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Mô tả khóa học"
                name="description"
                value={course.description}
                onChange={handleChange}
                variant="outlined"
                multiline
                rows={4}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
                sx={{ mb: 2 }}
              >
                Tải lên ảnh thumbnail
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleThumbnailChange}
                />
              </Button>
              
              {thumbnailPreview && (
                <Box sx={{ mt: 2, position: 'relative', width: 'fit-content' }}>
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
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
                      setThumbnailPreview(null);
                      setCourse(prev => ({ ...prev, thumbnail: null }));
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Modules
              </Typography>
              
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <List>
                    {course.modules.length === 0 ? (
                      <ListItem>
                        <ListItemText primary="Chưa có module nào. Hãy thêm module đầu tiên." />
                      </ListItem>
                    ) : (
                      course.modules.map((module, index) => (
                        <React.Fragment key={index}>
                          <ListItem
                            secondaryAction={
                              <Box>
                                <IconButton 
                                  edge="end" 
                                  aria-label="edit"
                                  onClick={() => handleOpenModuleDialog(module, index)}
                                >
                                  <EditIcon />
                                </IconButton>
                                <IconButton 
                                  edge="end" 
                                  aria-label="delete"
                                  onClick={() => handleDeleteModule(index)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            }
                          >
                            <DragIcon sx={{ mr: 2, color: 'text.secondary' }} />
                            <ListItemText 
                              primary={`${index + 1}. ${module.title}`} 
                              secondary={module.videoUrl ? `Video: ${module.videoUrl}` : 'Không có video'} 
                            />
                          </ListItem>
                          {index < course.modules.length - 1 && <Divider />}
                        </React.Fragment>
                      ))
                    )}
                  </List>
                </CardContent>
              </Card>
              
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => handleOpenModuleDialog()}
              >
                Thêm module mới
              </Button>
            </Grid>
            
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
              >
                Lưu khóa học
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      {/* Module Dialog */}
      <Dialog open={openModuleDialog} onClose={handleCloseModuleDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {moduleIndex === -1 ? 'Thêm Module Mới' : 'Chỉnh Sửa Module'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Tên module"
                name="title"
                value={currentModule?.title || ''}
                onChange={handleModuleChange}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="URL Video (nếu có)"
                name="videoUrl"
                value={currentModule?.videoUrl || ''}
                onChange={handleModuleChange}
                variant="outlined"
                placeholder="https://example.com/video.mp4"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Thời lượng (phút)"
                name="duration"
                type="number"
                value={currentModule?.duration || ''}
                onChange={handleModuleChange}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Nội dung module"
                name="content"
                value={currentModule?.content || ''}
                onChange={handleModuleChange}
                variant="outlined"
                multiline
                rows={6}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModuleDialog}>Hủy</Button>
          <Button 
            onClick={handleSaveModule} 
            variant="contained"
            disabled={!currentModule?.title || !currentModule?.content}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
      
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

export default CreateCourse; 