import { Box, Typography, Container, Grid, Card, CardContent, styled } from '@mui/material';
import {
  MenuBook as EducationIcon,
  PeopleAlt as SupportIcon, 
  ShowChart as ResearchIcon,
  MedicalServices as ConsultingIcon
} from '@mui/icons-material';

const SectionTitle = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  fontSize: '2rem',
  marginBottom: '40px',
  color: '#0056b3',
  position: 'relative',
  '&::after': {
    content: '""',
    display: 'block',
    width: '50px',
    height: '3px',
    backgroundColor: '#0056b3',
    margin: '15px auto 0',
  }
}));

const PoiCard = styled(Card)(({ theme }) => ({
  height: '100%',
  padding: '30px 20px',
  textAlign: 'center',
  transition: 'transform 0.3s, box-shadow 0.3s',
  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.08)',
  borderRadius: '8px',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
  }
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  backgroundColor: '#0056b3',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 20px',
  '& svg': {
    fontSize: '2.5rem',
  }
}));

const PoiTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.3rem',
  fontWeight: 600,
  marginBottom: '15px',
  color: '#0056b3',
}));

const poiData = [
  {
    id: 1,
    title: 'Giáo dục & Phòng ngừa',
    description: 'Cung cấp thông tin và kiến thức về tác hại của ma túy, giúp nâng cao nhận thức và phòng ngừa hiệu quả.',
    icon: <EducationIcon fontSize="large" />,
  },
  {
    id: 2,
    title: 'Hỗ trợ Cộng đồng',
    description: 'Các chương trình hỗ trợ cộng đồng, giúp đỡ những người bị ảnh hưởng bởi ma túy và gia đình họ.',
    icon: <SupportIcon fontSize="large" />,
  },
  {
    id: 3,
    title: 'Nghiên cứu & Thống kê',
    description: 'Cập nhật các nghiên cứu mới nhất và số liệu thống kê về tình hình sử dụng ma túy trong cộng đồng.',
    icon: <ResearchIcon fontSize="large" />,
  },
  {
    id: 4,
    title: 'Tư vấn & Điều trị',
    description: 'Thông tin về các phương pháp tư vấn và điều trị cho người nghiện ma túy, giúp họ quay trở lại cuộc sống bình thường.',
    icon: <ConsultingIcon fontSize="large" />,
  },
];

const PointsOfInterest = () => {
  return (
    <Box sx={{ py: 6 }}>
      <Container maxWidth="lg">
        <SectionTitle variant="h2">DUPSS Points of Interest</SectionTitle>
        
        <Grid container spacing={4} justifyContent="center" className="card-grid">
          {poiData.map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item.id}>
              <PoiCard elevation={2} className="card-hover">
                <IconWrapper>
                  {item.icon}
                </IconWrapper>
                <CardContent sx={{ p: 0 }}>
                  <PoiTitle variant="h3">{item.title}</PoiTitle>
                  <Typography variant="body2" sx={{ color: '#666' }}>{item.description}</Typography>
                </CardContent>
              </PoiCard>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default PointsOfInterest; 