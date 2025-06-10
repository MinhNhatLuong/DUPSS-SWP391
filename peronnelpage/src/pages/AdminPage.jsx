import React, { useState } from 'react';
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

const roleColors = {
  member: '#1976d2',
  staff: '#43a047',
  manager: '#ffd600',
  admin: '#d32f2f',
  consultant: '#8e24aa',
};

const roleList = ['member', 'staff', 'manager', 'admin', 'consultant'];
const genderList = ['male', 'female', 'other'];

function randomDegree() {
  const degrees = ['MBA', 'PhD', 'MSc', 'BSc', 'MD', 'None'];
  return degrees[Math.floor(Math.random() * degrees.length)];
}

function createFakeUser(id) {
  const role = roleList[Math.floor(Math.random() * roleList.length)];
  return {
    id,
    username: `user${id}`,
    password: 'password',
    fullname: `User ${id} Fullname`,
    gender: genderList[Math.floor(Math.random() * genderList.length)],
    name: `User ${id}`,
    avatar: '/Logo_Website_Blue.png',
    email: `user${id}@email.com`,
    phone: Math.random() > 0.5 ? `09${Math.floor(10000000 + Math.random() * 89999999)}` : '',
    address: Math.random() > 0.5 ? `Address ${id}` : '',
    role,
    degree: role === 'consultant' ? randomDegree() : undefined,
  };
}

const initialUsers = Array.from({ length: 37 }, (_, i) => createFakeUser(i + 1));

const searchCategories = [
  { value: 'all', label: 'All' },
  { value: 'id', label: 'ID' },
  { value: 'username', label: 'Username' },
  { value: 'fullname', label: 'Full Name' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'address', label: 'Address' },
  { value: 'role', label: 'Role' },
  { value: 'degree', label: 'Degree' },
];

const sortableFields = [
  { key: 'id', label: 'ID' },
  { key: 'username', label: 'Username' },
  { key: 'fullname', label: 'Full Name' },
  { key: 'gender', label: 'Gender' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'address', label: 'Address' },
  { key: 'role', label: 'User Role' },
  { key: 'degree', label: 'Degree' },
];

export default function AdminPage() {
  const [users, setUsers] = useState(initialUsers);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({
    username: '',
    password: '',
    fullname: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
    role: 'member',
    degree: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [searchCategory, setSearchCategory] = useState('all');
  const [orderBy, setOrderBy] = useState('fullname');
  const [order, setOrder] = useState('asc');

  const userName = 'Admin';

  const handleLogout = () => {
    // TODO: Thay bằng logic đăng xuất thực tế
    alert('Logged out!');
  };

  // Search theo category
  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    if (!q) return true;
    if (searchCategory === 'all') {
      return (
        u.id.toString().includes(q) ||
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.fullname && u.fullname.toLowerCase().includes(q)) ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.toLowerCase().includes(q)) ||
        (u.address && u.address.toLowerCase().includes(q)) ||
        (u.role && u.role.toLowerCase().includes(q)) ||
        (u.degree && u.degree.toLowerCase().includes(q))
      );
    }
    if (searchCategory === 'id') return u.id.toString().includes(q);
    if (searchCategory === 'username') return (u.username || '').toLowerCase().includes(q);
    if (searchCategory === 'fullname') return (u.fullname || '').toLowerCase().includes(q);
    if (searchCategory === 'email') return (u.email || '').toLowerCase().includes(q);
    if (searchCategory === 'phone') return (u.phone || '').toLowerCase().includes(q);
    if (searchCategory === 'address') return (u.address || '').toLowerCase().includes(q);
    if (searchCategory === 'role') return (u.role || '').toLowerCase().includes(q);
    if (searchCategory === 'degree') return (u.degree || '').toLowerCase().includes(q);
    return true;
  });

  // Hàm sort
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

  const handleDelete = (id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setSelected((prev) => prev.filter((sid) => sid !== id));
  };

  const handleDeleteSelected = () => {
    setUsers((prev) => prev.filter((u) => !selected.includes(u.id)));
    setSelected([]);
  };

  const handleOpenDialog = (user = null) => {
    setEditUser(user);
    setForm(
      user
        ? {
            username: user.username || '',
            password: '',
            fullname: user.fullname || '',
            gender: user.gender || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || '',
            role: user.role || 'member',
            degree: user.degree || '',
          }
        : {
            username: '',
            password: '',
            fullname: '',
            gender: '',
            email: '',
            phone: '',
            address: '',
            role: 'member',
            degree: '',
          }
    );
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditUser(null);
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'avatar') {
      if (files && files[0]) {
        setAvatarFile(files[0]);
        setForm((prev) => ({ ...prev, avatar: URL.createObjectURL(files[0]) }));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!form.username) errors.username = 'Username is required';
    if (!editUser && !form.password) errors.password = 'Password is required';
    if (!form.fullname) errors.fullname = 'Full name is required';
    if (!form.gender) errors.gender = 'Gender is required';
    if (!form.email) errors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Invalid email format';
    if (form.role === 'consultant' && !form.degree) errors.degree = 'Degree is required for consultant';
    return errors;
  };

  const handleSave = () => {
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    if (editUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editUser.id
            ? {
                ...u,
                ...form,
                degree: form.role === 'consultant' ? form.degree : undefined,
                avatar: form.avatar || u.avatar,
              }
            : u
        )
      );
    } else {
      const newId = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1;
      setUsers((prev) => [
        ...prev,
        {
          id: newId,
          ...form,
          degree: form.role === 'consultant' ? form.degree : undefined,
          avatar: form.avatar || '/Logo_Website_Blue.png',
        },
      ]);
    }
    setAvatarFile(null);
    handleCloseDialog();
  };

  // Xử lý khi click tiêu đề cột
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  return (
    <Box>
      <Box className="admin-container">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={searchCategory}
              label="Category"
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
            placeholder={`Search${searchCategory !== 'all' ? ' ' + searchCategories.find(c => c.value === searchCategory).label : ''}...`}
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
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add User
          </Button>
          {selected.length > 0 && (
            <Button variant="outlined" color="error" onClick={handleDeleteSelected}>
              Delete Selected ({selected.length})
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
                <TableCell>Avatar</TableCell>
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
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedUsers.map((user) => (
                <TableRow key={user.id} selected={isSelected(user.id)}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected(user.id)}
                      onChange={() => handleSelect(user.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Avatar src={user.avatar} alt={user.username} />
                  </TableCell>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.fullname}</TableCell>
                  <TableCell sx={{ textTransform: 'capitalize' }}>{user.gender}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>{user.address}</TableCell>
                  <TableCell>
                    <Box
                      component="span"
                      sx={{
                        background: roleColors[user.role],
                        color: '#fff',
                        borderRadius: '12px',
                        px: 1.5,
                        py: 0.5,
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        textTransform: 'capitalize',
                      }}
                    >
                      {user.role}
                    </Box>
                  </TableCell>
                  <TableCell>{user.role === 'consultant' ? user.degree : ''}</TableCell>
                  <TableCell align="center">
                    <IconButton color="primary" onClick={() => handleOpenDialog(user)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(user.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {pagedUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={13} align="center">
                    No users found.
                  </TableCell>
                </TableRow>
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
        />
      </Box>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editUser ? 'Edit User' : 'Add User'}</DialogTitle>
        <DialogContent sx={{ minWidth: 350 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
            <Avatar src={form.avatar || '/Logo_Website_Blue.png'} sx={{ width: 56, height: 56 }} />
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="avatar-upload"
              type="file"
              name="avatar"
              onChange={handleFormChange}
            />
            <label htmlFor="avatar-upload">
              <IconButton color="primary" component="span" aria-label="upload picture">
                <PhotoCamera />
              </IconButton>
            </label>
          </Box>
          <TextField
            margin="dense"
            label="Username"
            name="username"
            value={form.username}
            onChange={handleFormChange}
            fullWidth
            required
            error={!!formErrors.username}
            helperText={formErrors.username}
          />
          <TextField
            margin="dense"
            label="Password"
            name="password"
            value={form.password}
            onChange={handleFormChange}
            fullWidth
            required={!editUser}
            type="password"
            autoComplete="new-password"
            error={!!formErrors.password}
            helperText={formErrors.password}
          />
          <TextField
            margin="dense"
            label="Full Name"
            name="fullname"
            value={form.fullname}
            onChange={handleFormChange}
            fullWidth
            required
            error={!!formErrors.fullname}
            helperText={formErrors.fullname}
          />
          <FormControl fullWidth margin="dense" error={!!formErrors.gender}>
            <InputLabel>Gender</InputLabel>
            <Select
              name="gender"
              value={form.gender}
              label="Gender"
              onChange={handleFormChange}
              required
            >
              {genderList.map((g) => (
                <MenuItem value={g} key={g} sx={{ textTransform: 'capitalize' }}>
                  {g}
                </MenuItem>
              ))}
            </Select>
            {formErrors.gender && <FormHelperText>{formErrors.gender}</FormHelperText>}
          </FormControl>
          <TextField
            margin="dense"
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
            margin="dense"
            label="Phone (optional)"
            name="phone"
            value={form.phone}
            onChange={handleFormChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Address (optional)"
            name="address"
            value={form.address}
            onChange={handleFormChange}
            fullWidth
          />
          <FormControl fullWidth margin="dense" error={!!formErrors.role}>
            <InputLabel>Role</InputLabel>
            <Select
              name="role"
              value={form.role}
              label="Role"
              onChange={handleFormChange}
              required
            >
              {roleList.map((role) => (
                <MenuItem value={role} key={role} sx={{ textTransform: 'capitalize' }}>
                  {role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {form.role === 'consultant' && (
            <TextField
              margin="dense"
              label="Degree"
              name="degree"
              value={form.degree}
              onChange={handleFormChange}
              fullWidth
              required
              error={!!formErrors.degree}
              helperText={formErrors.degree}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 