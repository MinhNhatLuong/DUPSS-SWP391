import { useState, useEffect } from 'react';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ChatButton from './ChatButton';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when user scrolls down 300px
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set up scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    
    // Clean up
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="floating-buttons">
      <ChatButton />
      <button 
        id="scroll-to-top" 
        title="Cuộn lên đầu trang"
        className={isVisible ? 'show' : ''}
        onClick={scrollToTop}
      >
        <KeyboardArrowUpIcon />
      </button>
    </div>
  );
};

export default ScrollToTop;