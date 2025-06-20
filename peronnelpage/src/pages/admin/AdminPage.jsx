import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import TablePagination from '@mui/material/TablePagination';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import TableSortLabel from '@mui/material/TableSortLabel';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getAccessToken, isAuthenticated, logout } from '../../utils/auth';

const roleColors = {
  'ROLE_MEMBER': '#1976d2',
  'ROLE_STAFF': '#43a047',
  'ROLE_MANAGER': '#ffd600',
  'ROLE_ADMIN': '#d32f2f',
  'ROLE_CONSULTANT': '#8e24aa',
  'ROLE_GUEST': '#757575',
};

const roleList = ['ROLE_MEMBER', 'ROLE_STAFF', 'ROLE_CONSULTANT', 'ROLE_MANAGER', 'ROLE_ADMIN'];
const genderList = ['male', 'female', 'other'];

const API_URL = 'http://localhost:8080'; // Update with your actual API base URL

const searchCategories = [
  { value: 'all', label: 'Tất cả' },
  { value: 'id', label: 'ID' },
  { value: 'fullName', label: 'Họ và tên' },
];

const filterCategories = [
  { value: 'all', label: 'Tất cả' },
  { value: 'gender', label: 'Giới tính' },
  { value: 'role', label: 'Vai trò' },
];

const sortableFields = [
  { key: 'id', label: 'ID' },
  { key: 'username', label: 'Tên đăng nhập' },
  { key: 'fullName', label: 'Họ và tên' },
  { key: 'gender', label: 'Giới tính' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Số điện thoại' },
  { key: 'address', label: 'Địa chỉ' },
  { key: 'role', label: 'Vai trò' },
];

// Create axios instance with authorization header
const api = axios.create({
  baseURL: API_URL,
});

// Add request interceptor to include the token in each request
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: '', message: '' });
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({
    username: '',
    password: '',
    fullname: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
    role: 'ROLE_MEMBER',
  });
  const [processing, setProcessing] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [formErrors, setFormErrors] = useState({});
  const [searchCategory, setSearchCategory] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterValue, setFilterValue] = useState('all');
  const [orderBy, setOrderBy] = useState('id');
  const [order, setOrder] = useState('asc');
  
  const navigate = useNavigate();

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch users data on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const apiResponse = await api.get('/api/admin/users');
      setUsers(apiResponse.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      
      if (error.response && error.response.status === 401) {
        setNotification({
          open: true,
          message: 'Không có quyền truy cập. Vui lòng đăng nhập lại.',
          severity: 'error'
        });
        // Redirect to login after a short delay
        setTimeout(() => {
          logout(() => navigate('/login'));
        }, 2000);
      } else {
        setNotification({
          open: true,
          message: 'Không thể tải danh sách người dùng',
          severity: 'error'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout(() => navigate('/login'));
  };

  // Filter users based on search and filter criteria
  const filteredUsers = users.filter((user) => {
    // Apply search filter
    const q = search.toLowerCase();
    let searchMatch = true;
    
    if (q) {
      if (searchCategory === 'all') {
        searchMatch = 
          user.id.toString().includes(q) || 
          (user.fullName && user.fullName.toLowerCase().includes(q));
      } else if (searchCategory === 'id') {
        searchMatch = user.id.toString().includes(q);
      } else if (searchCategory === 'fullName') {
        searchMatch = (user.fullName || '').toLowerCase().includes(q);
      }
    }

    // Apply additional filters
    let filterMatch = true;
    if (filterCategory !== 'all' && filterValue !== 'all') {
      if (filterCategory === 'gender') {
        filterMatch = user.gender === filterValue;
      } else if (filterCategory === 'role') {
        filterMatch = user.role === filterValue;
      }
    }

    return searchMatch && filterMatch;
  });

  // Sort function
  function sortComparator(a, b, key) {
    if (key === 'id') return order === 'asc' ? a.id - b.id : b.id - a.id;
    const valA = (a[key] || '').toString().toLowerCase();
    const valB = (b[key] || '').toString().toLowerCase();
    if (valA < valB) return order === 'asc' ? -1 : 1;
    if (valA > valB) return order === 'asc' ? 1 : -1;
    return 0;
  }

  const sortedUsers = [...filteredUsers].sort((a, b) => sortComparator(a, b, orderBy));
  const pagedUsers = sortedUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const isSelected = (id) => selected.indexOf(id) !== -1;
  const allSelected = pagedUsers.length > 0 && pagedUsers.every((u) => selected.includes(u.id));

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected([...new Set([...selected, ...pagedUsers.map((u) => u.id)])]);
    } else {
      setSelected(selected.filter((id) => !pagedUsers.some((u) => u.id === id)));
    }
  };

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleOpenDeleteConfirm = (userId) => {
    setEditUser(users.find(u => u.id === userId));
    setConfirmDialog({
      open: true,
      type: 'delete',
      message: 'Bạn có muốn xóa người dùng này không?'
    });
  };

  const handleDelete = async () => {
    if (!editUser) return;
    
    setProcessing(true);
    try {
      await api.delete(`/api/admin/users/${editUser.id}`);
      setUsers(prev => prev.filter(u => u.id !== editUser.id));
      setSelected(prev => prev.filter(id => id !== editUser.id));
      setNotification({
        open: true,
        message: 'Người dùng đã được xóa khỏi hệ thống',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      setNotification({
        open: true,
        message: 'Không thể xóa người dùng',
        severity: 'error'
      });
    } finally {
      setProcessing(false);
      setConfirmDialog({ open: false, type: '', message: '' });
      setEditUser(null);
    }
  };

  const handleDeleteSelected = () => {
    setConfirmDialog({
      open: true,
      type: 'deleteMultiple',
      message: `Bạn có muốn xóa ${selected.length} người dùng này không?`
    });
  };

  const deleteSelectedUsers = async () => {
    setProcessing(true);
    
    try {
      await Promise.all(selected.map(id => api.delete(`/api/admin/users/${id}`)));
      setUsers(prev => prev.filter(user => !selected.includes(user.id)));
      setSelected([]);
      setNotification({
        open: true,
        message: 'Các người dùng đã được xóa khỏi hệ thống',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting multiple users:', error);
      setNotification({
        open: true,
        message: 'Không thể xóa người dùng',
        severity: 'error'
      });
    } finally {
      setProcessing(false);
      setConfirmDialog({ open: false, type: '', message: '' });
    }
  };

  const handleOpenDialog = (user = null) => {
    setEditUser(user);
    setForm(
      user
        ? {
            username: user.username || '',
            fullname: user.fullName || '',
            gender: user.gender || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || '',
            role: user.role || 'ROLE_MEMBER',
            password: '', // We don't set password when editing
          }
        : {
            username: '',
            password: '',
            fullname: '',
            gender: '',
            email: '',
            phone: '',
            address: '',
            role: 'ROLE_MEMBER',
          }
    );
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditUser(null);
    setFormErrors({});
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = {};
    if (!form.username) errors.username = 'Tên đăng nhập là bắt buộc';
    if (!editUser && !form.password) errors.password = 'Mật khẩu là bắt buộc';
    if (!form.fullname) errors.fullname = 'Họ tên là bắt buộc';
    if (!form.phone) errors.phone = 'Số điện thoại là bắt buộc';
    if (!form.email) errors.email = 'Email là bắt buộc';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Định dạng email không hợp lệ';
    return errors;
  };

  const handleSubmitForm = () => {
    const errors = validateForm();
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) return;
    
    setConfirmDialog({
      open: true,
      type: editUser ? 'edit' : 'add',
      message: editUser 
        ? 'Bạn có muốn sửa lại thông tin người dùng này không?'
        : 'Bạn có muốn thêm người dùng này không?'
    });
  };

  const handleAddUser = async () => {
    setProcessing(true);
    
    try {
      const payload = {
        username: form.username,
        password: form.password,
        fullname: form.fullname,
        gender: form.gender || null,
        email: form.email,
        phone: form.phone,
        address: form.address || null,
        role: form.role
      };
      
      const response = await api.post(`/api/admin/users`, payload);
      setUsers(prev => [...prev, response.data]);
      
      setNotification({
        open: true,
        message: 'Người dùng đã được thêm vào',
        severity: 'success'
      });
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error adding user:', error);
      setNotification({
        open: true,
        message: 'Không thể thêm người dùng',
        severity: 'error'
      });
    } finally {
      setProcessing(false);
      setConfirmDialog({ open: false, type: '', message: '' });
    }
  };

  const handleUpdateUser = async () => {
    setProcessing(true);
    
    try {
      const payload = {
        fullname: form.fullname,
        gender: form.gender || null,
        email: form.email,
        phone: form.phone,
        address: form.address || null,
        role: form.role
      };
      
      await api.patch(`/api/admin/users/${editUser.id}`, payload);
      
      // Update local state
      setUsers(prev => 
        prev.map(u => 
          u.id === editUser.id 
            ? { 
                ...u, 
                fullName: form.fullname, 
                gender: form.gender,
                email: form.email,
                phone: form.phone,
                address: form.address,
                role: form.role
              } 
            : u
        )
      );
      
      setNotification({
        open: true,
        message: 'Người dùng đã được cập nhật',
        severity: 'success'
      });
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error updating user:', error);
      setNotification({
        open: true,
        message: 'Không thể cập nhật người dùng',
        severity: 'error'
      });
    } finally {
      setProcessing(false);
      setConfirmDialog({ open: false, type: '', message: '' });
    }
  };

  // Handle confirmation dialog actions
  const handleConfirmAction = () => {
    switch(confirmDialog.type) {
      case 'add':
        handleAddUser();
        break;
      case 'edit':
        handleUpdateUser();
        break;
      case 'delete':
        handleDelete();
        break;
      case 'deleteMultiple':
        deleteSelectedUsers();
        break;
      default:
        setConfirmDialog({ open: false, type: '', message: '' });
    }
  };

  // Handle notification close
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Handle sorting
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Handle filter category change
  const handleFilterCategoryChange = (event) => {
    setFilterCategory(event.target.value);
    setFilterValue('all');
  };

  // Get filter options based on selected category
  const getFilterOptions = () => {
    if (filterCategory === 'gender') {
      return [
        { value: 'all', label: 'Tất cả giới tính' },
        { value: 'male', label: 'Nam' },
        { value: 'female', label: 'Nữ' },
        { value: 'other', label: 'Khác' }
      ];
    } else if (filterCategory === 'role') {
      return [
        { value: 'all', label: 'Tất cả vai trò' },
        { value: 'ROLE_MEMBER', label: 'Thành viên' },
        { value: 'ROLE_STAFF', label: 'Nhân viên' },
        { value: 'ROLE_CONSULTANT', label: 'Tư vấn viên' },
        { value: 'ROLE_MANAGER', label: 'Quản lý' },
        { value: 'ROLE_ADMIN', label: 'Quản trị viên' }
      ];
    }
    return [{ value: 'all', label: 'Tất cả' }];
  };

  // Translate role names for display
  const translateRole = (role) => {
    const roleTranslations = {
      'ROLE_MEMBER': 'Thành viên',
      'ROLE_STAFF': 'Nhân viên',
      'ROLE_CONSULTANT': 'Tư vấn viên',
      'ROLE_MANAGER': 'Quản lý',
      'ROLE_ADMIN': 'Quản trị viên',
      'ROLE_GUEST': 'Khách'
    };
    return roleTranslations[role] || role.replace('ROLE_', '');
  };

  // Translate gender for display
  const translateGender = (gender) => {
    if (!gender) return "-";
    const genderTranslations = {
      'male': 'Nam',
      'female': 'Nữ',
      'other': 'Khác'
    };
    return genderTranslations[gender] || gender;
  };

  return (
    <Box>
      <Box className="admin-container" sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1">
            Quản lý người dùng
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
          {/* Search */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Tìm kiếm theo</InputLabel>
            <Select
              value={searchCategory}
              label="Tìm kiếm theo"
              onChange={(e) => setSearchCategory(e.target.value)}
            >
              {searchCategories.map((cat) => (
                <MenuItem value={cat.value} key={cat.value}>{cat.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            variant="outlined"
            size="small"
            placeholder={`Tìm kiếm${searchCategory !== 'all' ? ' theo ' + searchCategories.find(c => c.value === searchCategory).label : ''}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 260 }}
          />

          {/* Filter */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Lọc theo</InputLabel>
            <Select
              value={filterCategory}
              label="Lọc theo"
              onChange={handleFilterCategoryChange}
            >
              {filterCategories.map((cat) => (
                <MenuItem value={cat.value} key={cat.value}>{cat.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {filterCategory !== 'all' && (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>{filterCategory === 'gender' ? 'Giới tính' : 'Vai trò'}</InputLabel>
              <Select
                value={filterValue}
                label={filterCategory === 'gender' ? 'Giới tính' : 'Vai trò'}
                onChange={(e) => setFilterValue(e.target.value)}
              >
                {getFilterOptions().map((option) => (
                  <MenuItem value={option.value} key={option.value}>{option.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Box sx={{ flexGrow: 1 }} />

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Thêm người dùng
          </Button>
          {selected.length > 0 && (
            <Button variant="outlined" color="error" onClick={handleDeleteSelected}>
              Xóa đã chọn ({selected.length})
            </Button>
          )}
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selected.length > 0 && !allSelected}
                    checked={allSelected}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Ảnh đại diện</TableCell>
                {sortableFields.map((field) => (
                  <TableCell key={field.key} sortDirection={orderBy === field.key ? order : false}>
                    <TableSortLabel
                      active={orderBy === field.key}
                      direction={orderBy === field.key ? order : 'asc'}
                      onClick={() => handleRequestSort(field.key)}
                    >
                      {field.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : pagedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    Không tìm thấy người dùng nào.
                  </TableCell>
                </TableRow>
              ) : (
                pagedUsers.map((user) => (
                  <TableRow key={user.id} selected={isSelected(user.id)}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected(user.id)}
                        onChange={() => handleSelect(user.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Avatar src={user.avatar || "/Logo_Website_Blue.png"} alt={user.username} />
                    </TableCell>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>{translateGender(user.gender)}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>{user.address || "-"}</TableCell>
                    <TableCell>
                      <Box
                        component="span"
                        sx={{
                          background: roleColors[user.role] || '#757575',
                          color: '#fff',
                          borderRadius: '12px',
                          px: 1.5,
                          py: 0.5,
                          fontSize: '0.85rem',
                          fontWeight: 500,
                        }}
                      >
                        {translateRole(user.role)}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton color="primary" onClick={() => handleOpenDialog(user)} title="Sửa">
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleOpenDeleteConfirm(user.id)} title="Xóa">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredUsers.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 20, 50]}
          labelRowsPerPage="Số dòng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
          }
        />
      </Box>

      {/* Add/Edit User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editUser ? 'Sửa người dùng' : 'Thêm người dùng'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              label="Tên đăng nhập"
              name="username"
              value={form.username}
              onChange={handleFormChange}
              fullWidth
              required
              error={!!formErrors.username}
              helperText={formErrors.username}
              disabled={!!editUser} // Disable username edit for existing users
            />
            
            {!editUser && (
              <TextField
                margin="normal"
                label="Mật khẩu"
                name="password"
                value={form.password}
                onChange={handleFormChange}
                fullWidth
                required
                type="password"
                error={!!formErrors.password}
                helperText={formErrors.password}
              />
            )}
            
            <TextField
              margin="normal"
              label="Họ và tên"
              name="fullname"
              value={form.fullname}
              onChange={handleFormChange}
              fullWidth
              required
              error={!!formErrors.fullname}
              helperText={formErrors.fullname}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Giới tính</InputLabel>
              <Select
                name="gender"
                value={form.gender}
                label="Giới tính"
                onChange={handleFormChange}
              >
                <MenuItem value="male">Nam</MenuItem>
                <MenuItem value="female">Nữ</MenuItem>
                <MenuItem value="other">Khác</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              margin="normal"
              label="Email"
              name="email"
              value={form.email}
              onChange={handleFormChange}
              fullWidth
              required
              type="email"
              error={!!formErrors.email}
              helperText={formErrors.email}
            />
            
            <TextField
              margin="normal"
              label="Số điện thoại"
              name="phone"
              value={form.phone}
              onChange={handleFormChange}
              fullWidth
              required
              error={!!formErrors.phone}
              helperText={formErrors.phone}
            />
            
            <TextField
              margin="normal"
              label="Địa chỉ (tùy chọn)"
              name="address"
              value={form.address}
              onChange={handleFormChange}
              fullWidth
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Vai trò</InputLabel>
              <Select
                name="role"
                value={form.role}
                label="Vai trò"
                onChange={handleFormChange}
                required
              >
                <MenuItem value="ROLE_MEMBER">Thành viên</MenuItem>
                <MenuItem value="ROLE_STAFF">Nhân viên</MenuItem>
                <MenuItem value="ROLE_CONSULTANT">Tư vấn viên</MenuItem>
                <MenuItem value="ROLE_MANAGER">Quản lý</MenuItem>
                <MenuItem value="ROLE_ADMIN">Quản trị viên</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmitForm} variant="contained" color="primary">
            {editUser ? 'Cập nhật' : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, type: '', message: '' })}>
        <DialogTitle>Xác nhận</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, type: '', message: '' })}>
            Không
          </Button>
          <Button 
            onClick={handleConfirmAction} 
            variant="contained" 
            color="primary"
            disabled={processing}
          >
            {processing ? 'Đang xử lý...' : 'Có'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 