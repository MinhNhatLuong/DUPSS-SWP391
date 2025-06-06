import { useState } from 'react';

const FeaturedCourses = () => {
  // Mock data for featured courses
  const [coursesData] = useState([
    {
      id: 1,
      image: "https://static.scientificamerican.com/sciam/cache/file/BC2412FA-1388-43B7-877759A80E201C16_source.jpg",
      title: "Nhận biết và phòng tránh ma túy",
      description: "Khóa học cung cấp kiến thức cơ bản về các loại ma túy phổ biến, cách nhận biết và phòng tránh hiệu quả.",
      duration: "8 tuần",
      students: "1,245"
    },
    {
      id: 2,
      image: "https://static.scientificamerican.com/sciam/cache/file/BC2412FA-1388-43B7-877759A80E201C16_source.jpg",
      title: "Kỹ năng từ chối ma túy",
      description: "Khóa học giúp thanh thiếu niên phát triển kỹ năng từ chối và đối phó với áp lực từ bạn bè về sử dụng ma túy.",
      duration: "6 tuần",
      students: "987"
    },
    {
      id: 3,
      image: "https://static.scientificamerican.com/sciam/cache/file/BC2412FA-1388-43B7-877759A80E201C16_source.jpg",
      title: "Hỗ trợ người thân nghiện ma túy",
      description: "Khóa học dành cho gia đình có người thân nghiện ma túy, cung cấp kiến thức và kỹ năng hỗ trợ hiệu quả.",
      duration: "10 tuần",
      students: "756"
    }
  ]);

  return (
    <section className="featured-courses">
      <div className="section-container">
        <h2 className="section-title">Khóa học nổi bật</h2>
        <div className="courses-grid">
          {coursesData.map(course => (
            <div className="course-card" key={course.id}>
              <div className="course-image">
                <img src={course.image} alt={course.title} />
              </div>
              <div className="course-content">
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <div className="course-meta">
                  <span><i className="fas fa-clock"></i> {course.duration}</span>
                  <span><i className="fas fa-user-graduate"></i> {course.students} học viên</span>
                </div>
                <a href="/course-detail" className="course-btn">Xem chi tiết</a>
              </div>
            </div>
          ))}
        </div>
        <div className="view-all">
          <a href="/courses">Xem tất cả khóa học</a>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;