import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { TextField, Button, Box, Container, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
        
        <div className="user-actions">
          {!isLoggedIn ? (
            <div className="auth-buttons">
              <RouterLink to="/login" className="login-btn">Đăng nhập</RouterLink>
              <RouterLink to="/register" className="register-btn">Đăng ký</RouterLink>
            </div>
          ) : (
            <div className="user-dropdown">
              <button className="dropbtn">Tài khoản <i className="fas fa-caret-down"></i></button>
              <div className="dropdown-content">
                <RouterLink to="/profile">Hồ sơ</RouterLink>
                <a href="#" onClick={() => setIsLoggedIn(false)}>Đăng xuất</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;