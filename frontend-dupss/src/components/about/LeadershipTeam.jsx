import { Typography, Box, Card, CardMedia, CardContent } from '@mui/material';

const LeadershipTeam = () => {
  // Leadership team data
  const leadershipTeam = [
    {
      image: 'https://static.scientificamerican.com/sciam/cache/file/BC2412FA-1388-43B7-877759A80E201C16_source.jpg',
      name: 'Nguyễn Thành Đạt',
      title: 'Giám đốc điều hành',
      bio: 'Tiến sĩ Y học với hơn 20 năm kinh nghiệm trong lĩnh vực nghiên cứu về ma túy và các chất gây nghiện.'
    },
    {
      image: 'https://static.scientificamerican.com/sciam/cache/file/BC2412FA-1388-43B7-877759A80E201C16_source.jpg',
      name: 'Lương Gia Lâm',
      title: 'Giám đốc chương trình',
      bio: 'Chuyên gia giáo dục với gần 15 năm kinh nghiệm phát triển chương trình giáo dục phòng chống ma túy.'
    },
    {
      image: 'https://static.scientificamerican.com/sciam/cache/file/BC2412FA-1388-43B7-877759A80E201C16_source.jpg',
      name: 'Nguyễn Tấn Dũng',
      title: 'Nô lệ toàn thời gian',
      bio: 'Chuyên gia truyền thông với kinh nghiệm phong phú trong các chiến dịch nâng cao nhận thức cộng đồng.'
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
        Đội ngũ lãnh đạo
      </Typography>
      
      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
          gap: '24px', 
          mt: 2,
          width: '100%'
        }}
      >
        {leadershipTeam.map((member, index) => (
          <Card 
            key={index}
            sx={{ 
              bgcolor: '#fff', 
              borderRadius: '8px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}
          >
            <CardMedia
              component="img"
              image={member.image}
              alt={member.name}
              sx={{ 
                height: 250,
                objectFit: 'cover'
              }}
            />
            <CardContent sx={{ p: 3, textAlign: 'center', flexGrow: 1 }}>
              <Typography 
                variant="h5" 
                component="h3" 
                sx={{ 
                  fontWeight: 600,
                  color: '#333',
                  mb: 1
                }}
              >
                {member.name}
              </Typography>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: '#0056b3',
                  fontWeight: 500,
                  mb: 2
                }}
              >
                {member.title}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#666'
                }}
              >
                {member.bio}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </section>
  );
};

export default LeadershipTeam; 