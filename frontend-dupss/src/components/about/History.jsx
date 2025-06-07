import { Typography } from '@mui/material';

const History = () => {
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
        Lịch sử hình thành
      </Typography>
      <Typography variant="body1" paragraph>
        DUPSS được thành lập vào năm 2018 bởi một nhóm các chuyên gia y tế, giáo dục và công tác xã hội, những người nhận thấy sự gia tăng đáng báo động của việc sử dụng ma túy trong cộng đồng, đặc biệt là ở giới trẻ.
      </Typography>
      <Typography variant="body1" paragraph>
        Từ một dự án nhỏ với chỉ 5 tình nguyện viên, DUPSS đã phát triển thành một tổ chức có ảnh hưởng với hơn 100 nhân viên và tình nguyện viên, hoạt động trên khắp cả nước.
      </Typography>
      <Typography variant="body1" paragraph>
        Trong 5 năm qua, chúng tôi đã tiếp cận hơn 50,000 người thông qua các chương trình giáo dục, hội thảo, và chiến dịch truyền thông, đồng thời hỗ trợ hơn 1,000 cá nhân và gia đình bị ảnh hưởng bởi ma túy.
      </Typography>
    </section>
  );
};

export default History; 