import { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const [activePage, setActivePage] = useState('');

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
  }, [location.pathname]);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <ul className="nav-links">
          <li>
            <RouterLink 
              to="/" 
              className={activePage === 'home' ? 'active' : ''}
            >
              Trang chủ
            </RouterLink>
          </li>
          <li>
            <RouterLink 
              to="/courses" 
              className={activePage === 'courses' ? 'active' : ''}
            >
              Khóa học
            </RouterLink>
          </li>
          <li>
            <RouterLink 
              to="/blogs" 
              className={activePage === 'blogs' ? 'active' : ''}
            >
              Blogs & Thông tin
            </RouterLink>
          </li>
          <li>
            <RouterLink 
              to="/surveys" 
              className={activePage === 'surveys' ? 'active' : ''}
            >
              Khảo sát
            </RouterLink>
          </li>
          <li>
            <RouterLink 
              to="/appointment" 
              className={activePage === 'appointment' ? 'active' : ''}
            >
              Đặt lịch hẹn
            </RouterLink>
          </li>
          <li>
            <RouterLink 
              to="/about-us" 
              className={activePage === 'about' ? 'active' : ''}
            >
              Về chúng tôi
            </RouterLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;