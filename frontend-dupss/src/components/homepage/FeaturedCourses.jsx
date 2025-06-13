import { useState, useEffect } from 'react';
import axios from 'axios';

const FeaturedCourses = () => {
  const [coursesData, setCoursesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('/api/public/courses/latest');
        setCoursesData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <section className="featured-courses">
      <div className="section-container">
        <h2 className="section-title">Khóa học nổi bật</h2>
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <div className="courses-grid">
            {coursesData.map(course => (
              <div className="course-card" key={course.id}>
                <div className="course-image">
                  <img src={course.coverImage || 'https://via.placeholder.com/300x200'} alt={course.title} />
                </div>
                <div className="course-content">
                  <h3>{course.title}</h3>
                  <p>{course.summary || 'Không có mô tả'}</p>
                  <a href={`/course-detail/${course.id}`} className="course-btn">Xem chi tiết</a>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="view-all">
          <a href="/courses">Xem tất cả khóa học</a>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;