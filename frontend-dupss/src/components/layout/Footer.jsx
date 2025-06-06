import { Box, Container, Grid, Typography, Link, IconButton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';

const Footer = () => {
  return (
    <footer>
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-column">
            <h3>Về DUPSS</h3>
            <p>DUPSS là dự án phòng ngừa sử dụng ma túy trong cộng đồng của tổ chức tình nguyện, nhằm nâng cao nhận thức và giáo dục cộng đồng về tác hại của ma túy.</p>
          </div>
          
          <div className="footer-column">
            <h3>Liên kết nhanh</h3>
            <ul>
              <li><a href="/">Trang chủ</a></li>
              <li><a href="/courses">Khóa học</a></li>
              <li><a href="/blogs">Tin tức & Blog</a></li>
              <li><a href="/survey">Khảo sát</a></li>
              <li><a href="/appointment">Đặt lịch hẹn</a></li>
              <li><a href="/about-us">Về chúng tôi</a></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h3>Tài nguyên</h3>
            <ul>
              <li><a href="#">Thư viện tài liệu</a></li>
              <li><a href="#">Video giáo dục</a></li>
              <li><a href="#">Infographics</a></li>
              <li><a href="#">Báo cáo nghiên cứu</a></li>
              <li><a href="#">Câu hỏi thường gặp</a></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h3>Liên hệ</h3>
            <p><i className="fas fa-map-marker-alt"></i> 123 Đường Nguyễn Tấn Dũng, Quận Nguyễn Thành Đạt, TP. Lương Gia Lâm</p>
            <p><i className="fas fa-phone"></i> (84) 123-456-789</p>
            <p><i className="fas fa-envelope"></i> info@dupss.org</p>
            <div className="social-media">
              <a href="#"><i className="fab fa-facebook-f"></i></a>
              <a href="#"><i className="fab fa-twitter"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
              <a href="#"><i className="fab fa-youtube"></i></a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2023 DUPSS - Dự án Phòng ngừa Sử dụng Ma túy trong Cộng đồng. Tất cả quyền được bảo lưu.</p>
          <div className="footer-links">
            <a href="#">Chính sách bảo mật</a>
            <a href="#">Điều khoản sử dụng</a>
            <a href="#">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;