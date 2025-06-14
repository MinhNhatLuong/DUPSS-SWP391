import { Box, Typography, Paper } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HandshakeIcon from '@mui/icons-material/Handshake';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PeopleIcon from '@mui/icons-material/People';

const CoreValues = () => {
  // Core values data
  const coreValues = [
    {
      icon: <FavoriteIcon fontSize="large" sx={{ color: '#0056b3' }} />,
      title: 'Tôn trọng',
      description: 'Chúng tôi tôn trọng phẩm giá và quyền của mỗi cá nhân, bất kể hoàn cảnh hay quá khứ của họ.'
    },
    {
      icon: <HandshakeIcon fontSize="large" sx={{ color: '#0056b3' }} />,
      title: 'Hỗ trợ',
      description: 'Chúng tôi cam kết hỗ trợ những người bị ảnh hưởng bởi ma túy và gia đình họ thông qua giáo dục, tư vấn và các nguồn lực.'
    },
    {
      icon: <MenuBookIcon fontSize="large" sx={{ color: '#0056b3' }} />,
      title: 'Giáo dục',
      description: 'Chúng tôi tin vào sức mạnh của giáo dục trong việc thay đổi nhận thức và hành vi liên quan đến ma túy.'
    },
    {
      icon: <PeopleIcon fontSize="large" sx={{ color: '#0056b3' }} />,
      title: 'Cộng đồng',
      description: 'Chúng tôi xây dựng và tăng cường mối quan hệ cộng đồng để tạo ra một mạng lưới hỗ trợ mạnh mẽ.'
    }
  ];

  return (
    <section>
      <Typography 
        variant="h2" 
        component="h2" 
        sx={{ 
          fontSize: '1.8rem',
          mb: 3,
          color: '#0056b3',
          borderBottom: '2px solid #e9f5ff',
          pb: 1
        }}
      >
        Giá trị cốt lõi
      </Typography>
      
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: {xs: 'column', md: 'row'}, 
          justifyContent: 'space-between', 
          gap: '24px',
          mt: 2
        }}
      >
        {coreValues.map((value, index) => (
          <Paper 
            key={index}
            elevation={1} 
            sx={{ 
              flex: '1 1 0px', // Equal width for all cards 
              p: 3, 
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: '#f8f9fa',
              borderRadius: '8px',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)'
              }
            }}
          >
            <Box sx={{ mb: 2, height: '60px', display: 'flex', alignItems: 'center' }}>
              {value.icon}
            </Box>
            <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 'bold' }}>
              {value.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {value.description}
            </Typography>
          </Paper>
        ))}
      </Box>
    </section>
  );
};

export default CoreValues; 