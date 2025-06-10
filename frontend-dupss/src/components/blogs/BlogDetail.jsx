import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box } from '@mui/material';
import BlogHeader from './BlogHeader';
import BlogContent from './BlogContent';
import AuthorBio from './AuthorBio';
import CommentSection from './CommentSection';
import RelatedArticles from './RelatedArticles';

// Fake blog data structure
const fakeData = {
  blog: {
    title: "Chương trình giáo dục phòng chống ma túy tại trường học",
    shortDescription: "Triển khai chương trình giáo dục phòng chống ma túy tại các trường học trên toàn quốc đang là một trong những ưu tiên hàng đầu của Bộ Giáo dục và Đào tạo nhằm nâng cao nhận thức và kỹ năng phòng tránh ma túy cho học sinh, sinh viên.",
    createdDate: "15/11/2023",
    thumbnail: "http://thptnguyendu.hatinh.edu.vn/upload/58158/fck/42000708/2024_08_29_15_23_594.jpg",
    tag: "Giáo dục",
    id: "education-program",
    blogContent: `<p class="article-intro">Triển khai chương trình giáo dục phòng chống ma túy tại các trường học trên toàn quốc đang là một trong những ưu tiên hàng đầu của Bộ Giáo dục và Đào tạo nhằm nâng cao nhận thức và kỹ năng phòng tránh ma túy cho học sinh, sinh viên.</p>

    <h2>Tầm quan trọng của giáo dục phòng chống ma túy trong trường học</h2>
    <p>Theo thống kê của Cục Cảnh sát điều tra tội phạm về ma túy (C04) - Bộ Công an, số lượng thanh thiếu niên sử dụng và nghiện ma túy có xu hướng gia tăng trong những năm gần đây. Đặc biệt, độ tuổi sử dụng ma túy ngày càng trẻ hóa, với nhiều trường hợp học sinh cấp 2, cấp 3 đã tiếp xúc với các chất gây nghiện.</p>

    <p>Trước thực trạng đáng báo động này, việc đưa chương trình giáo dục phòng chống ma túy vào trường học được xem là giải pháp căn cơ và lâu dài. Chương trình không chỉ cung cấp kiến thức về tác hại của ma túy mà còn trang bị cho học sinh kỹ năng nhận biết, từ chối và phòng tránh ma túy một cách hiệu quả.</p>

    <blockquote>
        "Giáo dục phòng chống ma túy trong trường học không chỉ là trách nhiệm của ngành giáo dục mà còn là trách nhiệm của toàn xã hội. Chúng ta cần chung tay bảo vệ thế hệ trẻ khỏi hiểm họa ma túy." - Ông Nguyễn Văn B, Thứ trưởng Bộ Giáo dục và Đào tạo.
    </blockquote>

    <h2>Nội dung chương trình giáo dục phòng chống ma túy</h2>
    <p>Chương trình giáo dục phòng chống ma túy được thiết kế phù hợp với từng cấp học, lứa tuổi, bao gồm các nội dung chính sau:</p>

    <ul class="article-list">
        <li><strong>Kiến thức cơ bản về ma túy:</strong> Giúp học sinh hiểu về các loại ma túy phổ biến, tác hại của chúng đối với sức khỏe thể chất, tinh thần và đời sống xã hội.</li>
        <li><strong>Kỹ năng nhận biết và từ chối ma túy:</strong> Trang bị cho học sinh khả năng nhận biết các tình huống có nguy cơ cao, cách từ chối khi bị dụ dỗ, lôi kéo sử dụng ma túy.</li>
        <li><strong>Pháp luật về phòng chống ma túy:</strong> Giới thiệu các quy định pháp luật liên quan đến ma túy, hậu quả pháp lý của việc tàng trữ, sử dụng, mua bán trái phép chất ma túy.</li>
        <li><strong>Kỹ năng sống lành mạnh:</strong> Hướng dẫn học sinh xây dựng lối sống lành mạnh, biết cách quản lý stress, áp lực học tập và các mối quan hệ xã hội.</li>
    </ul>

    <h2>Phương pháp triển khai</h2>
    <p>Chương trình được triển khai thông qua nhiều hình thức đa dạng, phù hợp với đặc điểm tâm lý lứa tuổi học sinh:</p>

    <ul class="article-list">
        <li><strong>Lồng ghép trong các môn học:</strong> Nội dung giáo dục phòng chống ma túy được tích hợp vào các môn học như Sinh học, Giáo dục công dân, Hoạt động trải nghiệm.</li>
        <li><strong>Hoạt động ngoại khóa:</strong> Tổ chức các cuộc thi, hội thảo, tọa đàm, triển lãm về chủ đề phòng chống ma túy.</li>
        <li><strong>Câu lạc bộ học sinh:</strong> Thành lập các câu lạc bộ tuyên truyền phòng chống ma túy do chính học sinh làm nòng cốt.</li>
        <li><strong>Ứng dụng công nghệ:</strong> Sử dụng các ứng dụng, trò chơi tương tác, video clip để truyền tải thông điệp một cách sinh động, hấp dẫn.</li>
    </ul>

    <h2>Kết luận</h2>
    <p>Chương trình giáo dục phòng chống ma túy tại trường học là một bước đi quan trọng trong chiến lược phòng chống ma túy quốc gia. Với sự đầu tư đúng mức và sự phối hợp chặt chẽ giữa các bên liên quan, chương trình hứa hẹn sẽ góp phần đáng kể vào việc giảm thiểu tình trạng học sinh, sinh viên sử dụng ma túy, bảo vệ thế hệ trẻ - tương lai của đất nước.</p>`,
    authorName: "Nguyễn Tấn Dũng",
    authorImage: "https://upload.wikimedia.org/wikipedia/commons/e/e2/Nguyen_Tan_Dung.jpg",
    authorDescription: "Chuyên gia giáo dục với hơn 15 năm kinh nghiệm trong lĩnh vực phòng chống ma túy học đường. Tác giả của nhiều nghiên cứu và sách về giáo dục kỹ năng sống cho thanh thiếu niên."
  },
  comments: [
    {
      id: 1,
      author: "Trần Văn A",
      avatarUrl: "https://i.pravatar.cc/60?img=1",
      date: "12/11/2023, 15:30",
      content: "Bài viết rất hữu ích. Tôi nghĩ chương trình này nên được triển khai rộng rãi hơn nữa, đặc biệt ở các vùng nông thôn, miền núi.",
      likes: 12,
      dislikes: 2
    },
    {
      id: 2,
      author: "Nguyễn Thị B",
      avatarUrl: "https://i.pravatar.cc/60?img=2",
      date: "13/11/2023, 09:15",
      content: "Tôi là giáo viên THPT và đã tham gia triển khai chương trình này tại trường. Học sinh rất hứng thú với các hoạt động thực hành và trò chơi tương tác. Tuy nhiên, chúng tôi vẫn gặp khó khăn trong việc thu hút sự tham gia của phụ huynh.",
      likes: 8,
      dislikes: 0,
      replies: [
        {
          id: 3,
          author: "Nguyễn Tấn Dũng",
          isAuthor: true,
          avatarUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e2/Nguyen_Tan_Dung.jpg",
          date: "13/11/2023, 10:45",
          content: "Cảm ơn bạn đã chia sẻ kinh nghiệm thực tế. Về vấn đề thu hút phụ huynh, chúng tôi đang phát triển một số tài liệu hướng dẫn và video ngắn để giúp giáo viên tổ chức các buổi họp phụ huynh hiệu quả hơn. Bạn có thể liên hệ với chúng tôi qua email để nhận được hỗ trợ.",
          likes: 5,
          dislikes: 0
        }
      ]
    },
    {
      id: 4,
      author: "Lê Văn C",
      avatarUrl: "https://i.pravatar.cc/60?img=3",
      date: "14/11/2023, 14:20",
      content: "Tôi muốn biết liệu có thể áp dụng chương trình này cho các em nhỏ ở cấp tiểu học không? Hiện nay con tôi đang học lớp 4 và tôi muốn con mình được trang bị kiến thức phòng tránh ma túy từ sớm.",
      likes: 3,
      dislikes: 1
    }
  ],
  relatedArticles: [
    {
      id: "drug-prevention-methods",
      title: "Phương pháp mới trong điều trị nghiện ma túy",
      thumbnail: "https://static.scientificamerican.com/sciam/cache/file/BC2412FA-1388-43B7-877759A80E201C16_source.jpg",
      shortDescription: "Các nhà khoa học đã phát triển phương pháp mới giúp điều trị hiệu quả tình trạng nghiện ma túy...",
      tag: "Nghiên cứu"
    },
    {
      id: "community-activities",
      title: "Hoạt động tình nguyện phòng chống ma túy tại cộng đồng",
      thumbnail: "https://static.scientificamerican.com/sciam/cache/file/BC2412FA-1388-43B7-877759A80E201C16_source.jpg",
      shortDescription: "Các hoạt động tình nguyện phòng chống ma túy đang được triển khai rộng rãi tại nhiều địa phương...",
      tag: "Cộng đồng"
    },
    {
      id: "saying-no-skills",
      title: "Kỹ năng từ chối ma túy cho thanh thiếu niên",
      thumbnail: "https://static.scientificamerican.com/sciam/cache/file/BC2412FA-1388-43B7-877759A80E201C16_source.jpg",
      shortDescription: "Làm thế nào để thanh thiếu niên có thể tự tin từ chối khi bị dụ dỗ sử dụng ma túy?",
      tag: "Giáo dục"
    }
  ]
};

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real application, we would fetch the blog data by ID from an API
    // For now, we'll use the fake data
    setTimeout(() => {
      setBlog(fakeData.blog);
      setLoading(false);
    }, 500); // Simulate loading time
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  if (!blog) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
        <Typography>Không tìm thấy bài viết</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 8, px: { xs: 1, sm: 2, md: 3 } }}>
      <BlogHeader 
        title={blog.title}
        tag={blog.tag}
        date={blog.createdDate}
        author={blog.authorName}
        thumbnail={blog.thumbnail}
      />
      
      <BlogContent content={blog.blogContent} />
      
      <AuthorBio 
        name={blog.authorName}
        image={blog.authorImage}
        description={blog.authorDescription}
      />
      
      <CommentSection comments={fakeData.comments} />
      
      <Box sx={{ mx: -1 }}>
        <RelatedArticles articles={fakeData.relatedArticles} />
      </Box>
    </Container>
  );
};

export default BlogDetail; 