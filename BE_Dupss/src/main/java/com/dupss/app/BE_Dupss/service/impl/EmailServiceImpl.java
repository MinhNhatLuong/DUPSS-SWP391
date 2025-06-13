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
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.UnsupportedEncodingException;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    @Override
    public void sendAppointmentConfirmation(Appointment appointment) {
        try {
            log.info("Bắt đầu gửi email xác nhận đặt lịch cho cuộc hẹn ID: {}", appointment.getId());
            
            String subject = "Xác nhận đặt lịch tư vấn thành công";
            
            Context context = new Context();
            context.setVariable("appointment", appointment);
            
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
    
    @Override
    public void sendAppointmentStatusUpdate(Appointment appointment, String previousStatus) {
        try {
            log.info("Bắt đầu gửi email cập nhật trạng thái cho cuộc hẹn ID: {}", appointment.getId());
            
            String subject = "Cập nhật trạng thái cuộc hẹn tư vấn";
            
            Context context = new Context();
            context.setVariable("appointment", appointment);
            context.setVariable("statusChangeMessage", getStatusChangeMessage(appointment.getStatus(), previousStatus));
            
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
    
    private void sendEmail(String to, String subject, String content) throws MessagingException, UnsupportedEncodingException {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail, "DUPSS Support");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true);
            
            mailSender.send(message);
            log.debug("Email đã được gửi thành công tới: {}", to);
        } catch (Exception e) {
            log.error("Lỗi khi gửi email tới {}: {}", to, e.getMessage(), e);
            throw e;
        }
    }
    
    private String getStatusChangeMessage(String newStatus, String previousStatus) {
        switch (newStatus) {
            case "CONFIRMED":
                return "Cuộc hẹn của bạn đã được xác nhận. Vui lòng đảm bảo tham gia đúng giờ.";
            case "CANCELED":
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
            case "CANCELED":
                return "Đã hủy";
            case "COMPLETED":
                return "Đã hoàn thành";
            default:
                return status;
        }
    }
} 