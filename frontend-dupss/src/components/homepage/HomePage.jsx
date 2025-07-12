import React, { useEffect } from 'react';
import HeroBanner from './HeroBanner';
import LatestNews from './LatestNews';
import PointsOfInterest from './PointsOfInterest';
import FeaturedCourses from './FeaturedCourses';
import { showSuccessAlert } from '../common/AlertNotification';

function HomePage() {
  useEffect(() => {
    document.title = "DUPSS - Phòng Ngừa Sử Dụng Ma Túy Trong Cộng Đồng";
    
    // Check for login success flag
    const loginSuccess = localStorage.getItem('loginSuccess');
    if (loginSuccess === 'true') {
      // Check if there's a registration message
      const registrationMessage = localStorage.getItem('registrationMessage');
      if (registrationMessage) {
        // Show registration success alert
        showSuccessAlert(registrationMessage);
        // Remove the registration message
        localStorage.removeItem('registrationMessage');
      } else {
        // Show default login success alert
        showSuccessAlert('Đăng nhập thành công!');
      }
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
}

export default HomePage;