import { Grid, Box, Typography, Container, Icon } from '@mui/material';

const PointsOfInterest = () => {
  // Points of interest data
  const pointsData = [
    {
      id: 1,
      icon: "fas fa-book-medical",
      title: "Giáo dục & Phòng ngừa",
      description: "Cung cấp thông tin và kiến thức về tác hại của ma túy, giúp nâng cao nhận thức và phòng ngừa hiệu quả."
    },
    {
      id: 2,
      icon: "fas fa-hands-helping",
      title: "Hỗ trợ Cộng đồng",
      description: "Các chương trình hỗ trợ cộng đồng, giúp đỡ những người bị ảnh hưởng bởi ma túy và gia đình họ."
    },
    {
      id: 3,
      icon: "fas fa-chart-line",
      title: "Nghiên cứu & Thống kê",
      description: "Cập nhật các nghiên cứu mới nhất và số liệu thống kê về tình hình sử dụng ma túy trong cộng đồng."
    },
    {
      id: 4,
      icon: "fas fa-user-md",
      title: "Tư vấn & Điều trị",
      description: "Thông tin về các phương pháp tư vấn và điều trị cho người nghiện ma túy, giúp họ quay trở lại cuộc sống bình thường."
    }
  ];

  return (
    <section className="points-of-interest">
      <div className="section-container">
        <h2 className="section-title">DUPSS Points of Interest</h2>
        <div className="poi-grid">
          {pointsData.map(point => (
            <div className="poi-card" key={point.id}>
              <div className="poi-icon">
                <i className={point.icon}></i>
              </div>
              <h3>{point.title}</h3>
              <p>{point.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PointsOfInterest;