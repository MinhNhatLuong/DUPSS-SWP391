import { useState } from 'react';

const LatestNews = () => {
  // Mock data for latest news
  const [newsData] = useState([
    {
      id: 1,
      image: "https://scontent.fsgn5-8.fna.fbcdn.net/v/t39.30808-6/474442296_1340811473939573_1541216496532365417_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeHvVklONlcXg1Zh0oANEQg8bj8flWpDvf5uPx-VakO9_qjJpSdrNseGXrYSGlZXq4SYJ1BkKJHik5WDzbfvkUuE&_nc_ohc=s__sb3ISASQQ7kNvwE6UpCe&_nc_oc=Adk2s1Ke5uZceb-mDTC66dszhLSaUSDkjJmtXJoBy383W1-dgNridoPC0mBUpTUaC8wo19VGC7qYFiygc_FEWhHg&_nc_zt=23&_nc_ht=scontent.fsgn5-8.fna&_nc_gid=Z-tOXFSnM1fdWXGGnf5F4A&oh=00_AfPhIa6wpPPoxrIBn6IV4YTzqqJE3Xm0Z8p1UQt7kB52dw&oe=684A5A08",
      tag: "Giáo dục",
      title: "Chương trình giáo dục phòng chống ma túy tại trường học",
      content: "Triển khai chương trình giáo dục phòng chống ma túy tại các trường học trên toàn quốc...",
      url: "/blogs/education-program"
    },
    {
      id: 2,
      image: "https://scontent.fsgn5-14.fna.fbcdn.net/v/t39.30808-1/476314747_1385229409130567_8947152286196030311_n.jpg?stp=dst-jpg_s480x480_tt6&_nc_cat=106&ccb=1-7&_nc_sid=e99d92&_nc_eui2=AeHh2P225HKWb7oB0WAerP85L8gwaY_BjBUvyDBpj8GMFd4aN63olwiPb8Go8a7iNWUJGa-sHI4VCuvpyuiqXbYs&_nc_ohc=xUS4oMohGgIQ7kNvwFD4TVN&_nc_oc=AdmIl0TDJTMeof_hgnL32LoQtM_NV8-EacsZ0xGvL2hNWdO8QIft2MSVaF__Ga04zlcDHLgc9cyfKgTnLH_tJcm-&_nc_zt=24&_nc_ht=scontent.fsgn5-14.fna&_nc_gid=ABsgU9_mKy2uKnte54OIZQ&oh=00_AfNKiwfOn755u_vj8ozGzRhpM4vBKmpN4sCNhbrBYZQS5A&oe=684A32AF",
      tag: "Cộng đồng",
      title: "Hoạt động tình nguyện phòng chống ma túy tại cộng đồng",
      content: "Các hoạt động tình nguyện phòng chống ma túy đang được triển khai rộng rãi tại nhiều địa phương...",
      url: "/blogs//education-program"
    },
    {
      id: 3,
      image: "https://scontent.fsgn5-3.fna.fbcdn.net/v/t39.30808-6/480459884_1173203430862389_3609239197064390599_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeECfACjzjn7ulI73jwxX4TfbVR2nJGgSlBtVHackaBKUEjinTwUv5yeutF6LDL-h5y9C8_4tpjEnW6nFPiOePvS&_nc_ohc=p6Tqj6zzH2oQ7kNvwGipNTl&_nc_oc=AdlBPIvBAK-bCx6_uBGvblNKm4KSdUJYN-uFRivMsEf8G3GB07guxN1x3E80ibiIRiLcKgd64G52kcLWLLuC5YnM&_nc_zt=23&_nc_ht=scontent.fsgn5-3.fna&_nc_gid=4BAOWpnztB7zcgRCanJxmA&oh=00_AfN7EGS0ZmWkTBeUtlr-Y6suvwrRliEBWRc8WI2a1PqzsQ&oe=684A459D",
      tag: "Nghiên cứu",
      title: "Phương pháp mới trong điều trị nghiện ma túy",
      content: "Các nhà khoa học đã phát triển phương pháp mới giúp điều trị hiệu quả tình trạng nghiện ma túy...",
      url: "/blogs/education-program"
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