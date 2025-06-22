package com.dupss.app.BE_Dupss.service.impl;

import com.dupss.app.BE_Dupss.dto.request.AppointmentRequestDto;
import com.dupss.app.BE_Dupss.dto.response.AppointmentResponseDto;
import com.dupss.app.BE_Dupss.entity.*;
import com.dupss.app.BE_Dupss.exception.ResourceNotFoundException;
import com.dupss.app.BE_Dupss.respository.*;
import com.dupss.app.BE_Dupss.service.AppointmentService;
import com.dupss.app.BE_Dupss.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final ConsultantRepository consultantRepository;
    private final TopicRepo topicRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final SlotRepository slotRepository;
    private final Random random = new Random();

    @Override
    public AppointmentResponseDto createAppointment(AppointmentRequestDto requestDto) {
        // Lấy topic theo ID
        Topic topic = topicRepository.findByIdAndActive(requestDto.getTopicId(), true);
        if(topic == null) {
            throw new ResourceNotFoundException("Không tìm thấy chủ đề với ID: " + requestDto.getTopicId());
        }

        // Khởi tạo đối tượng Appointment
        Appointment appointment = new Appointment();
        appointment.setCustomerName(requestDto.getCustomerName());
        appointment.setPhoneNumber(requestDto.getPhoneNumber());
        appointment.setEmail(requestDto.getEmail());
        appointment.setAppointmentDate(requestDto.getAppointmentDate());
        appointment.setAppointmentTime(requestDto.getAppointmentTime());
        appointment.setTopic(topic);
        appointment.setStatus("PENDING");

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

        // Tự động phân công tư vấn viên
        List<Consultant> availableConsultants = consultantRepository.findByEnabledTrue();
        if (!availableConsultants.isEmpty()) {
            // Chọn ngẫu nhiên một tư vấn viên từ danh sách tư vấn viên đang hoạt động
            Consultant selectedConsultant = availableConsultants.get(random.nextInt(availableConsultants.size()));
            appointment.setConsultant(selectedConsultant);
        } else {
            // Nếu không có tư vấn viên nào đang hoạt động, tạo một tư vấn viên mặc định
            Optional<Consultant> defaultConsultant = consultantRepository.findById(1L); // Giả sử ID 1 là tư vấn viên mặc định
            if (defaultConsultant.isPresent()) {
                appointment.setConsultant(defaultConsultant.get());
            } else {
                throw new ResourceNotFoundException("Không tìm thấy tư vấn viên nào trong hệ thống");
            }
        }

        // Lưu vào database
        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Gửi email xác nhận đặt lịch
        emailService.sendAppointmentConfirmation(savedAppointment);

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
    public List<AppointmentResponseDto> getAppointmentsByConsultantId(Long consultantId) {
        Consultant consultant = consultantRepository.findById(consultantId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tư vấn viên với ID: " + consultantId));
        List<Appointment> appointments = appointmentRepository.findByConsultant(consultant);
        return appointments.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public AppointmentResponseDto updateAppointmentStatus(Long id, String status, Long consultantId) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc hẹn với ID: " + id));

        // Get the consultant
        Consultant consultant = consultantRepository.findById(consultantId)
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

    @Override
    public AppointmentResponseDto updateAppointmentStatus(Long id, String status) {
        // Phương thức này gây ra lỗi ép kiểu từ JWT sang User
        // Thay vì cố gắng ép kiểu, chúng ta sẽ ném ngoại lệ và yêu cầu client sử dụng phương thức overload với consultantId
        throw new IllegalArgumentException("Vui lòng cung cấp consultantId để cập nhật trạng thái cuộc hẹn");
    }

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
        appointment.setStatus("CANCELED");
        Appointment updatedAppointment = appointmentRepository.save(appointment);

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
        Consultant consultant = consultantRepository.findById(consultantId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tư vấn viên với ID: " + consultantId));
        
        // Danh sách các trạng thái cần lấy: COMPLETED và CANCELED
        List<String> statuses = List.of("COMPLETED", "CANCELED");
        
        // Lấy danh sách các cuộc hẹn có trạng thái là COMPLETED hoặc CANCELED
        List<Appointment> appointments = appointmentRepository.findByConsultantAndStatusIn(consultant, statuses);
        
        return appointments.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentResponseDto> getUnassignedAppointments() {
        // Vì chúng ta đã tự động phân công tư vấn viên khi tạo cuộc hẹn,
        // nên phương thức này sẽ trả về danh sách trống hoặc các cuộc hẹn mới nhất
        List<Appointment> appointments = appointmentRepository.findAll().stream()
                .filter(a -> "PENDING".equals(a.getStatus()))
                .limit(10)
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
        Consultant consultant = consultantRepository.findById(consultantId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tư vấn viên với ID: " + consultantId));
        
        // Kiểm tra và cập nhật tư vấn viên
        if (appointment.getConsultant() != null && !Objects.equals(appointment.getConsultant().getId(), consultantId)) {
            // Nếu cuộc hẹn đã có tư vấn viên khác, cho phép thay đổi
            appointment.setConsultant(consultant);
        } else if (appointment.getConsultant() == null) {
            // Nếu chưa có tư vấn viên, gán tư vấn viên mới
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

    private boolean isValidStatus(String status) {
        return status.equals("PENDING") ||
                status.equals("CONFIRMED") ||
                status.equals("CANCELED") ||
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
        
        // Handle consultant - không nên xảy ra null nhưng vẫn xử lý phòng trường hợp
        if (appointment.getConsultant() != null) {
            responseDto.setConsultantName(appointment.getConsultant().getFullname());
            responseDto.setConsultantId(appointment.getConsultant().getId());
        } else {
            responseDto.setConsultantName("Chưa phân công");
            // Nếu consultant null, cố gắng phân công lại
            try {
                List<Consultant> availableConsultants = consultantRepository.findByEnabledTrue();
                if (!availableConsultants.isEmpty()) {
                    Consultant selectedConsultant = availableConsultants.get(random.nextInt(availableConsultants.size()));
                    appointment.setConsultant(selectedConsultant);
                    appointmentRepository.save(appointment);
                    responseDto.setConsultantName(selectedConsultant.getFullname());
                    responseDto.setConsultantId(selectedConsultant.getId());
                }
            } catch (Exception e) {
                // Bỏ qua lỗi nếu có, giữ nguyên "Chưa phân công"
            }
        }
        
        responseDto.setGuest(appointment.isGuest());
        responseDto.setStatus(appointment.getStatus());
        
        // Kiểm tra nếu không phải là guest thì mới có userId
        if (!appointment.isGuest() && appointment.getUser() != null) {
            responseDto.setUserId(appointment.getUser().getId());
        }
        
        return responseDto;
    }
}