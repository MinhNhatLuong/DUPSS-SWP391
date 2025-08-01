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

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

/**
 * Lớp triển khai các chức năng liên quan đến quản lý cuộc hẹn tư vấn
 * Xử lý logic nghiệp vụ cho việc tạo, cập nhật, hủy và quản lý cuộc hẹn
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final TopicRepo topicRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final SlotRepository slotRepository;

    /**
     * Tạo một cuộc hẹn tư vấn mới
     * 
     * @param requestDto Đối tượng chứa thông tin cuộc hẹn cần tạo
     * @return Thông tin cuộc hẹn đã được tạo
     * 
     * Quy trình:
     * 1. Kiểm tra tồn tại của chủ đề (topic)
     * 2. Kiểm tra và xác thực slot thời gian
     * 3. Kiểm tra giới hạn số lượng cuộc hẹn trong ngày của người dùng
     * 4. Tạo đối tượng Appointment với thông tin từ request
     * 5. Cập nhật trạng thái slot thành đã được đặt
     * 6. Lưu cuộc hẹn vào database
     * 7. Tạo link meeting cho cuộc hẹn
     * 8. Gửi email xác nhận đến khách hàng
     */
    @Override
    public AppointmentResponseDto createAppointment(AppointmentRequestDto requestDto) {
        // Lấy topic theo ID
        Topic topic = topicRepository.findByIdAndActive(requestDto.getTopicId(), true);
        if (topic == null) {
            throw new ResourceNotFoundException("Không tìm thấy chủ đề với ID: " + requestDto.getTopicId());
        }

        // Tìm và kiểm tra slot thời gian
        Slot selectedSlot = slotRepository.findById(requestDto.getSlotId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Không tìm thấy slot với ID: " + requestDto.getSlotId()));

        // Kiểm tra slot có phải trong quá khứ không
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

        LocalDate appointmentDate = selectedSlot.getDate();
        //Giới hạn số lần đặt lịch trong ngày
        if (requestDto.getUserId() != null) {
            // Người dùng đã đăng nhập - kiểm tra giới hạn 2 lịch/ngày
            long count = appointmentRepository.countByUserIdAndAppointmentDateAndStatusNot(requestDto.getUserId(), appointmentDate, "CANCELLED");
            if (count >= 2) {
                throw new IllegalStateException("Bạn đã đạt giới hạn 2 lần đặt lịch trong ngày hôm nay.");
            }
        } else {
            // Guest – kiểm tra theo email, giới hạn 2 lịch/ngày
            long count = appointmentRepository.countByEmailAndAppointmentDateAndStatusNot(
                    requestDto.getEmail(), appointmentDate, "CANCELLED"
            );
            if (count >= 2) {
                throw new IllegalStateException("Bạn (guest) đã đặt tối đa 2 lịch trong ngày hôm nay.");
            }
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
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Không tìm thấy người dùng với ID: " + requestDto.getUserId()));
            appointment.setUser(user);
            appointment.setGuest(false);
        } else {
            // Nếu không có userId, đây là khách
            appointment.setGuest(true);
        }
        // Đặt trạng thái mặc định là CONFIRMED
        appointment.setStatus("CONFIRMED");
        
        // Đánh dấu slot đã được đặt
        selectedSlot.setAvailable(false);
        slotRepository.save(selectedSlot);
        
        // Lưu cuộc hẹn vào database
        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Tạo link meeting cho cuộc hẹn
        String videoCallId = requestDto.getVideoCallId();
        String meetingLink = "https://dupssapp.id.vn/appointment/" + savedAppointment.getId() + "/meeting/" + videoCallId;
        savedAppointment.setLinkMeet(meetingLink);

        savedAppointment = appointmentRepository.save(savedAppointment);

        // Gửi email xác nhận cho khách hàng
        try {
            emailService.sendAppointmentConfirmation(savedAppointment);
        } catch (Exception ex) {
            // Không rollback nếu lỗi gửi mail, chỉ log
            log.warn("Không thể gửi email xác nhận lịch hẹn: {}", ex.getMessage());
        }

        // Chuyển đổi thành AppointmentResponseDto và trả về
        return mapToResponseDto(savedAppointment);
    }

    /**
     * Lấy tất cả các cuộc hẹn trong hệ thống
     * 
     * @return Danh sách tất cả các cuộc hẹn đã được chuyển đổi sang DTO
     */
    @Override
    public List<AppointmentResponseDto> getAllAppointments() {
        List<Appointment> appointments = appointmentRepository.findAll();
        return appointments.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Lấy thông tin chi tiết của một cuộc hẹn theo ID
     * 
     * @param id ID của cuộc hẹn cần tìm
     * @return Thông tin chi tiết của cuộc hẹn
     * @throws ResourceNotFoundException nếu không tìm thấy cuộc hẹn với ID tương ứng
     */
    @Override
    public AppointmentResponseDto getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc hẹn với ID: " + id));
        return mapToResponseDto(appointment);
    }

    /**
     * Lấy danh sách cuộc hẹn của khách vãng lai (guest) theo email
     * 
     * @param email Email của khách vãng lai
     * @return Danh sách các cuộc hẹn của khách vãng lai với email tương ứng
     */
    @Override
    public List<AppointmentResponseDto> getAppointmentsByGuestEmail(String email) {
        List<Appointment> appointments = appointmentRepository.findByIsGuestAndEmailOrderByAppointmentDateDesc(true,
                email);
        return appointments.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách cuộc hẹn của người dùng đã đăng ký theo ID
     * 
     * @param userId ID của người dùng
     * @return Danh sách các cuộc hẹn của người dùng
     * @throws ResourceNotFoundException nếu không tìm thấy người dùng với ID tương ứng
     */
    @Override
    public List<AppointmentResponseDto> getAppointmentsByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));
        List<Appointment> appointments = appointmentRepository.findByUser(user);
        return appointments.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Lấy tất cả cuộc hẹn của người dùng đã đăng nhập
     * Kiểm tra xác thực người dùng trước khi trả về kết quả
     * 
     * @param userId ID của người dùng đã đăng nhập
     * @return Danh sách các cuộc hẹn của người dùng
     * @throws IllegalArgumentException nếu người dùng chưa đăng nhập
     * @throws ResourceNotFoundException nếu không tìm thấy người dùng với ID tương ứng
     */
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

    /**
     * Lấy danh sách cuộc hẹn của một tư vấn viên theo ID
     * 
     * @param consultantId ID của tư vấn viên
     * @return Danh sách các cuộc hẹn được phân công cho tư vấn viên, trả về danh sách rỗng nếu không tìm thấy tư vấn viên
     */
    @Override
    public List<AppointmentResponseDto> getAppointmentsByConsultantId(Long consultantId) {
        Optional<User> consultantOptional = userRepository.findById(consultantId);
        if (consultantOptional.isEmpty()) {
            return List.of(); // Trả về mảng rỗng nếu không tìm thấy tư vấn viên
        }

        List<Appointment> appointments = appointmentRepository.findByConsultantOrderByAppointmentDateDesc(consultantOptional.get());
        return appointments.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Cập nhật trạng thái cuộc hẹn bởi tư vấn viên
     * 
     * @param id ID của cuộc hẹn cần cập nhật
     * @param status Trạng thái mới của cuộc hẹn
     * @param consultantId ID của tư vấn viên thực hiện cập nhật
     * @return Thông tin cuộc hẹn sau khi cập nhật
     * @throws ResourceNotFoundException nếu không tìm thấy cuộc hẹn hoặc tư vấn viên
     * @throws IllegalArgumentException nếu tư vấn viên không có quyền cập nhật hoặc trạng thái không hợp lệ
     */
    @Override
    public AppointmentResponseDto updateAppointmentStatus(Long id, String status, Long consultantId) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc hẹn với ID: " + id));

        // Lấy thông tin tư vấn viên
        User consultant = userRepository.findById(consultantId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tư vấn viên với ID: " + consultantId));

        // Nếu cuộc hẹn chưa có tư vấn viên, gán tư vấn viên hiện tại
        if (appointment.getConsultant() == null) {
            appointment.setConsultant(consultant);
        }
        // Nếu cuộc hẹn đã có tư vấn viên khác, kiểm tra quyền truy cập
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


    /**
     * Hủy cuộc hẹn bởi người dùng đã đăng ký
     * 
     * @param id ID của cuộc hẹn cần hủy
     * @param userId ID của người dùng thực hiện hủy
     * @return Thông tin cuộc hẹn sau khi hủy
     * @throws ResourceNotFoundException nếu không tìm thấy cuộc hẹn
     * @throws IllegalArgumentException nếu người dùng không có quyền hủy hoặc cuộc hẹn không thể hủy
     */
    @Override
    public AppointmentResponseDto cancelAppointmentByUser(Long id, Long userId) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc hẹn với ID: " + id));

        // Kiểm tra xem cuộc hẹn có thuộc về user này không
        if (appointment.isGuest() || !Objects.equals(appointment.getUser().getId(), userId)) {
            throw new IllegalArgumentException("Người dùng không có quyền hủy cuộc hẹn này");
        }

        // Kiểm tra nếu cuộc hẹn đã hoàn thành hoặc đã hủy rồi
        if (appointment.getStatus().equals("COMPLETED") || appointment.getStatus().equals("CANCELLED")) {
            throw new IllegalArgumentException("Không thể hủy cuộc hẹn đã " +
                    (appointment.getStatus().equals("COMPLETED") ? "hoàn thành" : "hủy"));
        }

        // Lưu trạng thái cũ để gửi email
        String previousStatus = appointment.getStatus();

        // Cập nhật trạng thái thành CANCELED
        appointment.setStatus("CANCELLED");
        Appointment updatedAppointment = appointmentRepository.save(appointment);

        // Trả lại slot thành available để người khác có thể đặt
        Optional<Slot> selectedSlot = slotRepository.findByConsultantAndDateAndStartTime(
                appointment.getConsultant(),
                appointment.getAppointmentDate(),
                appointment.getAppointmentTime());
        selectedSlot.ifPresent(slot -> {
            slot.setAvailable(true);
            slotRepository.save(slot);
        });

        // Gửi email thông báo hủy cuộc hẹn
        emailService.sendAppointmentStatusUpdate(updatedAppointment, previousStatus);

        return mapToResponseDto(updatedAppointment);
    }

    /**
     * Hủy cuộc hẹn bởi khách vãng lai (guest)
     * 
     * @param id ID của cuộc hẹn cần hủy
     * @param email Email của khách vãng lai thực hiện hủy
     * @return Thông tin cuộc hẹn sau khi hủy
     * @throws ResourceNotFoundException nếu không tìm thấy cuộc hẹn
     * @throws IllegalArgumentException nếu email không khớp hoặc cuộc hẹn không thể hủy
     */
    @Override
    public AppointmentResponseDto cancelAppointmentByGuest(Long id, String email) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc hẹn với ID: " + id));

        // Kiểm tra xem cuộc hẹn có thuộc về guest với email này không
        if (!appointment.isGuest() || !appointment.getEmail().equals(email)) {
            throw new IllegalArgumentException("Người dùng không có quyền hủy cuộc hẹn này");
        }

        // Kiểm tra nếu cuộc hẹn đã hoàn thành hoặc đã hủy rồi
        if (appointment.getStatus().equals("COMPLETED") || appointment.getStatus().equals("CANCELLED")) {
            throw new IllegalArgumentException("Không thể hủy cuộc hẹn đã " +
                    (appointment.getStatus().equals("COMPLETED") ? "hoàn thành" : "hủy"));
        }

        // Lưu trạng thái cũ để gửi email
        String previousStatus = appointment.getStatus();

        // Cập nhật trạng thái thành CANCELED
        appointment.setStatus("CANCELLED");
        Appointment updatedAppointment = appointmentRepository.save(appointment);

        // Gửi email thông báo hủy cuộc hẹn
        emailService.sendAppointmentStatusUpdate(updatedAppointment, previousStatus);

        return mapToResponseDto(updatedAppointment);
    }

    /**
     * Lấy danh sách cuộc hẹn đã hoàn thành hoặc đã hủy của một tư vấn viên
     * 
     * @param consultantId ID của tư vấn viên
     * @return Danh sách các cuộc hẹn đã hoàn thành hoặc đã hủy của tư vấn viên
     */
    @Override
    public List<AppointmentResponseDto> getCompletedOrCanceledAppointmentsByConsultantId(Long consultantId) {
        Optional<User> consultantOptional = userRepository.findById(consultantId);
        if (consultantOptional.isEmpty()) {
            return List.of(); // Trả về mảng rỗng nếu không tìm thấy tư vấn viên
        }

        // Danh sách các trạng thái cần lấy: COMPLETED và CANCELED
        List<String> statuses = List.of("COMPLETED", "CANCELLED");

        // Lấy danh sách các cuộc hẹn có trạng thái là COMPLETED hoặc CANCELED
        List<Appointment> appointments = appointmentRepository.findByConsultantAndStatusIn(consultantOptional.get(),
                statuses);

        return appointments.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }



    /**
     * Lấy danh sách các cuộc hẹn chưa được phân công cho tư vấn viên cụ thể
     * Các cuộc hẹn này có trạng thái PENDING và được gán cho tư vấn viên placeholder (ID = 2)
     * 
     * @return Danh sách các cuộc hẹn chưa được phân công
     */
    @Override
    public List<AppointmentResponseDto> getUnassignedAppointments() {
        // Lấy tất cả các cuộc hẹn có trạng thái PENDING và consultant là placeholder
        // (ID = 2)
        List<Appointment> appointments = appointmentRepository.findAll().stream()
                .filter(a -> "PENDING".equals(a.getStatus()) &&
                        a.getConsultant() != null && a.getConsultant().getId() == 2L)
                .collect(Collectors.toList());

        return appointments.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Lấy tất cả các cuộc hẹn đã hoàn thành hoặc đã hủy cho quản lý xem báo cáo
     * Sắp xếp theo thời gian kết thúc giảm dần (mới nhất lên đầu)
     * 
     * @return Danh sách các cuộc hẹn đã hoàn thành hoặc đã hủy
     */
    @Override
    public List<AppointmentResponseDto> getAllAppointmentByManager() {
        List<String> statuses = List.of("COMPLETED", "CANCELLED");
        List<Appointment> appointments = appointmentRepository.findByStatusInOrderByCheckOutTimeDesc(statuses);
        return appointments.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Bắt đầu một cuộc hẹn tư vấn
     * Tư vấn viên sử dụng phương thức này khi bắt đầu buổi tư vấn
     * 
     * @param appointmentId ID của cuộc hẹn cần bắt đầu
     * @param consultantId ID của tư vấn viên thực hiện
     * @return Thông tin cuộc hẹn sau khi bắt đầu
     * @throws ResourceNotFoundException nếu không tìm thấy cuộc hẹn
     * @throws IllegalArgumentException nếu tư vấn viên không có quyền hoặc cuộc hẹn không ở trạng thái phù hợp
     */
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
        if (appointment.getCheckInTime() == null) {
            appointment.setCheckInTime(java.time.LocalDateTime.now());
        }
        appointment.setStatus("ON_GOING");

        // Lưu vào database
        Appointment updatedAppointment = appointmentRepository.save(appointment);

        return mapToResponseDto(updatedAppointment);
    }

    /**
     * Kết thúc một cuộc hẹn tư vấn
     * Tư vấn viên sử dụng phương thức này khi kết thúc buổi tư vấn
     * 
     * @param appointmentId ID của cuộc hẹn cần kết thúc
     * @param consultantId ID của tư vấn viên thực hiện
     * @param consultantNote Ghi chú của tư vấn viên về buổi tư vấn
     * @return Thông tin cuộc hẹn sau khi kết thúc
     * @throws ResourceNotFoundException nếu không tìm thấy cuộc hẹn
     * @throws IllegalArgumentException nếu tư vấn viên không có quyền hoặc các điều kiện khác không hợp lệ
     * @throws IllegalStateException nếu cuộc hẹn đã được hoàn thành trước đó
     */
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
        emailService.sendAppointmentStatusUpdate(updatedAppointment, "ON_GOING");

        return mapToResponseDto(updatedAppointment);
    }

    /**
     * Hủy cuộc hẹn bởi tư vấn viên
     * Sử dụng khi khách hàng không tham gia cuộc hẹn
     * 
     * @param appointmentId ID của cuộc hẹn cần hủy
     * @param consultantId ID của tư vấn viên thực hiện hủy
     * @param reason Lý do hủy cuộc hẹn
     * @return Thông tin cuộc hẹn sau khi hủy
     * @throws ResourceNotFoundException nếu không tìm thấy cuộc hẹn
     * @throws IllegalArgumentException nếu tư vấn viên không có quyền hoặc cuộc hẹn không ở trạng thái phù hợp
     */
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
        if (!appointment.getStatus().equals("CONFIRMED") && !appointment.getStatus().equals("ON_GOING")) {
            throw new IllegalArgumentException("Chỉ có thể hủy cuộc hẹn đang chờ hoặc đã xác nhận");
        }

        // Kiểm tra thời gian chờ tối thiểu (5 phút)
        Duration waitingDuration = Duration.between(appointment.getCheckInTime(), LocalDateTime.now());

        if (waitingDuration.toMinutes() < 5) {
            throw new IllegalArgumentException("Chỉ có thể hủy sau khi đã chờ ít nhất 5 phút kể từ lúc bắt đầu họp.");
        }

        // Lưu trạng thái cũ
        String previousStatus = appointment.getStatus();

        // Cập nhật thông tin
        appointment.setStatus("CANCELLED");
        appointment.setConsultantNote(reason);

        // Lưu vào database
        Appointment updatedAppointment = appointmentRepository.save(appointment);

        // Gửi email thông báo hủy cuộc hẹn
        emailService.sendAppointmentStatusUpdate(updatedAppointment, previousStatus);

        return mapToResponseDto(updatedAppointment);
    }

    /**
     * Đánh giá cuộc hẹn bởi người dùng đã đăng ký
     * 
     * @param appointmentId ID của cuộc hẹn cần đánh giá
     * @param reviewRequest Thông tin đánh giá (điểm và nhận xét)
     * @return Thông tin cuộc hẹn sau khi đánh giá
     * @throws ResourceNotFoundException nếu không tìm thấy cuộc hẹn
     * @throws IllegalArgumentException nếu cuộc hẹn chưa hoàn thành, đã được đánh giá, hoặc điểm đánh giá không hợp lệ
     */
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

    /**
     * Đánh giá cuộc hẹn bởi khách vãng lai (guest)
     * 
     * @param appointmentId ID của cuộc hẹn cần đánh giá
     * @param reviewScore Điểm đánh giá (1-5)
     * @param customerReview Nhận xét của khách hàng
     * @param email Email của khách vãng lai để xác thực
     * @return Thông tin cuộc hẹn sau khi đánh giá
     * @throws ResourceNotFoundException nếu không tìm thấy cuộc hẹn
     * @throws IllegalArgumentException nếu email không khớp, cuộc hẹn chưa hoàn thành, đã được đánh giá, hoặc điểm đánh giá không hợp lệ
     */
    @Override
    public AppointmentResponseDto reviewAppointmentByGuest(Long appointmentId, Integer reviewScore,
            String customerReview, String email) {
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

    /**
     * Kiểm tra tính hợp lệ của trạng thái cuộc hẹn
     * 
     * @param status Trạng thái cần kiểm tra
     * @return true nếu trạng thái hợp lệ, false nếu không hợp lệ
     */
    private boolean isValidStatus(String status) {
        return status.equals("PENDING") ||
                status.equals("ON_GOING") ||
                status.equals("CONFIRMED") ||
                status.equals("CANCELLED") ||
                status.equals("COMPLETED");
    }

    /**
     * Chuyển đổi đối tượng Appointment thành AppointmentResponseDto
     * Phương thức này ánh xạ các thuộc tính của entity sang DTO để trả về cho client
     * 
     * @param appointment Đối tượng Appointment cần chuyển đổi
     * @return Đối tượng AppointmentResponseDto tương ứng
     */
    private AppointmentResponseDto mapToResponseDto(Appointment appointment) {
        AppointmentResponseDto responseDto = new AppointmentResponseDto();
        responseDto.setId(appointment.getId());
        responseDto.setCustomerName(appointment.getCustomerName() != null ? appointment.getCustomerName() : "N/A");
        responseDto.setPhoneNumber(appointment.getPhoneNumber());
        responseDto.setEmail(appointment.getEmail());
        responseDto.setAppointmentDate(appointment.getAppointmentDate());
        responseDto.setAppointmentTime(appointment.getAppointmentTime());
        responseDto.setTopicName(appointment.getTopic().getName());
        responseDto.setConsultantName(appointment.getConsultant() != null ? appointment.getConsultant().getFullname() : "Chưa phân công");;
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