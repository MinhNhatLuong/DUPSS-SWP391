package com.dupss.app.BE_Dupss.service.impl;

import com.dupss.app.BE_Dupss.entity.Appointment;
import com.dupss.app.BE_Dupss.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.UnsupportedEncodingException;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    
    @Value("${spring.mail.username}")
    private String fromEmail;


    @Async
    @Override
    public void sendAppointmentConfirmation(Appointment appointment) {
        try {
            log.info("Bắt đầu gửi email xác nhận đặt lịch cho cuộc hẹn ID: {}", appointment.getId());

            String subject = "Xác nhận đặt lịch tư vấn thành công";

            Context context = new Context();
            context.setVariable("appointment", appointment);

            if (appointment.getStatus().equals("CONFIRMED") && appointment.getLinkMeet() != null) {
                context.setVariable("showMeetLink", true);
                context.setVariable("dupssMeetLink", appointment.getLinkMeet());
            } else {
                context.setVariable("showGoogleMeetLink", false);
            }

            String content = templateEngine.process("email/appointment-confirmation", context);
            if (content == null || content.trim().isEmpty()) {
                throw new RuntimeException("Không thể tạo nội dung email từ template");
            }

            sendEmail(appointment.getEmail(), subject, content);
            log.info("Email xác nhận đặt lịch đã được gửi thành công tới: {}", appointment.getEmail());
        } catch (Exception e) {
            log.error("Lỗi khi gửi email xác nhận đặt lịch cho cuộc hẹn ID {}: {}",
                     appointment.getId(), e.getMessage(), e);
            // Không throw exception để không ảnh hưởng đến luồng chính
        }
    }
    
    @Async
    @Override
    public void sendAppointmentStatusUpdate(Appointment appointment, String previousStatus) {
        try {
            log.info("Bắt đầu gửi email cập nhật trạng thái cho cuộc hẹn ID: {}", appointment.getId());
            
            String subject = "Cập nhật trạng thái cuộc hẹn tư vấn";
            
            Context context = new Context();
            context.setVariable("appointment", appointment);
            context.setVariable("statusChangeMessage", getStatusChangeMessage(appointment.getStatus(), previousStatus));

            if ("CONFIRMED".equals(appointment.getStatus()) && appointment.getLinkMeet() != null) {
                context.setVariable("showGoogleMeetLink", true);
                context.setVariable("googleMeetLink", appointment.getLinkMeet());
            } else {
                context.setVariable("showGoogleMeetLink", false);
            }

            // Add special handling for COMPLETED status
            if ("COMPLETED".equals(appointment.getStatus())) {
                String reviewUrl = "https://dupssapp.id.vn/appointment/" + appointment.getId() + "/review";
                context.setVariable("showReviewLink", true);
                context.setVariable("reviewUrl", reviewUrl);
                log.info("Added review link for completed appointment ID: {}", appointment.getId());
            } else {
                context.setVariable("showReviewLink", false);
            }

            String content = templateEngine.process("email/appointment-status-update", context);
            if (content == null || content.trim().isEmpty()) {
                throw new RuntimeException("Không thể tạo nội dung email từ template");
            }
            
            sendEmail(appointment.getEmail(), subject, content);
            log.info("Email cập nhật trạng thái đã được gửi thành công tới: {}", appointment.getEmail());
        } catch (Exception e) {
            log.error("Lỗi khi gửi email cập nhật trạng thái cho cuộc hẹn ID {}: {}", 
                     appointment.getId(), e.getMessage(), e);
            // Không throw exception để không ảnh hưởng đến luồng chính
        }
    }
    //send mail welcome
    @Async
    @Override
    public void sendWelcomeEmail(String toEmail, String userName) throws MessagingException, UnsupportedEncodingException {
        Context context = new Context();
        context.setVariable("userName", userName);

        String htmlContent = templateEngine.process("email/welcome-email", context); // "welcome-email.html" trong templates

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, "UTF-8");

        helper.setFrom(fromEmail, "DUPSS Support");
        helper.setTo(toEmail);
        helper.setSubject("Chào mừng bạn đến với DUPSS");
        helper.setText(htmlContent, true);

        mailSender.send(message);
    }

    
    @Async
    @Override
    public void sendEmail(String to, String subject, String content) throws MessagingException, UnsupportedEncodingException {
        try {
            log.info("Bắt đầu gửi email đến: {}, với tiêu đề: {}", to, subject);
            
            if (to == null || to.trim().isEmpty()) {
                throw new IllegalArgumentException("Địa chỉ email người nhận không được để trống");
            }
            
            if (content == null || content.trim().isEmpty()) {
                throw new IllegalArgumentException("Nội dung email không được để trống");
            }
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail, "DUPSS Support");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true);
            
            mailSender.send(message);
            log.info("Email đã được gửi thành công đến: {}", to);
        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Lỗi khi gửi email đến {}: {}", to, e.getMessage());
            log.error("Chi tiết lỗi:", e);
            throw e;
        } catch (Exception e) {
            log.error("Lỗi không xác định khi gửi email đến {}: {}", to, e.getMessage());
            log.error("Chi tiết lỗi:", e);
            throw new MessagingException("Không thể gửi email: " + e.getMessage(), e);
        }
    }

    @Async
    @Override
    public void sendEnrollmentSuccessEmail(String toEmail, String userName,
                                           String courseTitle, int duration,
                                           String instructor, String enrollDate) throws MessagingException, UnsupportedEncodingException {

        Context context = new Context();
        context.setVariable("userName", userName);
        context.setVariable("courseTitle", courseTitle);
        context.setVariable("duration", duration);
        context.setVariable("instructor", instructor);
        context.setVariable("enrollDate", enrollDate);

        String htmlContent = templateEngine.process("email/course-enroll-success", context);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, "UTF-8");

        helper.setFrom(fromEmail, "DUPSS Support");
        helper.setTo(toEmail);
        helper.setSubject("Đăng ký khóa học thành công");
        helper.setText(htmlContent, true);

        mailSender.send(message);
    }

    @Async
    @Override
    public void sendCourseCompletionEmail(String toEmail,
                                          String userName,
                                          String courseTitle,
                                          int duration,
                                          String instructor,
                                          String completedDate) throws MessagingException, UnsupportedEncodingException {

        Context context = new Context();
        context.setVariable("userName", userName);
        context.setVariable("courseTitle", courseTitle);
        context.setVariable("duration", duration);
        context.setVariable("instructor", instructor);
        context.setVariable("completedDate", completedDate);

        String htmlContent = templateEngine.process("email/course-completed", context);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(
                message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, "UTF-8");

        helper.setFrom(fromEmail, "DUPSS Support");
        helper.setTo(toEmail);
        helper.setSubject("🎓 Bạn đã hoàn thành khóa học thành công!");
        helper.setText(htmlContent, true);

        mailSender.send(message);
    }

    @Async
    @Override
    public void sendPasswordChangedEmail(String toEmail, String userName, LocalDateTime changeTime) throws MessagingException, UnsupportedEncodingException {
        try {
            log.info("Bắt đầu gửi email thông báo đổi mật khẩu thành công đến: {}", toEmail);
            
            Context context = new Context();
            context.setVariable("userName", userName);
            context.setVariable("changeTime", changeTime.format(java.time.format.DateTimeFormatter.ofPattern("HH:mm:ss dd/MM/yyyy")));
            
            String htmlContent = templateEngine.process("email/password-changed", context);
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, "UTF-8");
            
            helper.setFrom(fromEmail, "DUPSS Support");
            helper.setTo(toEmail);
            helper.setSubject("Thông báo: Mật khẩu của bạn đã được thay đổi");
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("Email thông báo đổi mật khẩu đã được gửi thành công đến: {}", toEmail);
        } catch (Exception e) {
            log.error("Lỗi khi gửi email thông báo đổi mật khẩu đến {}: {}", toEmail, e.getMessage());
            log.error("Chi tiết lỗi:", e);
            throw e;
        }
    }

    private String getStatusChangeMessage(String newStatus, String previousStatus) {
        switch (newStatus) {
            case "CONFIRMED":
                return "Cuộc hẹn của bạn đã được xác nhận. Vui lòng đảm bảo tham gia đúng giờ.";
            case "CANCELLED":
                return "Cuộc hẹn của bạn đã bị hủy. Nếu bạn cần đặt lại, vui lòng truy cập trang web của chúng tôi.";
            case "COMPLETED":
                return "Cuộc hẹn của bạn đã hoàn thành. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.";
            default:
                return "Trạng thái cuộc hẹn của bạn đã được cập nhật từ " + 
                       getStatusVietnamese(previousStatus) + " thành " + 
                       getStatusVietnamese(newStatus) + ".";
        }
    }
    
    private String getStatusVietnamese(String status) {
        switch (status) {
            case "PENDING":
                return "Chờ xác nhận";
            case "CONFIRMED":
                return "Đã xác nhận";
            case "CANCELLED":
                return "Đã hủy";
            case "COMPLETED":
                return "Đã hoàn thành";
            default:
                return status;
        }
    }
} 