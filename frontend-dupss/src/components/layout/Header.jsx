import { Link as RouterLink } from 'react-router-dom';
import { TextField, Button, Box, Container, InputAdornment } from '@mui/material';
import AuthButtons from './AuthButtons';

const Header = () => {
  return (
    <header>
      <div className="header-container">
        <div className="logo">
          <RouterLink to="/">
            <img src="/Logo_Website_Blue.png" alt="DUPSS Logo" />
          </RouterLink>
        </div>
        
        <AuthButtons />
      </div>
    </header>
  );
};

export default Header;