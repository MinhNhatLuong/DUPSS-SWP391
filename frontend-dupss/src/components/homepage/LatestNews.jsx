import { useState } from 'react';

const LatestNews = () => {
  // Mock data for latest news
  const [newsData] = useState([
    {
      id: 1,
      image: "https://static.scientificamerican.com/sciam/cache/file/BC2412FA-1388-43B7-877759A80E201C16_source.jpg",
      tag: "Giáo dục",
      title: "Chương trình giáo dục phòng chống ma túy tại trường học",
      content: "Triển khai chương trình giáo dục phòng chống ma túy tại các trường học trên toàn quốc...",
      url: "/article-education-program"
    },
    {
      id: 2,
      image: "https://static.scientificamerican.com/sciam/cache/file/BC2412FA-1388-43B7-877759A80E201C16_source.jpg",
      tag: "Cộng đồng",
      title: "Hoạt động tình nguyện phòng chống ma túy tại cộng đồng",
      content: "Các hoạt động tình nguyện phòng chống ma túy đang được triển khai rộng rãi tại nhiều địa phương...",
      url: "/article-education-program"
    },
    {
      id: 3,
      image: "https://static.scientificamerican.com/sciam/cache/file/BC2412FA-1388-43B7-877759A80E201C16_source.jpg",
      tag: "Nghiên cứu",
      title: "Phương pháp mới trong điều trị nghiện ma túy",
      content: "Các nhà khoa học đã phát triển phương pháp mới giúp điều trị hiệu quả tình trạng nghiện ma túy...",
      url: "/article-education-program"
    }
  ]);

  return (
    <section className="latest-news">
      <div className="section-container">
        <h2 className="section-title">Tin tức & Cập nhật mới nhất</h2>
        <div className="news-grid">
          
          {newsData.map(news => (
            <div className="news-card" key={news.id}>
              <div className="news-image">
                <img src={news.image} alt={news.title} />
              </div>
              <div className="news-content">
                <span className="news-tag">{news.tag}</span>
                <h3>{news.title}</h3>
                <p>{news.content}</p>
                <a href={news.url} className="read-more">Đọc tiếp</a>
              </div>
            </div>
          ))}
        </div>
        <div className="view-all">
          <a href="/blogs">Xem tất cả tin tức</a>
        </div>
      </div>
    </section>
  );
};

export default LatestNews;