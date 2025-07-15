import { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Box, IconButton, Drawer, List, ListItem, ListItemText, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

const Navbar = () => {
  const location = useLocation();
  const [activePage, setActivePage] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Function to update active page state
  const updateActivePage = (path) => {
    if (path === '/') return 'home';
    if (path.startsWith('/courses')) return 'courses';
    if (path.startsWith('/blogs')) return 'blogs';
    if (path.startsWith('/surveys')) return 'surveys';
    if (path.startsWith('/appointment')) return 'appointment';
    if (path.startsWith('/about-us')) return 'about';
    // For login, register and profile pages, don't highlight any navigation item
    if (path.startsWith('/login') || path.startsWith('/register') || path.startsWith('/profile') || path.startsWith('/forgot-password')) return '';
    return '';
  };

  // Monitor route changes and update active page
  useEffect(() => {
    setActivePage(updateActivePage(location.pathname));
    // Close mobile menu when route changes
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleClose = () => {
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { text: 'Trang chủ', path: '/', id: 'home' },
    { text: 'Khóa học', path: '/courses', id: 'courses' },
    { text: 'Blogs & Thông tin', path: '/blogs', id: 'blogs' },
    { text: 'Khảo sát', path: '/surveys', id: 'surveys' },
    { text: 'Đặt lịch hẹn', path: '/appointment', id: 'appointment' },
    { text: 'Về chúng tôi', path: '/about-us', id: 'about' }
  ];

  const renderMobileMenu = () => (
    <>
      {/* Mobile menu button row with explicit right alignment */}
      <Box 
        sx={{ 
          width: '100%', 
          display: 'flex', 
          justifyContent: 'flex-end',
          backgroundColor: '#0056b3',
          padding: '8px 15px',
          textAlign: 'right'
        }}
            >
        <IconButton 
          onClick={handleMenuToggle} 
          sx={{ 
            color: 'white',
            marginLeft: 'auto' // Ensure button stays on the right
          }}
          aria-label="Menu"
        >
          <MenuIcon sx={{ fontSize: 28 }} />
        </IconButton>
      </Box>
      
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={handleClose}
        disableScrollLock={false}
        ModalProps={{
          keepMounted: true, // Better mobile performance
          BackdropProps: {
            invisible: false,
            sx: { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
          }
        }}
        sx={{
          '& .MuiDrawer-paper': { 
            width: '80%',
            maxWidth: '320px',
            backgroundColor: '#0056b3',
            color: 'white'
          },
        }}
            >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-start', 
          p: 2,
          paddingLeft: 1,
          borderBottom: '1px solid rgba(255,255,255,0.2)',
          backgroundColor: '#00428f',
          textAlign: 'left'
        }}>
          <IconButton 
            onClick={handleClose} 
            sx={{ 
              color: 'white',
              marginRight: 'auto',
              padding: 1
            }}
            >
            <CloseIcon sx={{ fontSize: 28 }} />
          </IconButton>
        </Box>
        
        <List sx={{ pt: 2 }}>
          {navLinks.map((link) => (
            <ListItem 
              button 
              key={link.id} 
              component={RouterLink} 
              to={link.path}
              onClick={handleClose}
              sx={{
                backgroundColor: activePage === link.id ? 'rgba(255,255,255,0.15)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)'
                },
                my: 1,
                py: 1.5,
                px: 3,
                borderRadius: '4px',
                mx: 1
              }}
            >
              <ListItemText 
                primary={link.text} 
                sx={{ 
                  '& .MuiTypography-root': {
                    fontSize: '1.2rem',
                    fontWeight: activePage === link.id ? 600 : 500,
                    color: 'white',
                    letterSpacing: '0.5px',
                    textShadow: '0px 1px 2px rgba(0,0,0,0.2)'
                  }
                }} 
              />
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );

  return (
    <nav className="navbar" style={isMobile ? { boxShadow: '0 2px 4px rgba(0,0,0,0.1)' } : {}}>
      <div className="nav-container" style={isMobile ? { display: 'block', padding: 0 } : {}}>
        {isMobile ? (
          renderMobileMenu()
        ) : (
          <ul className="nav-links">
            {navLinks.map((link) => (
              <li key={link.id}>
            <RouterLink 
                  to={link.path} 
                  className={activePage === link.id ? 'active' : ''}
            >
                  {link.text}
            </RouterLink>
          </li>
            ))}
        </ul>
        )}
      </div>
    </nav>
  );
};

export default Navbar;