import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// This component automatically scrolls to the top of the page when the route changes
const AutoScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [pathname]);
  
  return null;
};

export default AutoScrollToTop; 