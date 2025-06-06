import { useState } from 'react';
import { 
  Box, 
  Container, 
  styled, 
  List, 
  ListItem, 
  ListItemButton,
  ListItemText,
  IconButton,
  Drawer,
  useMediaQuery,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const NavbarWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: '#0056b3',
  width: '100%',
  position: 'sticky',
  top: 0,
  zIndex: 1000,
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
}));

const NavList = styled(List)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  padding: 0,
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column'
  }
}));

const NavItem = styled(ListItem)(({ theme }) => ({
  width: 'auto',
  padding: 0,
  position: 'relative',
  [theme.breakpoints.down('md')]: {
    width: '100%'
  }
}));

const NavLink = styled(ListItemButton)(({ theme, active }) => ({
  color: 'white',
  padding: '15px 20px',
  fontWeight: 500,
  transition: 'background-color 0.3s',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  },
  ...(active && {
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  })
}));

const MobileNavToggle = styled(IconButton)(({ theme }) => ({
  color: 'white',
  display: 'none',
  [theme.breakpoints.down('md')]: {
    display: 'block'
  }
}));

const navItems = [
  { name: 'Trang chủ', path: '/', active: true },
  { name: 'Khóa học', path: '/courses' },
  { name: 'Blogs & Thông tin', path: '/blogs' },
  { name: 'Khảo sát', path: '/survey' },
  { name: 'Đặt lịch hẹn', path: '/appointment' },
  { name: 'Về chúng tôi', path: '/about-us' }
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const renderNavItems = () => (
    <NavList>
      {navItems.map((item) => (
        <NavItem key={item.name} disablePadding>
          <NavLink
            active={item.active ? 1 : 0}
            component="a"
            href={item.path}
          >
            <ListItemText primary={item.name} />
          </NavLink>
        </NavItem>
      ))}
    </NavList>
  );

  return (
    <NavbarWrapper>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {isMobile && (
            <MobileNavToggle
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </MobileNavToggle>
          )}

          {/* Desktop Navigation */}
          {!isMobile && renderNavItems()}

          {/* Mobile Navigation Drawer */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: 240,
                backgroundColor: '#0056b3'
              },
            }}
          >
            {renderNavItems()}
          </Drawer>
        </Box>
      </Container>
    </NavbarWrapper>
  );
};

export default Navbar; 