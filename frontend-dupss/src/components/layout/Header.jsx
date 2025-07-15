import { Link as RouterLink } from 'react-router-dom';
import { TextField, Button, Box, Container, InputAdornment, useMediaQuery, useTheme } from '@mui/material';
import AuthButtons from './AuthButtons';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <header>
      <div 
        className="header-container" 
        style={isMobile ? { 
          padding: '0 15px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: 'row'
        } : {}}
      >
        <div className="logo">
          <RouterLink to="/">
            <img 
              src="/Logo_Website_Blue.png" 
              alt="DUPSS Logo"
              style={isMobile ? { height: '40px' } : {}}
            />
          </RouterLink>
        </div>
        
        <AuthButtons />
      </div>
    </header>
  );
};

export default Header;