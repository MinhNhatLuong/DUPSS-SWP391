import { Typography, Box, Grid, Paper } from '@mui/material';

const Partners = () => {
  // Partners data (without images as requested)
  const partners = [
    'Bộ Y tế',
    'Bộ Giáo dục và Đào tạo',
    'UNICEF Việt Nam',
    'WHO Việt Nam'
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
        Đối tác của chúng tôi
      </Typography>
      
      <Typography variant="body1" paragraph>
      Dự án Phòng ngừa Sử dụng Ma túy trong Cộng đồng được triển khai với sự đồng hành và hỗ trợ tích cực từ nhiều đối tác chiến lược. Chúng tôi tự hào hợp tác với các cơ quan chức năng như công an địa phương, trung tâm y tế dự phòng, và các tổ chức xã hội, nhằm lan tỏa thông tin chính xác và nâng cao nhận thức cộng đồng về tác hại của ma túy.
      </Typography>
      <Typography variant="body1" paragraph>
      Bên cạnh đó, sự phối hợp chặt chẽ với các trường học, đoàn thanh niên, và các tổ chức phi chính phủ cũng đóng vai trò quan trọng trong việc triển khai các hoạt động truyền thông, đào tạo kỹ năng sống và tư vấn hỗ trợ người có nguy cơ. Sự hợp tác hiệu quả này chính là nền tảng vững chắc để dự án mở rộng quy mô, mang lại những giá trị thiết thực và bền vững cho cộng đồng.
      </Typography>
    </section>
  );
};

export default Partners; 