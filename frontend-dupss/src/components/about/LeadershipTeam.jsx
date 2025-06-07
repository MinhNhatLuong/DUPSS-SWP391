import { Typography, Box, Card, CardMedia, CardContent } from '@mui/material';

const LeadershipTeam = () => {
  // Leadership team data
  const leadershipTeam = [
    {
      image: 'https://scontent.fsgn5-8.fna.fbcdn.net/v/t39.30808-6/474442296_1340811473939573_1541216496532365417_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeHvVklONlcXg1Zh0oANEQg8bj8flWpDvf5uPx-VakO9_qjJpSdrNseGXrYSGlZXq4SYJ1BkKJHik5WDzbfvkUuE&_nc_ohc=s__sb3ISASQQ7kNvwE6UpCe&_nc_oc=Adk2s1Ke5uZceb-mDTC66dszhLSaUSDkjJmtXJoBy383W1-dgNridoPC0mBUpTUaC8wo19VGC7qYFiygc_FEWhHg&_nc_zt=23&_nc_ht=scontent.fsgn5-8.fna&_nc_gid=Z-tOXFSnM1fdWXGGnf5F4A&oh=00_AfPhIa6wpPPoxrIBn6IV4YTzqqJE3Xm0Z8p1UQt7kB52dw&oe=684A5A08',
      name: 'Nguyễn Thành Đạt',
      title: 'Giám đốc điều hành',
      bio: 'Tiến sĩ Y học với hơn 20 năm kinh nghiệm trong lĩnh vực nghiên cứu về ma túy và các chất gây nghiện.'
    },
    {
      image: 'https://scontent.fsgn5-14.fna.fbcdn.net/v/t39.30808-1/476314747_1385229409130567_8947152286196030311_n.jpg?stp=dst-jpg_s480x480_tt6&_nc_cat=106&ccb=1-7&_nc_sid=e99d92&_nc_eui2=AeHh2P225HKWb7oB0WAerP85L8gwaY_BjBUvyDBpj8GMFd4aN63olwiPb8Go8a7iNWUJGa-sHI4VCuvpyuiqXbYs&_nc_ohc=xUS4oMohGgIQ7kNvwFD4TVN&_nc_oc=AdmIl0TDJTMeof_hgnL32LoQtM_NV8-EacsZ0xGvL2hNWdO8QIft2MSVaF__Ga04zlcDHLgc9cyfKgTnLH_tJcm-&_nc_zt=24&_nc_ht=scontent.fsgn5-14.fna&_nc_gid=ABsgU9_mKy2uKnte54OIZQ&oh=00_AfNKiwfOn755u_vj8ozGzRhpM4vBKmpN4sCNhbrBYZQS5A&oe=684A32AF',
      name: 'Lương Gia Lâm',
      title: 'Giám đốc chương trình',
      bio: 'Chuyên gia giáo dục với gần 15 năm kinh nghiệm phát triển chương trình giáo dục phòng chống ma túy.'
    },
    {
      image: 'https://scontent.fsgn5-3.fna.fbcdn.net/v/t39.30808-6/480459884_1173203430862389_3609239197064390599_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeECfACjzjn7ulI73jwxX4TfbVR2nJGgSlBtVHackaBKUEjinTwUv5yeutF6LDL-h5y9C8_4tpjEnW6nFPiOePvS&_nc_ohc=p6Tqj6zzH2oQ7kNvwGipNTl&_nc_oc=AdlBPIvBAK-bCx6_uBGvblNKm4KSdUJYN-uFRivMsEf8G3GB07guxN1x3E80ibiIRiLcKgd64G52kcLWLLuC5YnM&_nc_zt=23&_nc_ht=scontent.fsgn5-3.fna&_nc_gid=4BAOWpnztB7zcgRCanJxmA&oh=00_AfN7EGS0ZmWkTBeUtlr-Y6suvwrRliEBWRc8WI2a1PqzsQ&oe=684A459D',
      name: 'Nguyễn Tấn Dũng',
      title: 'Giám đốc truyền thông',
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