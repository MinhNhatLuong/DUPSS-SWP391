import { Typography, Box } from '@mui/material';

const MissionVision = () => {
  return (
    <>
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
          Sứ mệnh của chúng tôi
        </Typography>
        <Typography variant="body1" paragraph>
          DUPSS (Dự án Phòng ngừa Sử dụng Ma túy trong Cộng đồng) là một tổ chức phi lợi nhuận được thành lập với sứ mệnh nâng cao nhận thức và giáo dục cộng đồng về tác hại của ma túy, đồng thời cung cấp các công cụ và nguồn lực để phòng ngừa việc sử dụng ma túy, đặc biệt là trong giới trẻ.
        </Typography>
        <Typography variant="body1" paragraph>
          Chúng tôi tin rằng thông qua giáo dục, hỗ trợ và hợp tác cộng đồng, chúng ta có thể xây dựng một xã hội khỏe mạnh hơn, nơi mọi người đều có kiến thức và kỹ năng để tránh xa ma túy và các chất gây nghiện.
        </Typography>
      </section>
      
      <section>
        <Typography 
          variant="h2" 
          component="h2" 
          sx={{ 
            fontSize: '1.8rem',
            mb: 3,
            mt: 5,
            color: '#0056b3',
            borderBottom: '2px solid #e9f5ff',
            pb: 1,
            fontWeight: 'bold'
          }}
        >
          Tầm nhìn
        </Typography>
        <Typography variant="body1" paragraph>
          Chúng tôi hướng tới một tương lai nơi mọi cộng đồng đều được trang bị đầy đủ kiến thức và công cụ để phòng ngừa việc sử dụng ma túy, nơi tỷ lệ nghiện ma túy giảm xuống mức thấp nhất, và nơi những người đang phải đối mặt với vấn đề nghiện ngập đều nhận được sự hỗ trợ và điều trị phù hợp.
        </Typography>
      </section>
    </>
  );
};

export default MissionVision; 