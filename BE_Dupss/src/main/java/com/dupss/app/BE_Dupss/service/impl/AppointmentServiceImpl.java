package com.dupss.app.BE_Dupss.service.impl;

import com.dupss.app.BE_Dupss.dto.request.AppointmentRequestDto;
import com.dupss.app.BE_Dupss.dto.request.AppointmentReviewRequest;
import com.dupss.app.BE_Dupss.dto.response.AppointmentResponseDto;
import com.dupss.app.BE_Dupss.entity.*;
import com.dupss.app.BE_Dupss.exception.ResourceNotFoundException;
import com.dupss.app.BE_Dupss.respository.*;
import com.dupss.app.BE_Dupss.service.AppointmentService;
import com.dupss.app.BE_Dupss.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final TopicRepo topicRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final SlotRepository slotRepository;

    @Override
    public AppointmentResponseDto createAppointment(AppointmentRequestDto requestDto) {
        // Lấy topic theo ID
        Topic topic = topicRepository.findByIdAndActive(requestDto.getTopicId(), true);
        if(topic == null) {
            throw new ResourceNotFoundException("Không tìm thấy chủ đề với ID: " + requestDto.getTopicId());
        }

//        LocalDateTime appointmentDateTime = LocalDateTime.of(requestDto.getAppointmentDate(), requestDto.getAppointmentTime());
//        if (appointmentDateTime.isBefore(LocalDateTime.now())) {
//            throw new IllegalArgumentException("Không được chọn ngày giờ trong quá khứ");
//        }
//
//        boolean isDuplicated = appointmentRepository.existsByDateTimeAndStatusNotCancelled(
//                requestDto.getAppointmentDate(),
//                requestDto.getAppointmentTime()
//        );

//        if (isDuplicated) {
//            throw new IllegalArgumentException("Đã có cuộc hẹn tại thời điểm này. Vui lòng chọn thời gian khác.");
//        }

        Slot selectedSlot = slotRepository.findById(requestDto.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy slot với ID: " + requestDto.getSlotId()));

        LocalDateTime appointmentDateTime = LocalDateTime.of(selectedSlot.getDate(), selectedSlot.getStartTime());
        if (appointmentDateTime.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Không được chọn ngày giờ trong quá khứ");
        }

        // Kiểm tra slot đã được đặt chưa
        if (!selectedSlot.isAvailable()) {
            throw new IllegalStateException("Slot này đã được đặt. Vui lòng chọn slot khác.");
        }

        // Lấy tư vấn viên từ slot
        User consultant = selectedSlot.getConsultant();
        if (consultant == null || !consultant.isEnabled()) {
            throw new ResourceNotFoundException("Không tìm thấy tư vấn viên hợp lệ cho slot này.");
        }

        // Khởi tạo đối tượng Appointment
        Appointment appointment = new Appointment();
        appointment.setCustomerName(requestDto.getCustomerName());
        appointment.setPhoneNumber(requestDto.getPhoneNumber());
        appointment.setEmail(requestDto.getEmail());
        appointment.setTopic(topic);
        appointment.setConsultant(consultant);

        appointment.setAppointmentDate(selectedSlot.getDate());
        appointment.setAppointmentTime(selectedSlot.getStartTime());

        // Nếu có userId, đây là thành viên đã đăng nhập
        if (requestDto.getUserId() != null) {
            User user = userRepository.findById(requestDto.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + requestDto.getUserId()));
            appointment.setUser(user);
            appointment.setGuest(false);
        } else {
            // Nếu không có userId, đây là khách
            appointment.setGuest(true);
        }
        appointment.setStatus("CONFIRMED");
        selectedSlot.setAvailable(false);
        slotRepository.save(selectedSlot);

        appointment.setLinkMeet(requestDto.getMeetingUrl());
        // Lưu vào database
        Appointment savedAppointment = appointmentRepository.save(appointment);
        try {
            emailService.sendAppointmentConfirmation(savedAppointment);
        } catch (Exception ex) {
            // Không rollback nếu lỗi gửi mail, chỉ log
            log.warn("Không thể gửi email xác nhận lịch hẹn: {}", ex.getMessage());
        }

        // Chuyển đổi thành AppointmentResponseDto và trả về
        return mapToResponseDto(savedAppointment);
    }

    @Override
    public List<AppointmentResponseDto> getAllAppointments() {
        List<Appointment> appointments = appointmentRepository.findAll();
        return appointments.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public AppointmentResponseDto getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc hẹn với ID: " + id));
        return mapToResponseDto(appointment);
    }

    @Override
    public List<AppointmentResponseDto> getAppointmentsByGuestEmail(String email) {
        List<Appointment> appointments = appointmentRepository.findByIsGuestAndEmailOrderByAppointmentDateDesc(true, email);
        return appointments.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentResponseDto> getAppointmentsByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));
        List<Appointment> appointments = appointmentRepository.findByUser(user);
        return appointments.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentResponseDto> getAllAppointmentsByUser(Long userId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("Người dùng chưa đăng nhập");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));
        List<Appointment> appointments = appointmentRepository.findByUser(user);
        return appointments.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentResponseDto> getAppointmentsByConsultantId(Long consultantId) {
        Optional<User> consultantOptional = userRepository.findById(consultantId);
        if (consultantOptional.isEmpty()) {
            return List.of(); // Trả về mảng rỗng nếu không tìm thấy tư vấn viên
        }
        
        List<Appointment> appointments = appointmentRepository.findByConsultant(consultantOptional.get());
        return appointments.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public AppointmentResponseDto updateAppointmentStatus(Long id, String status, Long consultantId) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc hẹn với ID: " + id));

        // Get the consultant
        User consultant = userRepository.findById(consultantId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tư vấn viên với ID: " + consultantId));
        
        // If appointment doesn't have a consultant, assign this consultant
        if (appointment.getConsultant() == null) {
            appointment.setConsultant(consultant);
        } 
        // If appointment has a different consultant, check if this consultant has permission
        else if (!Objects.equals(appointment.getConsultant().getId(), consultantId)) {
            throw new IllegalArgumentException("Tư vấn viên không có quyền cập nhật cuộc hẹn này");
        }

        // Kiểm tra status hợp lệ
        if (!isValidStatus(status)) {
            throw new IllegalArgumentException("Trạng thái không hợp lệ: " + status);
        }

        // Lưu trạng thái cũ để gửi email
        String previousStatus = appointment.getStatus();

        appointment.setStatus(status);
        Appointment updatedAppointment = appointmentRepository.save(appointment);

        // Gửi email cập nhật trạng thái
        emailService.sendAppointmentStatusUpdate(updatedAppointment, previousStatus);

        return mapToResponseDto(updatedAppointment);
    }

//    @Override
//    public AppointmentResponseDto updateAppointmentStatus(Long id, String status) {
//        // Phương thức này gây ra lỗi ép kiểu từ JWT sang User
//        // Thay vì cố gắng ép kiểu, chúng ta sẽ ném ngoại lệ và yêu cầu client sử dụng phương thức overload với consultantId
//        throw new IllegalArgumentException("Vui lòng cung cấp consultantId để cập nhật trạng thái cuộc hẹn");
//    }

    @Override
    public AppointmentResponseDto cancelAppointmentByUser(Long id, Long userId) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc hẹn với ID: " + id));

        // Kiểm tra xem cuộc hẹn có thuộc về user này không
        if (appointment.isGuest() || !Objects.equals(appointment.getUser().getId(), userId)) {
            throw new IllegalArgumentException("Người dùng không có quyền hủy cuộc hẹn này");
        }

        // Kiểm tra nếu cuộc hẹn đã hoàn thành hoặc đã hủy rồi
        if (appointment.getStatus().equals("COMPLETED") || appointment.getStatus().equals("CANCELED")) {
            throw new IllegalArgumentException("Không thể hủy cuộc hẹn đã " +
                    (appointment.getStatus().equals("COMPLETED") ? "hoàn thành" : "hủy"));
        }

        // Lưu trạng thái cũ để gửi email
        String previousStatus = appointment.getStatus();

        // Cập nhật trạng thái thành CANCELED
        appointment.setStatus("CANCELLED");
        Appointment updatedAppointment = appointmentRepository.save(appointment);

        Optional<Slot> selectedSlot = slotRepository.findByConsultantAndDateAndStartTime(
                appointment.getConsultant(),
                appointment.getAppointmentDate(),
                appointment.getAppointmentTime()
        );
        selectedSlot.ifPresent(slot -> {
            slot.setAvailable(true);
            slotRepository.save(slot);
        });

        // Gửi email thông báo hủy cuộc hẹn
        emailService.sendAppointmentStatusUpdate(updatedAppointment, previousStatus);

        return mapToResponseDto(updatedAppointment);
    }

    @Override
    public AppointmentResponseDto cancelAppointmentByGuest(Long id, String email) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc hẹn với ID: " + id));

        // Kiểm tra xem cuộc hẹn có thuộc về guest với email này không
        if (!appointment.isGuest() || !appointment.getEmail().equals(email)) {
            throw new IllegalArgumentException("Người dùng không có quyền hủy cuộc hẹn này");
        }

        // Kiểm tra nếu cuộc hẹn đã hoàn thành hoặc đã hủy rồi
        if (appointment.getStatus().equals("COMPLETED") || appointment.getStatus().equals("CANCELED")) {
            throw new IllegalArgumentException("Không thể hủy cuộc hẹn đã " +
                    (appointment.getStatus().equals("COMPLETED") ? "hoàn thành" : "hủy"));
        }

        // Lưu trạng thái cũ để gửi email
        String previousStatus = appointment.getStatus();

        // Cập nhật trạng thái thành CANCELED
        appointment.setStatus("CANCELED");
        Appointment updatedAppointment = appointmentRepository.save(appointment);

        // Gửi email thông báo hủy cuộc hẹn
        emailService.sendAppointmentStatusUpdate(updatedAppointment, previousStatus);

        return mapToResponseDto(updatedAppointment);
    }

    @Override
    public List<AppointmentResponseDto> getCompletedOrCanceledAppointmentsByConsultantId(Long consultantId) {
        Optional<User> consultantOptional = userRepository.findById(consultantId);
        if (consultantOptional.isEmpty()) {
            return List.of(); // Trả về mảng rỗng nếu không tìm thấy tư vấn viên
        }
        
        // Danh sách các trạng thái cần lấy: COMPLETED và CANCELED
        List<String> statuses = List.of("COMPLETED", "CANCELED");
        
        // Lấy danh sách các cuộc hẹn có trạng thái là COMPLETED hoặc CANCELED
        List<Appointment> appointments = appointmentRepository.findByConsultantAndStatusIn(consultantOptional.get(), statuses);
        
        return appointments.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentResponseDto> getUnassignedAppointments() {
        // Lấy tất cả các cuộc hẹn có trạng thái PENDING và consultant là placeholder (ID = 2)
        List<Appointment> appointments = appointmentRepository.findAll().stream()
                .filter(a -> "PENDING".equals(a.getStatus()) && 
                       a.getConsultant() != null && a.getConsultant().getId() == 2L)
                .collect(Collectors.toList());
        
        return appointments.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public AppointmentResponseDto claimAppointment(Long appointmentId, Long consultantId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc hẹn với ID: " + appointmentId));
        
        // Lấy thông tin tư vấn viên mới
        User consultant = userRepository.findById(consultantId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tư vấn viên với ID: " + consultantId));
        
        // Kiểm tra và cập nhật tư vấn viên
        if (appointment.getConsultant() != null && 
            !Objects.equals(appointment.getConsultant().getId(), consultantId) && 
            appointment.getConsultant().getId() != 2L) {
            // Nếu cuộc hẹn đã có tư vấn viên khác (không phải placeholder), cho phép thay đổi
            appointment.setConsultant(consultant);
        } else if (appointment.getConsultant() == null || appointment.getConsultant().getId() == 2L) {
            // Nếu chưa có tư vấn viên hoặc đang là placeholder consultant (ID = 2), gán tư vấn viên mới
            appointment.setConsultant(consultant);
        }
        
        // Cập nhật trạng thái nếu đang là PENDING
        if ("PENDING".equals(appointment.getStatus())) {
            String previousStatus = appointment.getStatus();
            appointment.setStatus("CONFIRMED");
            
            // Lưu vào database
            Appointment updatedAppointment = appointmentRepository.save(appointment);
            
            // Gửi email thông báo cập nhật trạng thái
            emailService.sendAppointmentStatusUpdate(updatedAppointment, previousStatus);
            
            return mapToResponseDto(updatedAppointment);
        } else {
            // Nếu không phải PENDING, chỉ cập nhật consultant
            Appointment updatedAppointment = appointmentRepository.save(appointment);
            return mapToResponseDto(updatedAppointment);
        }
    }

//    @Override
//    public AppointmentResponseDto approveAppointment(Long appointmentId, Long consultantId, String linkMeet) {
//        Appointment appointment = appointmentRepository.findById(appointmentId)
//                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc hẹn với ID: " + appointmentId));
//
//        // Lấy thông tin tư vấn viên
//        User consultant = userRepository.findById(consultantId)
//                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tư vấn viên với ID: " + consultantId));
//
//        // Kiểm tra quyền cập nhật
////        if (appointment.getConsultant() != null &&
////            !Objects.equals(appointment.getConsultant().getId(), consultantId) &&
////            appointment.getConsultant().getId() != 2L) {
////            throw new IllegalArgumentException("Tư vấn viên không có quyền cập nhật cuộc hẹn này");
////        }
//
//        // Cập nhật thông tin
//        appointment.setConsultant(consultant);
//        appointment.setStatus("CONFIRMED");
//        appointment.setLinkMeet(linkMeet);
//        // Lưu vào database
//        Appointment updatedAppointment = appointmentRepository.save(appointment);
//
//        // Gửi email thông báo duyệt cuộc hẹn với link Google Meet
//        emailService.sendAppointmentStatusUpdate(updatedAppointment, "PENDING");
//
//        return mapToResponseDto(updatedAppointment);
//    }

    @Override
    public AppointmentResponseDto startAppointment(Long appointmentId, Long consultantId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc hẹn với ID: " + appointmentId));

        // Kiểm tra quyền truy cập
        if (appointment.getConsultant() == null || 
            !Objects.equals(appointment.getConsultant().getId(), consultantId)) {
            throw new IllegalArgumentException("Tư vấn viên không có quyền cập nhật cuộc hẹn này");
        }

        // Kiểm tra trạng thái cuộc hẹn
        if (!appointment.getStatus().equals("CONFIRMED")) {
            throw new IllegalArgumentException("Chỉ có thể bắt đầu cuộc hẹn đã được xác nhận");
        }

        // Cập nhật thời gian bắt đầu
        appointment.setCheckInTime(java.time.LocalDateTime.now());
        
        // Lưu vào database
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        
        return mapToResponseDto(updatedAppointment);
    }

    @Override
    public AppointmentResponseDto endAppointment(Long appointmentId, Long consultantId, String consultantNote) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc hẹn với ID: " + appointmentId));

        if (appointment.getStatus().equalsIgnoreCase("COMPLETED")) {
            throw new IllegalStateException("Cuộc hẹn đã được hoàn thành trước đó");
        }

        // Kiểm tra quyền truy cập
        if (appointment.getConsultant() == null || 
            !Objects.equals(appointment.getConsultant().getId(), consultantId)) {
            throw new IllegalArgumentException("Tư vấn viên không có quyền cập nhật cuộc hẹn này");
        }

        // Kiểm tra đã bắt đầu cuộc hẹn chưa
        if (appointment.getCheckInTime() == null) {
            throw new IllegalArgumentException("Cuộc hẹn chưa được bắt đầu");
        }


        // Cập nhật thông tin
        java.time.LocalDateTime endTime = java.time.LocalDateTime.now();
        appointment.setCheckOutTime(endTime);
        appointment.setConsultantNote(consultantNote);
        
        // Kiểm tra thời lượng cuộc hẹn (tối thiểu 10 phút)
        java.time.Duration duration = java.time.Duration.between(appointment.getCheckInTime(), endTime);
        if (duration.toMinutes() < 10) {
            throw new IllegalArgumentException("Cuộc hẹn phải kéo dài ít nhất 10 phút");
        }
        
        // Cập nhật trạng thái
        appointment.setStatus("COMPLETED");
        
        // Lưu vào database
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        
        // Gửi email thông báo hoàn thành và yêu cầu đánh giá
        emailService.sendAppointmentStatusUpdate(updatedAppointment, "CONFIRMED");
        
        return mapToResponseDto(updatedAppointment);
    }

    @Override
    public AppointmentResponseDto cancelAppointmentByConsultant(Long appointmentId, Long consultantId, String reason) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc hẹn với ID: " + appointmentId));

        // Kiểm tra quyền truy cập
        if (appointment.getConsultant() == null || 
            !Objects.equals(appointment.getConsultant().getId(), consultantId)) {
            throw new IllegalArgumentException("Tư vấn viên không có quyền hủy cuộc hẹn này");
        }

        // Kiểm tra trạng thái cuộc hẹn
        if (!appointment.getStatus().equals("CONFIRMED") && !appointment.getStatus().equals("PENDING")) {
            throw new IllegalArgumentException("Chỉ có thể hủy cuộc hẹn đang chờ hoặc đã xác nhận");
        }

        // Lưu trạng thái cũ
        String previousStatus = appointment.getStatus();

        // Cập nhật thông tin
        appointment.setStatus("CANCELED");
        appointment.setConsultantNote(reason);
        
        // Lưu vào database
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        
        // Gửi email thông báo hủy cuộc hẹn
        emailService.sendAppointmentStatusUpdate(updatedAppointment, previousStatus);
        
        return mapToResponseDto(updatedAppointment);
    }

    @Override
    public AppointmentResponseDto reviewAppointment(Long appointmentId, AppointmentReviewRequest reviewRequest) {

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc hẹn với ID: " + appointmentId));


        // Kiểm tra trạng thái cuộc hẹn
        if (!appointment.getStatus().equals("COMPLETED")) {
            throw new IllegalArgumentException("Chỉ có thể đánh giá cuộc hẹn đã hoàn thành");
        }

        // Kiểm tra đã đánh giá chưa
        if (appointment.isReview()) {
            throw new IllegalArgumentException("Cuộc hẹn này đã được đánh giá");
        }

        // Kiểm tra điểm đánh giá
        if (reviewRequest.getReviewScore() < 1 || reviewRequest.getReviewScore() > 5) {
            throw new IllegalArgumentException("Điểm đánh giá phải từ 1 đến 5");
        }

        // Cập nhật thông tin
        appointment.setReviewScore(reviewRequest.getReviewScore());
        appointment.setCustomerReview(reviewRequest.getCustomerReview());
        appointment.setReview(true);
        
        // Lưu vào database
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        
        return mapToResponseDto(updatedAppointment);
    }

    @Override
    public AppointmentResponseDto reviewAppointmentByGuest(Long appointmentId, Integer reviewScore, String customerReview, String email) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc hẹn với ID: " + appointmentId));

        // Kiểm tra quyền truy cập
        if (!appointment.isGuest() || !appointment.getEmail().equals(email)) {
            throw new IllegalArgumentException("Email không khớp với email đã đăng ký cuộc hẹn");
        }

        // Kiểm tra trạng thái cuộc hẹn
        if (!appointment.getStatus().equals("COMPLETED")) {
            throw new IllegalArgumentException("Chỉ có thể đánh giá cuộc hẹn đã hoàn thành");
        }

        // Kiểm tra đã đánh giá chưa
        if (appointment.isReview()) {
            throw new IllegalArgumentException("Cuộc hẹn này đã được đánh giá");
        }

        // Kiểm tra điểm đánh giá
        if (reviewScore < 1 || reviewScore > 5) {
            throw new IllegalArgumentException("Điểm đánh giá phải từ 1 đến 5");
        }

        // Cập nhật thông tin
        appointment.setReviewScore(reviewScore);
        appointment.setCustomerReview(customerReview);
        appointment.setReview(true);
        
        // Lưu vào database
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        
        return mapToResponseDto(updatedAppointment);
    }

    private boolean isValidStatus(String status) {
        return status.equals("PENDING") ||
                status.equals("CONFIRMED") ||
                status.equals("CANCELLED") ||
                status.equals("COMPLETED");
    }

    private AppointmentResponseDto mapToResponseDto(Appointment appointment) {
        AppointmentResponseDto responseDto = new AppointmentResponseDto();
        responseDto.setId(appointment.getId());
        responseDto.setCustomerName(appointment.getCustomerName());
        responseDto.setPhoneNumber(appointment.getPhoneNumber());
        responseDto.setEmail(appointment.getEmail());
        responseDto.setAppointmentDate(appointment.getAppointmentDate());
        responseDto.setAppointmentTime(appointment.getAppointmentTime());
        responseDto.setTopicName(appointment.getTopic().getName());
        responseDto.setConsultantName(appointment.getConsultant().getFullname());
        
        // Xử lý consultant - nếu consultant ID = 2 (placeholder), hiển thị "Chưa phân công" và consultantId = null
//        if (appointment.getConsultant() != null && appointment.getConsultant().getId() != 2L) {
//            // Nếu consultant không phải là placeholder, hiển thị thông tin thực
//            responseDto.setConsultantName(appointment.getConsultant().getFullname());
//            responseDto.setConsultantId(appointment.getConsultant().getId());
//        } else {
//            // Nếu consultant là placeholder (ID = 2) hoặc null, hiển thị "Chưa phân công"
//            responseDto.setConsultantName("Chưa phân công");
//            responseDto.setConsultantId(null); // Đặt consultantId là null trong response
//        }
        
        responseDto.setGuest(appointment.isGuest());
        responseDto.setStatus(appointment.getStatus());
        
        // Kiểm tra nếu không phải là guest thì mới có userId
        if (!appointment.isGuest() && appointment.getUser() != null) {
            responseDto.setUserId(appointment.getUser().getId());
        }
        
        // Map các trường mới
        responseDto.setCheckInTime(appointment.getCheckInTime());
        responseDto.setCheckOutTime(appointment.getCheckOutTime());
        responseDto.setConsultantNote(appointment.getConsultantNote());
        responseDto.setReviewScore(appointment.getReviewScore());
        responseDto.setCustomerReview(appointment.getCustomerReview());
        responseDto.setReview(appointment.isReview());
        responseDto.setLinkGoogleMeet(appointment.getLinkMeet());
        return responseDto;
    }
}