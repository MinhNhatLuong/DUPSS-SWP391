import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { TextField, Button, Box, Container, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AuthButtons from './AuthButtons';

const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    // Handle search functionality here
    console.log('Searching for:', searchTerm);
  };

  return (
    <header>
      <div className="header-container">
        <div className="logo">
          <RouterLink to="/">
            <img src="/Logo_Website_Blue.png" alt="DUPSS Logo" />
          </RouterLink>
        </div>
        
        <div className="search-bar">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit"><i className="fas fa-search"></i></button>
          </form>
        </div>
        
        <AuthButtons />
      </div>
    </header>
  );
};

export default Header;