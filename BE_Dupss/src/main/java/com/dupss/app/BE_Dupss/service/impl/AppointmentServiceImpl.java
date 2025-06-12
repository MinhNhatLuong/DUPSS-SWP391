package com.dupss.app.BE_Dupss.service.impl;

import com.dupss.app.BE_Dupss.dto.request.AppointmentRequestDto;
import com.dupss.app.BE_Dupss.dto.response.AppointmentResponseDto;
import com.dupss.app.BE_Dupss.entity.*;
import com.dupss.app.BE_Dupss.exception.ResourceNotFoundException;
import com.dupss.app.BE_Dupss.respository.*;
import com.dupss.app.BE_Dupss.service.AppointmentService;
import com.dupss.app.BE_Dupss.service.EmailService;
import lombok.RequiredArgsConstructor;
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
    private final TopicRepository topicRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final SlotRepository slotRepository;
    private final Random random = new Random();

    @Override
    public AppointmentResponseDto createAppointment(AppointmentRequestDto requestDto) {
        // Lấy topic theo ID
        Topic topic = topicRepository.findById(requestDto.getTopicId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chủ đề tư vấn với ID: " + requestDto.getTopicId()));

        // Xử lý consultant
        Consultant consultant = null;
        Slot matchedSlot = null;
//        if (requestDto.getConsultantId() != null) {
//            // Nếu có chỉ định consultant, sử dụng consultant được chỉ định
//            consultant = consultantRepository.findById(requestDto.getConsultantId())
//                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tư vấn viên với ID: " + requestDto.getConsultantId()));
//
//            // Kiểm tra slot phù hợp
//            matchedSlot = slotRepository.findAvailableSlotByConsultantAndDateTime(
//                            consultant.getId(),
//                            requestDto.getAppointmentDate(),
//                            requestDto.getAppointmentTime())
//                    .orElseThrow(() -> new ResourceNotFoundException("Tư vấn viên không có lịch trống tại thời điểm này"));
//        } else {
//            // Nếu không chỉ định consultant, tự động chọn một consultant dựa vào topic
//            List<Consultant> availableConsultants = consultantRepository.findByTopicId(requestDto.getTopicId());
//
//            for (Consultant c : availableConsultants) {
//                Optional<Slot> optionalSlot = slotRepository.findAvailableSlotByConsultantAndDateTime(
//                        c.getId(),
//                        requestDto.getAppointmentDate(),
//                        requestDto.getAppointmentTime());
//
//                if (optionalSlot.isPresent()) {
//                    consultant = c;
//                    matchedSlot = optionalSlot.get();
//                    break;
//                }
//
//                if (availableConsultants.isEmpty()) {
//                    throw new ResourceNotFoundException("Không tìm thấy tư vấn viên phù hợp cho chủ đề này");
//                }
//
//                // Chọn ngẫu nhiên một consultant từ danh sách
//                //consultant = availableConsultants.get(random.nextInt(availableConsultants.size()));
//            }
//        }
        if (requestDto.getConsultantId() != null) {
            // Nếu có chỉ định consultant
            consultant = consultantRepository.findById(requestDto.getConsultantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tư vấn viên với ID: " + requestDto.getConsultantId()));

            matchedSlot = slotRepository.findAvailableSlotByConsultantAndDateTime(
                            consultant.getId(),
                            requestDto.getAppointmentDate(),
                            requestDto.getAppointmentTime())
                    .orElseThrow(() -> new ResourceNotFoundException("Tư vấn viên không có lịch trống tại thời điểm này"));

        } else {
            // Không chỉ định consultant
            List<Consultant> availableConsultants = consultantRepository.findByTopicId(requestDto.getTopicId());

            if (availableConsultants.isEmpty()) {
                throw new ResourceNotFoundException("Không tìm thấy tư vấn viên phù hợp cho chủ đề này");
            }

            // Duyệt từng consultant để tìm slot phù hợp
            for (Consultant c : availableConsultants) {
                Optional<Slot> optionalSlot = slotRepository.findAvailableSlotByConsultantAndDateTime(
                        c.getId(),
                        requestDto.getAppointmentDate(),
                        requestDto.getAppointmentTime());

                if (optionalSlot.isPresent()) {
                    consultant = c;
                    matchedSlot = optionalSlot.get();
                    break;
                }
            }

            // Nếu duyệt xong vẫn không tìm thấy slot phù hợp
            if (matchedSlot == null) {
                throw new ResourceNotFoundException("Không có tư vấn viên nào rảnh vào thời điểm này");
            }
        }

            // Khởi tạo đối tượng Appointment
            Appointment appointment = new Appointment();
            appointment.setCustomerName(requestDto.getCustomerName());
            appointment.setPhoneNumber(requestDto.getPhoneNumber());
            appointment.setEmail(requestDto.getEmail());
            appointment.setAppointmentDate(requestDto.getAppointmentDate());
            appointment.setAppointmentTime(requestDto.getAppointmentTime());
            appointment.setTopic(topic);
            appointment.setConsultant(consultant);
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


            matchedSlot.setAvailable(false);
            slotRepository.save(matchedSlot);

            // Lưu vào database
            Appointment savedAppointment = appointmentRepository.save(appointment);

            // Gửi email xác nhận đặt lịch
            emailService.sendAppointmentConfirmation(savedAppointment);

            // Chuyển đổi thành AppointmentResponseDto và trả về
            return mapToResponseDto(savedAppointment);

    }

        @Override
        public List<AppointmentResponseDto> getAllAppointments () {
            List<Appointment> appointments = appointmentRepository.findAll();
            return appointments.stream()
                    .map(this::mapToResponseDto)
                    .collect(Collectors.toList());
        }

        @Override
        public AppointmentResponseDto getAppointmentById (Long id){
            Appointment appointment = appointmentRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc hẹn với ID: " + id));
            return mapToResponseDto(appointment);
        }

        @Override
        public List<AppointmentResponseDto> getAppointmentsByGuestEmail (String email){
            List<Appointment> appointments = appointmentRepository.findByIsGuestAndEmailOrderByAppointmentDateDesc(true, email);
            return appointments.stream()
                    .map(this::mapToResponseDto)
                    .collect(Collectors.toList());
        }

        @Override
        public List<AppointmentResponseDto> getAppointmentsByUserId (Long userId){
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));
            List<Appointment> appointments = appointmentRepository.findByUser(user);
            return appointments.stream()
                    .map(this::mapToResponseDto)
                    .collect(Collectors.toList());
        }

        @Override
        public List<AppointmentResponseDto> getAppointmentsByConsultantId (Long consultantId){
            Consultant consultant = consultantRepository.findById(consultantId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tư vấn viên với ID: " + consultantId));
            List<Appointment> appointments = appointmentRepository.findByConsultant(consultant);
            return appointments.stream()
                    .map(this::mapToResponseDto)
                    .collect(Collectors.toList());
        }

        @Override
        public AppointmentResponseDto updateAppointmentStatus (Long id, String status, Long consultantId){
            Appointment appointment = appointmentRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc hẹn với ID: " + id));

            // Kiểm tra xem cuộc hẹn có thuộc về tư vấn viên này không
            if (!Objects.equals(appointment.getConsultant().getId(), consultantId)) {
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
        public AppointmentResponseDto cancelAppointmentByUser (Long id, Long userId){
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
        public AppointmentResponseDto cancelAppointmentByGuest (Long id, String email){
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

        private boolean isValidStatus (String status){
            return status.equals("PENDING") ||
                    status.equals("CONFIRMED") ||
                    status.equals("CANCELED") ||
                    status.equals("COMPLETED");
        }

        private AppointmentResponseDto mapToResponseDto (Appointment appointment){
            AppointmentResponseDto responseDto = new AppointmentResponseDto();
            responseDto.setId(appointment.getId());
            responseDto.setCustomerName(appointment.getCustomerName());
            responseDto.setPhoneNumber(appointment.getPhoneNumber());
            responseDto.setEmail(appointment.getEmail());
            responseDto.setAppointmentDate(appointment.getAppointmentDate());
            responseDto.setAppointmentTime(appointment.getAppointmentTime());
            responseDto.setTopicName(appointment.getTopic().getName());
            responseDto.setConsultantName(appointment.getConsultant().getFullname());
            responseDto.setGuest(appointment.isGuest());
            responseDto.setStatus(appointment.getStatus());
            return responseDto;
        }

}