import {
  Box,
  Container,
  Grid,
  Typography,
  Link as MuiLink,
  styled,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  YouTube as YouTubeIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon
} from '@mui/icons-material';

const FooterWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: '#003366',
  color: 'white',
  paddingTop: '60px'
}));

const FooterTop = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '30px',
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  }
}));

const FooterHeading = styled(Typography)(({ theme }) => ({
  fontSize: '1.2rem',
  fontWeight: 600,
  marginBottom: '20px',
  position: 'relative',
  '&::after': {
    content: '""',
    display: 'block',
    width: '50px',
    height: '3px',
    backgroundColor: 'white',
    marginTop: '10px'
  }
}));

const FooterText = styled(Typography)(({ theme }) => ({
  marginBottom: '15px',
  display: 'flex',
  alignItems: 'center',
  fontSize: '0.9rem',
  '& svg': {
    marginRight: '10px',
    fontSize: '1.2rem'
  }
}));

const FooterLinkList = styled('ul')(({ theme }) => ({
  padding: 0,
  listStyle: 'none'
}));

const FooterLinkItem = styled('li')(({ theme }) => ({
  marginBottom: '10px'
}));

const FooterLink = styled(MuiLink)(({ theme }) => ({
  color: 'white',
  textDecoration: 'none',
  transition: 'color 0.3s',
  fontSize: '0.9rem',
  '&:hover': {
    color: '#ccc',
    textDecoration: 'none'
  }
}));

const SocialMediaLinks = styled(Box)(({ theme }) => ({
  display: 'flex',
  marginTop: '15px',
  '& a': {
    marginRight: '15px',
    width: '36px',
    height: '36px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.3s',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)'
    }
  }
}));

const FooterBottom = styled(Box)(({ theme }) => ({
  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  marginTop: '40px',
  padding: '20px 0',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '0.9rem',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    textAlign: 'center',
    '& p': {
      marginBottom: '15px'
    }
  }
}));

const FooterBottomLinks = styled(Box)(({ theme }) => ({
  '& a': {
    color: 'white',
    marginLeft: '15px',
    textDecoration: 'none',
    transition: 'color 0.3s',
    fontSize: '0.9rem',
    '&:hover': {
      color: '#ccc'
    }
  },
  [theme.breakpoints.down('sm')]: {
    '& a': {
      marginLeft: '10px',
      marginRight: '10px'
    }
  }
}));

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <FooterWrapper>
      <Container maxWidth="lg">
        <FooterTop>
          {/* About Column */}
          <Box>
            <FooterHeading variant="h3">Về DUPSS</FooterHeading>
            <FooterText>
              DUPSS là dự án phòng ngừa sử dụng ma túy trong cộng đồng của tổ chức tình nguyện, 
              nhằm nâng cao nhận thức và giáo dục cộng đồng về tác hại của ma túy.
            </FooterText>
          </Box>

          {/* Quick Links Column */}
          <Box>
            <FooterHeading variant="h3">Liên kết nhanh</FooterHeading>
            <FooterLinkList>
              <FooterLinkItem><FooterLink href="/">Trang chủ</FooterLink></FooterLinkItem>
              <FooterLinkItem><FooterLink href="/courses">Khóa học</FooterLink></FooterLinkItem>
              <FooterLinkItem><FooterLink href="/blogs">Tin tức & Blog</FooterLink></FooterLinkItem>
              <FooterLinkItem><FooterLink href="/survey">Khảo sát</FooterLink></FooterLinkItem>
              <FooterLinkItem><FooterLink href="/appointment">Đặt lịch hẹn</FooterLink></FooterLinkItem>
              <FooterLinkItem><FooterLink href="/about-us">Về chúng tôi</FooterLink></FooterLinkItem>
            </FooterLinkList>
          </Box>

          {/* Resources Column */}
          <Box>
            <FooterHeading variant="h3">Tài nguyên</FooterHeading>
            <FooterLinkList>
              <FooterLinkItem><FooterLink href="#">Thư viện tài liệu</FooterLink></FooterLinkItem>
              <FooterLinkItem><FooterLink href="#">Video giáo dục</FooterLink></FooterLinkItem>
              <FooterLinkItem><FooterLink href="#">Infographics</FooterLink></FooterLinkItem>
              <FooterLinkItem><FooterLink href="#">Báo cáo nghiên cứu</FooterLink></FooterLinkItem>
              <FooterLinkItem><FooterLink href="#">Câu hỏi thường gặp</FooterLink></FooterLinkItem>
            </FooterLinkList>
          </Box>

          {/* Contact Column */}
          <Box>
            <FooterHeading variant="h3">Liên hệ</FooterHeading>
            <FooterText>
              <LocationIcon />
              123 Đường Nguyễn Tấn Dũng, Quận Nguyễn Thành Đạt, TP. Lương Gia Lâm
            </FooterText>
            <FooterText>
              <PhoneIcon />
              (84) 123-456-789
            </FooterText>
            <FooterText>
              <EmailIcon />
              info@dupss.org
            </FooterText>
            <SocialMediaLinks>
              <FooterLink href="#"><FacebookIcon /></FooterLink>
              <FooterLink href="#"><TwitterIcon /></FooterLink>
              <FooterLink href="#"><InstagramIcon /></FooterLink>
              <FooterLink href="#"><YouTubeIcon /></FooterLink>
            </SocialMediaLinks>
          </Box>
        </FooterTop>

        <FooterBottom>
          <Typography variant="body2">
            &copy; 2023 DUPSS - Dự án Phòng ngừa Sử dụng Ma túy trong Cộng đồng. Tất cả quyền được bảo lưu.
          </Typography>
          <FooterBottomLinks>
            <FooterLink href="#">Chính sách bảo mật</FooterLink>
            <FooterLink href="#">Điều khoản sử dụng</FooterLink>
            <FooterLink href="#">Sitemap</FooterLink>
          </FooterBottomLinks>
        </FooterBottom>
      </Container>
    </FooterWrapper>
  );
};

export default Footer; 