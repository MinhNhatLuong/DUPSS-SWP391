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

import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    private static final String DATE_FORMAT = "dd/MM/yyyy";
    private static final String TIME_FORMAT = "HH:mm";
    
    @Override
    public void sendAppointmentConfirmation(Appointment appointment) {
        try {
            String subject = "Xác nhận đặt lịch tư vấn thành công";
            String content = buildAppointmentConfirmationEmail(appointment);
            sendEmail(appointment.getEmail(), subject, content);
            log.info("Email xác nhận đặt lịch đã được gửi tới: {}", appointment.getEmail());
        } catch (Exception e) {
            log.error("Lỗi khi gửi email xác nhận đặt lịch: {}", e.getMessage());
        }
    }
    
    @Override
    public void sendAppointmentStatusUpdate(Appointment appointment, String previousStatus) {
        try {
            String subject = "Cập nhật trạng thái cuộc hẹn tư vấn";
            String content = buildAppointmentStatusUpdateEmail(appointment, previousStatus);
            sendEmail(appointment.getEmail(), subject, content);
            log.info("Email cập nhật trạng thái cuộc hẹn đã được gửi tới: {}", appointment.getEmail());
        } catch (Exception e) {
            log.error("Lỗi khi gửi email cập nhật trạng thái: {}", e.getMessage());
        }
    }
    
    private void sendEmail(String to, String subject, String content) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(content, true);
        
        mailSender.send(message);
    }
    
    private String buildAppointmentConfirmationEmail(Appointment appointment) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern(DATE_FORMAT);
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern(TIME_FORMAT);
        
        return "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;'>" +
                "<h2 style='color: #4285f4; text-align: center;'>Xác nhận đặt lịch tư vấn</h2>" +
                "<p>Kính gửi <strong>" + appointment.getCustomerName() + "</strong>,</p>" +
                "<p>Cảm ơn bạn đã đặt lịch tư vấn với chúng tôi. Dưới đây là thông tin chi tiết về cuộc hẹn của bạn:</p>" +
                "<div style='background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;'>" +
                "<p><strong>Mã cuộc hẹn:</strong> " + appointment.getId() + "</p>" +
                "<p><strong>Ngày hẹn:</strong> " + appointment.getAppointmentDate().format(dateFormatter) + "</p>" +
                "<p><strong>Giờ hẹn:</strong> " + appointment.getAppointmentTime().format(timeFormatter) + "</p>" +
                "<p><strong>Chủ đề tư vấn:</strong> " + appointment.getTopic().getName() + "</p>" +
                "<p><strong>Tư vấn viên:</strong> " + appointment.getConsultant().getName() + "</p>" +
                "<p><strong>Trạng thái:</strong> " + getStatusVietnamese(appointment.getStatus()) + "</p>" +
                "</div>" +
                "<p>Vui lòng lưu ý rằng tư vấn viên của chúng tôi sẽ liên hệ với bạn để xác nhận cuộc hẹn. " +
                "Nếu bạn có bất kỳ thắc mắc nào, đừng ngần ngại liên hệ với chúng tôi qua email hoặc số điện thoại đã cung cấp.</p>" +
                "<p style='margin-top: 30px;'>Trân trọng,<br>Đội ngũ tư vấn</p>" +
                "</div>";
    }
    
    private String buildAppointmentStatusUpdateEmail(Appointment appointment, String previousStatus) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern(DATE_FORMAT);
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern(TIME_FORMAT);
        
        String statusChangeMessage;
        if (appointment.getStatus().equals("CONFIRMED")) {
            statusChangeMessage = "Cuộc hẹn của bạn đã được xác nhận. Vui lòng đảm bảo tham gia đúng giờ.";
        } else if (appointment.getStatus().equals("CANCELED")) {
            statusChangeMessage = "Cuộc hẹn của bạn đã bị hủy. Nếu bạn cần đặt lại, vui lòng truy cập trang web của chúng tôi.";
        } else if (appointment.getStatus().equals("COMPLETED")) {
            statusChangeMessage = "Cuộc hẹn của bạn đã hoàn thành. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.";
        } else {
            statusChangeMessage = "Trạng thái cuộc hẹn của bạn đã được cập nhật từ " + getStatusVietnamese(previousStatus) + 
                    " thành " + getStatusVietnamese(appointment.getStatus()) + ".";
        }
        
        return "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;'>" +
                "<h2 style='color: #4285f4; text-align: center;'>Cập nhật trạng thái cuộc hẹn</h2>" +
                "<p>Kính gửi <strong>" + appointment.getCustomerName() + "</strong>,</p>" +
                "<p>" + statusChangeMessage + "</p>" +
                "<div style='background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;'>" +
                "<p><strong>Mã cuộc hẹn:</strong> " + appointment.getId() + "</p>" +
                "<p><strong>Ngày hẹn:</strong> " + appointment.getAppointmentDate().format(dateFormatter) + "</p>" +
                "<p><strong>Giờ hẹn:</strong> " + appointment.getAppointmentTime().format(timeFormatter) + "</p>" +
                "<p><strong>Chủ đề tư vấn:</strong> " + appointment.getTopic().getName() + "</p>" +
                "<p><strong>Tư vấn viên:</strong> " + appointment.getConsultant().getName() + "</p>" +
                "<p><strong>Trạng thái mới:</strong> " + getStatusVietnamese(appointment.getStatus()) + "</p>" +
                "</div>" +
                "<p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email hoặc số điện thoại đã cung cấp.</p>" +
                "<p style='margin-top: 30px;'>Trân trọng,<br>Đội ngũ tư vấn</p>" +
                "</div>";
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