import { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Box, 
  Container, 
  InputBase, 
  Button, 
  IconButton,
  Menu,
  MenuItem,
  styled
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const HeaderWrapper = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#fff',
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
  color: '#333',
  position: 'static',
  zIndex: 1100
}));

const LogoImg = styled('img')({
  height: 50,
  marginRight: '20px'
});

const SearchBox = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '40%',
  borderRadius: 4,
  border: '1px solid #ddd',
  marginLeft: 0,
  '& .MuiInputBase-root': {
    width: '100%',
  },
  [theme.breakpoints.down('md')]: {
    width: '50%',
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    margin: '10px 0',
  }
}));

const SearchIconWrapper = styled(Box)(({ theme }) => ({
  padding: '0 15px',
  height: '100%',
  position: 'absolute',
  right: 0,
  top: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#0056b3',
  borderRadius: '0 4px 4px 0',
  cursor: 'pointer',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  padding: '10px 15px',
  paddingRight: '50px',
  width: '100%',
  fontSize: '0.9rem'
}));

const AuthButton = styled(Button)(({ theme, variant }) => ({
  marginLeft: '10px',
  padding: '8px 15px',
  borderRadius: '4px',
  fontWeight: 500,
  ...(variant === 'outlined' && {
    color: '#0056b3',
    border: '1px solid #0056b3',
    '&:hover': {
      backgroundColor: 'rgba(0, 86, 179, 0.04)'
    }
  }),
  ...(variant === 'contained' && {
    backgroundColor: '#0056b3',
    color: 'white',
    '&:hover': {
      backgroundColor: '#003d82',
    }
  }),
  [theme.breakpoints.down('sm')]: {
    marginLeft: '5px',
    padding: '6px 12px',
    fontSize: '0.85rem'
  }
}));

const UserMenuButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#0056b3',
  color: 'white',
  padding: '10px 15px',
  borderRadius: '4px',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#003d82',
  }
}));

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Mock state for demonstration

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  return (
    <HeaderWrapper>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
          py: { xs: 1, sm: 0 }
        }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <a href="/">
              <LogoImg src="/Logo_Website_Blue.png" alt="DUPSS Logo" />
            </a>
          </Box>

          {/* Search Bar */}
          <SearchBox>
            <StyledInputBase 
              placeholder="Tìm kiếm..." 
              inputProps={{ 'aria-label': 'search' }}
            />
            <SearchIconWrapper>
              <SearchIcon sx={{ color: 'white' }} />
            </SearchIconWrapper>
          </SearchBox>

          {/* User Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: { xs: 1, sm: 0 } }}>
            {!isLoggedIn ? (
              // Auth Buttons for guests
              <Box>
                <AuthButton variant="outlined" href="/login">
                  Đăng nhập
                </AuthButton>
                <AuthButton variant="contained" href="/register">
                  Đăng ký
                </AuthButton>
              </Box>
            ) : (
              // User dropdown for logged in users
              <Box>
                <UserMenuButton 
                  endIcon={<KeyboardArrowDownIcon />} 
                  onClick={handleOpenMenu}
                >
                  Tài khoản
                </UserMenuButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleCloseMenu}
                >
                  <MenuItem onClick={handleCloseMenu} component="a" href="/profile">
                    Hồ sơ
                  </MenuItem>
                  <MenuItem onClick={handleCloseMenu} component="a" href="#">
                    Đăng xuất
                  </MenuItem>
                </Menu>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </HeaderWrapper>
  );
};

export default Header; 