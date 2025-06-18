import { Typography, Box, Card, CardMedia, CardContent } from '@mui/material';

const LeadershipTeam = () => {
  // Leadership team data
  const leadershipTeam = [
    {
      image: 'https://res.cloudinary.com/dpunnm4ns/image/upload/v1750125121/474442296_1340811473939573_1541216496532365417_n_i7hj3h.jpg',
      name: 'Nguyễn Thành Đạt',
      title: 'Giám đốc điều hành',
      bio: 'Tiến sĩ Y học với hơn 20 năm kinh nghiệm trong lĩnh vực nghiên cứu về ma túy và các chất gây nghiện.'
    },
    {
      image: 'https://res.cloudinary.com/dpunnm4ns/image/upload/v1750125120/476314747_1385229409130567_8947152286196030311_n_v7y1kj.jpg',
      name: 'Lương Gia Lâm',
      title: 'Giám đốc chương trình',
      bio: 'Chuyên gia giáo dục với gần 15 năm kinh nghiệm phát triển chương trình giáo dục phòng chống ma túy.'
    },
    {
      image: 'https://res.cloudinary.com/dpunnm4ns/image/upload/v1742027595/YelpCamp/llndorjmir6t8ggggmt2.jpg',
      name: 'Nguyễn Tấn Dũng',
      title: 'Nô lệ toàn thời gian',
      bio: 'Nô lệ toàn thời gian với kinh nghiệm phong phú trong các chiến dịch nâng cao nhận thức cộng đồng.'
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
          pb: 1,
          fontWeight: 'bold'
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