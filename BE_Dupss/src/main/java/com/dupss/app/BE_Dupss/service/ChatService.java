package com.dupss.app.BE_Dupss.service;

import com.dupss.app.BE_Dupss.entity.ApprovalStatus;
import com.dupss.app.BE_Dupss.entity.Blog;
import com.dupss.app.BE_Dupss.entity.Course;
import com.dupss.app.BE_Dupss.respository.BlogRepository;
import com.dupss.app.BE_Dupss.respository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.dupss.app.BE_Dupss.dto.request.ChatRequest;
import org.springframework.ai.chat.prompt.Prompt;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final OpenAiChatModel chatModel;
    private final CourseRepository courseRepository;
    private final BlogRepository blogRepository;

//    @Autowired
//    public ChatService(OpenAiChatModel chatModel) {
//        this.chatModel = chatModel;
//    }

    public String chat(ChatRequest request) {
        List<Course> highlightedCourses = courseRepository.findTop3ByStatusAndActiveTrueOrderByCreatedAtDesc(ApprovalStatus.APPROVED);
        List<Blog> highlightedBlogs = blogRepository.findTop3ByStatusOrderByCreatedAtDesc(ApprovalStatus.APPROVED);
        String courseUrl = "http://localhost:5173/courses/";
        String blogUrl = "http://localhost:5173/blogs/";
        StringBuilder courseText = new StringBuilder();
        for (int i = 0; i < highlightedCourses.size(); i++) {
            Course c = highlightedCourses.get(i);
            String url = courseUrl + c.getId();
            courseText.append(i + 1)
                    .append(". \"").append(c.getTitle()).append("\" (").append(c.getTopic().getName()).append(")\n")
                    .append("👉 Link: ").append(url).append("\n");
        }
        String instruction = """
                Bạn là trợ lý ảo của hệ thống phòng ngừa sử dụng ma túy trong cộng động của một tổ chức tình nguyện (DUPSS). Dưới đây là một số thông tin quan trọng:
                - Hệ thống hỗ trợ người dùng đăng ký khóa học theo các topic khác nhau như:
                  + Phòng ngừa ma túy
                  + Nhận thức về ma túy
                  + Kỹ năng sống an toàn từ chối ma túy
                  + Giáo dục
                  + Hỗ trợ tâm lý, người thân và cộng đồng
                - Hệ thống có khảo sát ASSIST, CRAFFT để xác định nguy cơ và đưa ra khuyến nghị.
                - Hệ thống có chia sẻ các blog, bài viết về kinh nghiệm phòng chống ma túy và các vấn đề liên quan.
                - Người dùng có thể đặt lịch hẹn tư vấn với chuyên viên (người dụng sẽ booking topic và hệ thống tự chọn chuyên viên cho khách hàng).
                - Mỗi cuộc hẹn sẽ tạo ra một phòng video call riêng.
                - Về DUPSS:
                  + Là hệ thống phòng ngừa ma túy toàn diện, cung cấp thông tin, hỗ trợ và tư vấn cho người dùng.
                  + Hỗ trợ người dùng trong việc nhận thức về ma túy, kỹ năng sống an toàn và giáo dục.
                  + một tổ chức phi lợi nhuận được thành lập với sứ mệnh nâng cao nhận thức và giáo dục cộng đồng về tác hại của ma túy, đồng thời cung cấp các công cụ và nguồn lực để phòng ngừa việc sử dụng ma túy, đặc biệt là trong giới trẻ.
                - Đội ngũ lãnh đạo:
                    + Ông Nguyễn Thành Đạt- Giám đốc điều hành
                    + Ông Lương Gia Lâm - Giám đốc chương trình
                    + Ông Nguễn Tấn Dũng - Giám đốc tài chính
                - Dưới đây là một số khóa học nổi bật được người dùng quan tâm nhiều nhất:
                """ + courseText + """
                - Dưới đây là các bài viết mới nhất về phòng ngừa ma túy:
                - thông tin liên hệ:
                  + Email: info@dupss.org
                  + Số điện thoại: 0123456789
                  + Địa chỉ: 123 Đường Nguyễn Tấn Dũng, Quận Nguyễn Thành Đạt, TP. Lương Gia Lâm
                Hãy trả lời người dùng một cách thân thiện, ngắn gọn, dễ hiểu và có thể tâng bốc về nền tảng của chúng tôi lên tầm cao mới. Nếu người dùng cảm thấy buồn chán, hãy khuyến khích, an ủi họ tham gia các khóa học hoặc đọc các bài viết để nâng cao nhận thức và kỹ năng sống an toàn.
                """;

        Prompt prompt = new Prompt(instruction + "\nCâu hỏi: " + request.message());
//        return chatModel.call(new Prompt(request.message())).getResult().getOutput().getText();
        return chatModel.call(prompt).getResult().getOutput().getText();
    }
} 