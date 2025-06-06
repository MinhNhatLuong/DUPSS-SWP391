import { useState } from 'react';

const LatestNews = () => {
  // Mock data for latest news
  const [newsData] = useState([
    {
      id: 1,
      image: "https://static.scientificamerican.com/sciam/cache/file/BC2412FA-1388-43B7-877759A80E201C16_source.jpg",
      tag: "Nổi bật",
      title: "Nghiên cứu mới về tác động của ma túy đối với thanh thiếu niên",
      content: "Các nhà nghiên cứu đã phát hiện ra những tác động lâu dài của việc sử dụng ma túy đối với sự phát triển não bộ ở thanh thiếu niên...",
      url: "/article-education-program",
      featured: true
    },
    {
      id: 2,
      image: "https://static.scientificamerican.com/sciam/cache/file/BC2412FA-1388-43B7-877759A80E201C16_source.jpg",
      tag: "Giáo dục",
      title: "Chương trình giáo dục phòng chống ma túy tại trường học",
      content: "Triển khai chương trình giáo dục phòng chống ma túy tại các trường học trên toàn quốc...",
      url: "/article-education-program",
      featured: false
    },
    {
      id: 3,
      image: "https://static.scientificamerican.com/sciam/cache/file/BC2412FA-1388-43B7-877759A80E201C16_source.jpg",
      tag: "Cộng đồng",
      title: "Hoạt động tình nguyện phòng chống ma túy tại cộng đồng",
      content: "Các hoạt động tình nguyện phòng chống ma túy đang được triển khai rộng rãi tại nhiều địa phương...",
      url: "/article-education-program",
      featured: false
    },
    {
      id: 4,
      image: "https://static.scientificamerican.com/sciam/cache/file/BC2412FA-1388-43B7-877759A80E201C16_source.jpg",
      tag: "Nghiên cứu",
      title: "Phương pháp mới trong điều trị nghiện ma túy",
      content: "Các nhà khoa học đã phát triển phương pháp mới giúp điều trị hiệu quả tình trạng nghiện ma túy...",
      url: "/article-education-program",
      featured: false
    }
  ]);

  // Featured news item
  const featuredNews = newsData.find(item => item.featured);
  
  // Regular news items
  const regularNews = newsData.filter(item => !item.featured);

  return (
    <section className="latest-news">
      <div className="section-container">
        <h2 className="section-title">Tin tức & Cập nhật mới nhất</h2>
        <div className="news-grid">
          {featuredNews && (
            <div className="news-card featured" style={{ display: 'flex', gap: '20px', background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
              <div className="news-image" style={{ flex: '1', maxWidth: '50%' }}>
                <img src={featuredNews.image} alt={featuredNews.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className="news-content" style={{ flex: '1', padding: '20px 20px 20px 0' }}>
                <span className="news-tag" style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: '#e6f7ff', color: '#0066cc', borderRadius: '4px', fontSize: '14px', marginBottom: '12px' }}>{featuredNews.tag}</span>
                <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>{featuredNews.title}</h3>
                <p style={{ marginBottom: '20px' }}>{featuredNews.content}</p>
                <a href={featuredNews.url} className="read-more" style={{ color: '#0066cc', textDecoration: 'none', fontWeight: 'bold' }}>Đọc tiếp</a>
              </div>
            </div>
          )}
          
          {regularNews.map(news => (
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