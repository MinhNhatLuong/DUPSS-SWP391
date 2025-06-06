import { Box, Typography, Button, Container, styled } from '@mui/material';

const HeroBannerWrapper = styled(Box)(({ theme }) => ({
  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://www.mua.edu/uploads/sites/10/2023/02/istock-482499394.webp?w=1536')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  color: 'white',
  textAlign: 'center',
  padding: '120px 20px',
  position: 'relative',
  [theme.breakpoints.down('md')]: {
    padding: '100px 20px',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '80px 20px',
  },
}));

const HeroContent = styled(Box)(({ theme }) => ({
  maxWidth: '800px',
  margin: '0 auto',
  position: 'relative',
  zIndex: 2,
}));

const HeroTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2.8rem',
  fontWeight: 700,
  marginBottom: '20px',
  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
  [theme.breakpoints.down('md')]: {
    fontSize: '2.3rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.8rem',
  },
}));

const HeroText = styled(Typography)(({ theme }) => ({
  fontSize: '1.2rem',
  marginBottom: '30px',
  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1rem',
  },
}));

const CtaButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#0056b3',
  color: 'white',
  padding: '12px 30px',
  borderRadius: '4px',
  fontWeight: 500,
  textTransform: 'none',
  transition: 'all 0.3s',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  '&:hover': {
    backgroundColor: '#003d82',
    transform: 'translateY(-3px)',
    boxShadow: '0 6px 8px rgba(0,0,0,0.15)',
  },
}));

const HeroBanner = () => {
  return (
    <HeroBannerWrapper>
      <HeroContent>
        <HeroTitle variant="h1">
          Phòng Ngừa Sử Dụng Ma Túy Trong Cộng Đồng
        </HeroTitle>
        <HeroText variant="body1">
          Chung tay xây dựng cộng đồng lành mạnh, phòng chống tác hại của ma túy
        </HeroText>
        <CtaButton variant="contained" href="/about-us">
          Tìm hiểu thêm
        </CtaButton>
      </HeroContent>
    </HeroBannerWrapper>
  );
};

export default HeroBanner; 