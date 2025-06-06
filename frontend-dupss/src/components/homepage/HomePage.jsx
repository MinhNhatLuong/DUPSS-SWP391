import { Box } from '@mui/material';
import HeroBanner from './HeroBanner';
import LatestNews from './LatestNews';
import PointsOfInterest from './PointsOfInterest';
import FeaturedCourses from './FeaturedCourses';

const HomePage = () => {
  return (
    <Box>
      <HeroBanner />
      <Box sx={{ backgroundColor: '#fff' }}>
        <LatestNews />
      </Box>
      <Box sx={{ backgroundColor: '#f8f9fa' }}>
        <PointsOfInterest />
      </Box>
      <Box sx={{ backgroundColor: '#fff' }}>
        <FeaturedCourses />
      </Box>
    </Box>
  );
};

export default HomePage; 
 