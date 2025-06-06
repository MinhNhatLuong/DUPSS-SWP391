import { useState } from 'react';

const Navbar = () => {
  const [activePage, setActivePage] = useState('home');

  return (
    <nav className="navbar">
      <div className="nav-container">
        <ul className="nav-links">
          <li>
            <a 
              href="/" 
              className={activePage === 'home' ? 'active' : ''}
              onClick={() => setActivePage('home')}
            >
              Trang chủ
            </a>
          </li>
          <li>
            <a 
              href="/courses" 
              className={activePage === 'courses' ? 'active' : ''}
              onClick={() => setActivePage('courses')}
            >
              Khóa học
            </a>
          </li>
          <li>
            <a 
              href="/blogs" 
              className={activePage === 'blogs' ? 'active' : ''}
              onClick={() => setActivePage('blogs')}
            >
              Blogs & Thông tin
            </a>
          </li>
          <li>
            <a 
              href="/survey" 
              className={activePage === 'survey' ? 'active' : ''}
              onClick={() => setActivePage('survey')}
            >
              Khảo sát
            </a>
          </li>
          <li>
            <a 
              href="/appointment" 
              className={activePage === 'appointment' ? 'active' : ''}
              onClick={() => setActivePage('appointment')}
            >
              Đặt lịch hẹn
            </a>
          </li>
          <li>
            <a 
              href="/about-us" 
              className={activePage === 'about' ? 'active' : ''}
              onClick={() => setActivePage('about')}
            >
              Về chúng tôi
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;