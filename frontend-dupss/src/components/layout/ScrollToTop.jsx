import { useState, useEffect } from 'react';
import { Fab, styled } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

const ScrollButton = styled(Fab)(({ theme, show }) => ({
  position: 'fixed',
  bottom: '30px',
  right: '30px',
  backgroundColor: '#0056b3',
  color: 'white',
  opacity: show ? 1 : 0,
  visibility: show ? 'visible' : 'hidden',
  transition: 'all 0.3s',
  zIndex: 1000,
  width: '45px',
  height: '45px',
  minHeight: 'unset',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
  '&:hover': {
    backgroundColor: '#003d82',
    transform: 'translateY(-3px)',
    boxShadow: '0 6px 15px rgba(0, 0, 0, 0.3)',
  }
}));

const ScrollToTop = () => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.pageYOffset > 300) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <ScrollButton 
      aria-label="Cuộn lên đầu trang"
      onClick={scrollToTop}
      show={showButton ? 1 : 0}
      size="small"
    >
      <ArrowUpwardIcon fontSize="small" />
    </ScrollButton>
  );
};

export default ScrollToTop; 