import HeroBanner from './HeroBanner';
import LatestNews from './LatestNews';
import PointsOfInterest from './PointsOfInterest';
import FeaturedCourses from './FeaturedCourses';
import { useEffect } from 'react';

const HomePage = () => {
  useEffect(() => {
    document.title = "DUPSS - Phòng Ngừa Sử Dụng Ma Túy Trong Cộng Đồng";
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