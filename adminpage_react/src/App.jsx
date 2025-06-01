import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  Paper,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Grid,
  Avatar
} from '@mui/material';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarDensitySelector
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import './App.css';

// Theme với màu xanh và trắng
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Xanh chủ đạo
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#ffffff', // Trắng
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
});

// Dữ liệu placeholder cho người dùng
const initialUsers = [
  {
    id: 1,
    name: 'Nguyễn Văn An',
    email: 'an.nguyen@example.com',
    role: 'Admin',
    createdDate: '2024-01-15',
    status: 'Active'
  },
  {
    id: 2,
    name: 'Trần Thị Bình',
    email: 'binh.tran@example.com',
    role: 'Manager',
    createdDate: '2024-01-20',
    status: 'Active'
  },
  {
    id: 3,
    name: 'Lê Văn Cường',
    email: 'cuong.le@example.com',
    role: 'Consultant',
    createdDate: '2024-02-01',
    status: 'Inactive'
  },
  {
    id: 4,
    name: 'Phạm Thị Dung',
    email: 'dung.pham@example.com',
    role: 'Staff',
    createdDate: '2024-02-10',
    status: 'Active'
  },
  {
    id: 5,
    name: 'Hoàng Văn Em',
    email: 'em.hoang@example.com',
    role: 'Member',
    createdDate: '2024-02-15',
    status: 'Active'
  },
  {
    id: 6,
    name: 'Vũ Thị Phương',
    email: 'phuong.vu@example.com',
    role: 'Guest',
    createdDate: '2024-02-20',
    status: 'Active'
  }
];

const roles = ['Guest', 'Member', 'Staff', 'Consultant', 'Manager', 'Admin'];
const statuses = ['Active', 'Inactive'];

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}

function App() {
  const [users, setUsers] = useState(initialUsers);
  const [filteredUsers, setFilteredUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Guest',
    status: 'Active'
  });

  // Tìm kiếm người dùng
  useEffect(() => {
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  // Xử lý mở dialog thêm/sửa
  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'Guest',
        status: 'Active'
      });
    }
    setOpenDialog(true);
  };

  // Xử lý đóng dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'Guest',
      status: 'Active'
    });
  };

  // Xử lý lưu người dùng
  const handleSaveUser = () => {
    if (editingUser) {
      // Cập nhật người dùng
      setUsers(users.map(user =>
        user.id === editingUser.id
          ? { ...user, ...formData }
          : user
      ));
    } else {
      // Thêm người dùng mới
      const newUser = {
        id: Math.max(...users.map(u => u.id)) + 1,
        ...formData,
        createdDate: new Date().toISOString().split('T')[0]
      };
      setUsers([...users, newUser]);
    }
    handleCloseDialog();
  };

  // Xử lý xóa người dùng
  const handleDeleteUser = (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  // Cấu hình cột cho DataGrid
  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 70,
      sortable: true
    },
    {
      field: 'name',
      headerName: 'Họ và tên',
      width: 200,
      sortable: true
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 250,
      sortable: true
    },
    {
      field: 'role',
      headerName: 'Vai trò',
      width: 130,
      sortable: true,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'Admin' ? 'error' : params.value === 'Manager' ? 'warning' : 'primary'}
          size="small"
        />
      )
    },
    {
      field: 'status',
      headerName: 'Trạng thái',
      width: 120,
      sortable: true,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'Active' ? 'success' : 'default'}
          size="small"
        />
      )
    },
    {
      field: 'createdDate',
      headerName: 'Ngày tạo',
      width: 130,
      sortable: true,
      type: 'date',
      valueGetter: (params) => new Date(params.value)
    },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handleOpenDialog(params.row)}
            color="primary"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteUser(params.row.id)}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ flexGrow: 1 }}>
        {/* Header */}
        <AppBar position="static" sx={{ mb: 3 }}>
          <Toolbar>
            <Avatar
              src="/DPUSS_LOGO_WHITE.png"
              alt="DPUSS Logo"
              sx={{ mr: 2, width: 40, height: 40 }}
            />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              DPUSS - Quản lý người dùng
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl">
          {/* Thanh tìm kiếm và nút thêm */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Tìm kiếm theo tên, email hoặc vai trò..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                  fullWidth
                  sx={{ height: 56 }}
                >
                  Thêm người dùng
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Bảng dữ liệu */}
          <Paper sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={filteredUsers}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[5, 10, 20]}
              checkboxSelection
              disableSelectionOnClick
              components={{
                Toolbar: CustomToolbar,
              }}
              sx={{
                '& .MuiDataGrid-root': {
                  border: 'none',
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: 'none',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  borderBottom: 'none',
                },
                '& .MuiDataGrid-virtualScroller': {
                  backgroundColor: theme.palette.background.paper,
                },
                '& .MuiDataGrid-footerContainer': {
                  borderTop: 'none',
                  backgroundColor: theme.palette.background.paper,
                },
              }}
            />
          </Paper>
        </Container>

        {/* Dialog thêm/sửa người dùng */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Họ và tên"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                margin="normal"
                required
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Vai trò</InputLabel>
                <Select
                  value={formData.role}
                  label="Vai trò"
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  {roles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={formData.status}
                  label="Trạng thái"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {statuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Hủy</Button>
            <Button
              onClick={handleSaveUser}
              variant="contained"
              disabled={!formData.name || !formData.email}
            >
              {editingUser ? 'Cập nhật' : 'Thêm'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}

export default App;
