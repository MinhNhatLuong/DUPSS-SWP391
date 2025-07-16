import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Topic as TopicIcon
} from '@mui/icons-material';
import { getAccessToken } from '../../utils/auth';
import apiClient from '../../services/apiService';

export default function Topic() {
  const [topics, setTopics] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOption, setFilterOption] = useState('all');
  const [sortOption, setSortOption] = useState('all');

  // Edit dialog state
  const [editDialog, setEditDialog] = useState({
    open: false,
    topic: null,
    name: '',
    description: ''
  });

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: null, // 'edit' or 'delete'
    topicId: null,
    loading: false
  });

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch all topics on component mount
  useEffect(() => {
    fetchTopics();
  }, []);

  // Function to parse different date formats
  const parseDate = (dateString) => {
    if (!dateString) return new Date(0);
    
    try {
      // Handle format like "DD/MM/YYYY HH:MM"
      if (typeof dateString === 'string' && dateString.includes('/')) {
        const [datePart, timePart = '00:00'] = dateString.split(' ');
        const [day, month, year] = datePart.split('/');
        return new Date(`${year}-${month}-${day} ${timePart}`);
      }
      
      // Handle ISO date format or timestamp
      return new Date(dateString);
    } catch (error) {
      console.error('Error parsing date:', dateString, error);
      return new Date(0);
    }
  };

  // Apply filters and search whenever topics, sortOption, or searchTerm changes
  useEffect(() => {
    applyFiltersAndSearch();
  }, [topics, sortOption, searchTerm]);

  // Fetch topics from API - chỉ dùng khi component mount
  const fetchTopics = async () => {
    setLoading(true);
    try {
      // Mặc định ban đầu hiển thị tất cả chủ đề
      let response;
      if (filterOption === 'my-topics') {
        response = await apiClient.get('/topics/me', {
          headers: { Authorization: `Bearer ${getAccessToken()}` }
        });
      } else {
        response = await apiClient.get('/topics', {
          headers: { Authorization: `Bearer ${getAccessToken()}` }
        });
      }
      
      setTopics(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching topics:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Đã xảy ra lỗi khi tải danh sách chủ đề'
      );
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and search to topics
  const applyFiltersAndSearch = () => {
    let result = [...topics];

    // Filter is already applied at API level when fetching data
    // We don't need to filter again here

    // Apply search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(topic => 
        (topic.id && topic.id.toString().includes(searchTerm)) ||
        (topic.topicName && topic.topicName.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    switch (sortOption) {
      case 'newest-created':
        result.sort((a, b) => {
          // Chuyển đổi chuỗi ngày tháng sang Date object để so sánh
          const dateA = a.createdAt ? parseDate(a.createdAt) : new Date(0);
          const dateB = b.createdAt ? parseDate(b.createdAt) : new Date(0);
          return dateB - dateA;
        });
        break;
      case 'oldest-created':
        result.sort((a, b) => {
          const dateA = a.createdAt ? parseDate(a.createdAt) : new Date(0);
          const dateB = b.createdAt ? parseDate(b.createdAt) : new Date(0);
          return dateA - dateB;
        });
        break;
      case 'newest-updated':
        result.sort((a, b) => {
          const dateA = a.updatedAt ? parseDate(a.updatedAt) : new Date(0);
          const dateB = b.updatedAt ? parseDate(b.updatedAt) : new Date(0);
          return dateB - dateA;
        });
        break;
      case 'oldest-updated':
        result.sort((a, b) => {
          const dateA = a.updatedAt ? parseDate(a.updatedAt) : new Date(0);
          const dateB = b.updatedAt ? parseDate(b.updatedAt) : new Date(0);
          return dateA - dateB;
        });
        break;
      case 'all':
      default:
        // Không sắp xếp, giữ nguyên thứ tự từ API
        break;
    }

    setFilteredTopics(result);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Không xác định';
    
    try {
      // Handle different date formats
      let date;
      if (typeof dateString === 'string' && dateString.includes('/')) {
        // Format: DD/MM/YYYY HH:MM
        const [datePart, timePart] = dateString.split(' ');
        const [day, month, year] = datePart.split('/');
        date = new Date(`${year}-${month}-${day}${timePart ? ' ' + timePart : ''}`);
      } else {
        date = new Date(dateString);
      }
      
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Handle edit button click
  const handleEditClick = (topic) => {
    setEditDialog({
      open: true,
      topic,
      name: topic.topicName || '',
      description: topic.topicDescription || ''
    });
  };

  // Handle delete button click
  const handleDeleteClick = (topicId) => {
    setConfirmDialog({
      open: true,
      type: 'delete',
      topicId,
      loading: false
    });
  };

  // Handle edit dialog close
  const handleEditDialogClose = () => {
    setEditDialog({
      ...editDialog,
      open: false
    });
  };

  // Handle edit dialog save
  const handleEditDialogSave = () => {
    // Validate form
    if (!editDialog.name.trim()) {
      setSnackbar({
        open: true,
        message: 'Tên chủ đề không được để trống',
        severity: 'error'
      });
      return;
    }

    // Open confirm dialog
    setConfirmDialog({
      open: true,
      type: editDialog.topic ? 'edit' : 'create',
      topicId: editDialog.topic ? editDialog.topic.id : null,
      loading: false
    });
  };

  // Handle confirm dialog action
  const handleConfirmAction = async () => {
    try {
      // Set loading state
      setConfirmDialog(prev => ({ ...prev, loading: true }));
      
      // Show loading notification
      setSnackbar({
        open: true,
        message: confirmDialog.type === 'create' ? 'Chủ đề đang được tạo...' : 'Đang xử lý...',
        severity: 'warning'
      });

      if (confirmDialog.type === 'create') {
        // Create new topic
        const response = await apiClient.post(
          '/manager/topic',
          {
            name: editDialog.name,
            description: editDialog.description
          },
          {
            headers: {
              Authorization: `Bearer ${getAccessToken()}`
            }
          }
        );

        // Add new topic to the list
        setTopics([response.data, ...topics]);

        // Show success notification
        setSnackbar({
          open: true,
          message: 'Chủ đề đã được tạo thành công',
          severity: 'success'
        });

        // Close dialogs
        setEditDialog({
          ...editDialog,
          open: false
        });
      } else if (confirmDialog.type === 'edit') {
        // Update topic
        await apiClient.patch(
          `/manager/topic/${confirmDialog.topicId}`,
          {
            name: editDialog.name,
            description: editDialog.description
          },
          {
            headers: {
              Authorization: `Bearer ${getAccessToken()}`
            }
          }
        );

        // Update local state
        setTopics(topics.map(topic => 
          topic.id === confirmDialog.topicId 
            ? { 
                ...topic, 
                topicName: editDialog.name, 
                topicDescription: editDialog.description,
                updatedAt: new Date().toISOString()
              } 
            : topic
        ));

        // Show success notification
        setSnackbar({
          open: true,
          message: 'Chủ đề đã được chỉnh sửa thành công',
          severity: 'success'
        });

        // Close dialogs
        setEditDialog({
          ...editDialog,
          open: false
        });
      } else if (confirmDialog.type === 'delete') {
        // Delete topic using PATCH to update status
        await apiClient.patch(`/manager/topic/delete/${confirmDialog.topicId}`, {}, {
          headers: {
            Authorization: `Bearer ${getAccessToken()}`
          }
        });

        // Update local state
        setTopics(topics.filter(topic => topic.id !== confirmDialog.topicId));

        // Show success notification
        setSnackbar({
          open: true,
          message: 'Chủ đề đã được xóa thành công',
          severity: 'success'
        });
      }

      // Close confirm dialog
      setConfirmDialog({
        open: false,
        type: null,
        topicId: null,
        loading: false
      });
    } catch (err) {
      console.error('Error performing action:', err);
      setSnackbar({
        open: true,
        message: `Không thể ${confirmDialog.type === 'edit' ? 'chỉnh sửa' : 'xóa'} chủ đề: ${err.response?.data?.message || err.message}`,
        severity: 'error'
      });
      setConfirmDialog(prev => ({ ...prev, loading: false }));
    }
  };

  // Handle filter change
  const handleFilterChange = async (event) => {
    const value = event.target.value;
    
    // Cập nhật state trước, rồi sau đó mới gọi API
    setFilterOption(value);
    
    // Tạm ngưng một chút để đảm bảo state đã được cập nhật
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Bây giờ gọi API với filterOption đã được cập nhật
    try {
      setLoading(true);
      let response;
      
      if (value === 'my-topics') {
        // Lấy chỉ chủ đề của tôi
        response = await apiClient.get('/topics/me', {
          headers: { Authorization: `Bearer ${getAccessToken()}` }
        });
      } else {
        // Lấy tất cả chủ đề
        response = await apiClient.get('/topics', {
          headers: { Authorization: `Bearer ${getAccessToken()}` }
        });
      }
      
      setTopics(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching topics:', err);
      setError(err.message || 'Đã xảy ra lỗi khi tải danh sách chủ đề');
    } finally {
      setLoading(false);
    }
  };

  // Create a new topic
  const handleCreateTopic = () => {
    setEditDialog({
      open: true,
      topic: null,
      name: '',
      description: ''
    });
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  // Hàm xử lý khi thay đổi tùy chọn sắp xếp
  const handleSortChange = (event) => {
    console.log('Sort option changed to:', event.target.value);
    setSortOption(event.target.value);
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f7fa', minHeight: 'calc(100vh - 64px)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="text.primary">
          Quản Lý Chủ Đề
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<TopicIcon />}
          onClick={handleCreateTopic}
        >
          Tạo chủ đề mới
        </Button>
      </Box>

      {/* Filters and Search */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Lọc chủ đề</InputLabel>
          <Select
            value={filterOption}
            label="Lọc chủ đề"
            onChange={handleFilterChange}
          >
            <MenuItem value="all">Tất cả chủ đề</MenuItem>
            <MenuItem value="my-topics">Chủ đề của tôi</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Sắp xếp theo</InputLabel>
          <Select
            value={sortOption}
            label="Sắp xếp theo"
            onChange={handleSortChange}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="newest-created">Tạo gần đây nhất</MenuItem>
            <MenuItem value="oldest-created">Tạo cũ nhất</MenuItem>
            <MenuItem value="newest-updated">Cập nhật gần đây nhất</MenuItem>
            <MenuItem value="oldest-updated">Cập nhật cũ nhất</MenuItem>
          </Select>
        </FormControl>

        <TextField
          size="small"
          placeholder="Tìm kiếm theo ID hoặc tên"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Topics Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : filteredTopics.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          Không tìm thấy chủ đề nào
        </Alert>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell width="5%" align="center">ID</TableCell>
                <TableCell width="15%">Tên chủ đề</TableCell>
                <TableCell width="35%">Mô tả</TableCell>
                <TableCell width="12%">Thời gian tạo</TableCell>
                <TableCell width="12%">Thời gian sửa</TableCell>
                <TableCell width="13%">Người tạo</TableCell>
                <TableCell width="8%" align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTopics.map((topic) => (
                <TableRow key={topic.id} hover>
                  <TableCell align="center">{topic.id}</TableCell>
                  <TableCell sx={{ fontWeight: 'medium' }}>{topic.topicName}</TableCell>
                  <TableCell>
                    <Tooltip title={topic.topicDescription || ''} placement="top-start">
                      <Typography
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {topic.topicDescription || 'Không có mô tả'}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{formatDate(topic.createdAt)}</TableCell>
                  <TableCell>{formatDate(topic.updatedAt)}</TableCell>
                  <TableCell>{topic.creatorName || 'Không xác định'}</TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <IconButton
                        size="small"
                        color="primary" 
                        onClick={() => handleEditClick(topic)}
                        sx={{ mr: 1 }}
                        title="Chỉnh sửa"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error" 
                        onClick={() => handleDeleteClick(topic.id)}
                        title="Xóa"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onClose={handleEditDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editDialog.topic ? 'Chỉnh sửa chủ đề' : 'Tạo chủ đề mới'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="normal"
            label="Tên chủ đề"
            fullWidth
            value={editDialog.name}
            onChange={(e) => setEditDialog({ ...editDialog, name: e.target.value })}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            margin="normal"
            label="Mô tả"
            fullWidth
            multiline
            rows={4}
            value={editDialog.description}
            onChange={(e) => setEditDialog({ ...editDialog, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose}>Hủy</Button>
          <Button variant="contained" onClick={handleEditDialogSave}>
            {editDialog.topic ? 'Lưu' : 'Tạo'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => !confirmDialog.loading && setConfirmDialog({ ...confirmDialog, open: false })}
      >
        <DialogTitle>
          {confirmDialog.type === 'edit' 
            ? 'Xác nhận chỉnh sửa' 
            : confirmDialog.type === 'create'
              ? 'Xác nhận tạo mới'
              : 'Xác nhận xóa'
          }
        </DialogTitle>
        <DialogContent>
          <Typography>
            {confirmDialog.type === 'edit'
              ? 'Bạn có muốn sửa lại nội dung của chủ đề này không?'
              : confirmDialog.type === 'create'
                ? 'Bạn có muốn tạo chủ đề mới này không?'
                : 'Bạn có chắc chắn muốn xóa chủ đề này không?'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmDialog({ ...confirmDialog, open: false })} 
            disabled={confirmDialog.loading}
          >
            Không
          </Button>
          <Button 
            variant="contained"
            color={confirmDialog.type === 'delete' ? 'error' : 'primary'}
            onClick={handleConfirmAction}
            disabled={confirmDialog.loading}
            startIcon={confirmDialog.loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {confirmDialog.loading
              ? 'Đang xử lý...'
              : confirmDialog.type === 'edit'
                ? 'Có, chỉnh sửa'
                : confirmDialog.type === 'create'
                  ? 'Có, tạo mới'
                  : 'Có, xóa'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 