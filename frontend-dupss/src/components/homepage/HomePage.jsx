import HeroBanner from './HeroBanner';
import LatestNews from './LatestNews';
import PointsOfInterest from './PointsOfInterest';
import FeaturedCourses from './FeaturedCourses';
import { useEffect } from 'react';
import { showSuccessAlert } from '../common/AlertNotification';

const HomePage = () => {
  useEffect(() => {
    document.title = "DUPSS - Phòng Ngừa Sử Dụng Ma Túy Trong Cộng Đồng";
    
    // Check for login success flag
    const loginSuccess = localStorage.getItem('loginSuccess');
    if (loginSuccess === 'true') {
      // Show success alert
      showSuccessAlert('Đăng nhập thành công!');
      // Remove the flag to prevent showing the alert on page refresh
      localStorage.removeItem('loginSuccess');
    }
  }, []);

  return (
    <>
      <HeroBanner />
      <LatestNews />
      <PointsOfInterest />
      <FeaturedCourses />
    </>
  );
};

export default HomePage;