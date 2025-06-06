import { Box, Typography, Button, Container } from '@mui/material';

const HeroBanner = () => {
  return (
    <section className="hero-banner">
      <div className="hero-content">
        <h1>Phòng Ngừa Sử Dụng Ma Túy Trong Cộng Đồng</h1>
        <p>Chung tay xây dựng cộng đồng lành mạnh, phòng chống tác hại của ma túy</p>
        <a href="/about-us" className="cta-button">Tìm hiểu thêm</a>
      </div>
    </section>
  );
};

export default HeroBanner;