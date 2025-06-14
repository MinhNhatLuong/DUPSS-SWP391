import { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const [activePage, setActivePage] = useState(() => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/courses')) return 'courses';
    if (path.startsWith('/blogs')) return 'blogs';
    if (path.startsWith('/surveys')) return 'surveys';
    if (path.startsWith('/appointment')) return 'appointment';
    if (path.startsWith('/about-us')) return 'about';
    return '';
  });

  return (
    <nav className="navbar">
      <div className="nav-container">
        <ul className="nav-links">
          <li>
            <RouterLink 
              to="/" 
              className={activePage === 'home' ? 'active' : ''}
              onClick={() => setActivePage('home')}
            >
              Trang chủ
            </RouterLink>
          </li>
          <li>
            <RouterLink 
              to="/courses" 
              className={activePage === 'courses' ? 'active' : ''}
              onClick={() => setActivePage('courses')}
            >
              Khóa học
            </RouterLink>
          </li>
          <li>
            <RouterLink 
              to="/blogs" 
              className={activePage === 'blogs' ? 'active' : ''}
              onClick={() => setActivePage('blogs')}
            >
              Blogs & Thông tin
            </RouterLink>
          </li>
          <li>
            <RouterLink 
              to="/surveys" 
              className={activePage === 'surveys' ? 'active' : ''}
              onClick={() => setActivePage('surveys')}
            >
              Khảo sát
            </RouterLink>
          </li>
          <li>
            <RouterLink 
              to="/appointment" 
              className={activePage === 'appointment' ? 'active' : ''}
              onClick={() => setActivePage('appointment')}
            >
              Đặt lịch hẹn
            </RouterLink>
          </li>
          <li>
            <RouterLink 
              to="/about-us" 
              className={activePage === 'about' ? 'active' : ''}
              onClick={() => setActivePage('about')}
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