import { useState, useEffect } from 'react';
import axios from 'axios';

const LatestNews = () => {
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get('/api/public/blogs/latest');
        setNewsData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching news:', error);
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <section className="latest-news">
      <div className="section-container">
        <h2 className="section-title">Tin tức & Cập nhật mới nhất</h2>
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <div className="news-grid">
            {newsData.map(news => (
              <div className="news-card" key={news.id}>
                <div className="news-image">
                  <img src={news.coverImage || 'https://via.placeholder.com/300x200'} alt={news.title} />
                </div>
                <div className="news-content">
                  <span className="news-tag">{news.topic}</span>
                  <h3>{news.title}</h3>
                  <p>{news.summary}</p>
                  <a href={`/blogs/${news.id}`} className="read-more">Đọc tiếp</a>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="view-all">
          <a href="/blogs">Xem tất cả tin tức</a>
        </div>
      </div>
    </section>
  );
};

export default LatestNews;