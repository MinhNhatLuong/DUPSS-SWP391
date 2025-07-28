package com.dupss.app.BE_Dupss.service.impl;

import com.dupss.app.BE_Dupss.dto.request.SlotRequestDto;
import com.dupss.app.BE_Dupss.dto.response.ConsultantResponse;
import com.dupss.app.BE_Dupss.dto.response.SlotResponseDto;
import com.dupss.app.BE_Dupss.entity.Slot;
import com.dupss.app.BE_Dupss.entity.User;
import com.dupss.app.BE_Dupss.exception.ResourceNotFoundException;
import com.dupss.app.BE_Dupss.respository.SlotRepository;
import com.dupss.app.BE_Dupss.respository.UserRepository;
import com.dupss.app.BE_Dupss.service.SlotService;
import com.dupss.app.BE_Dupss.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Lớp triển khai các chức năng quản lý slot thời gian làm việc của tư vấn viên
 * Xử lý logic nghiệp vụ cho việc tạo, cập nhật, xóa và tìm kiếm các slot thời gian
 */
@Service
@RequiredArgsConstructor
public class SlotServiceImpl implements SlotService {

    private final SlotRepository slotRepository;
    private final UserRepository consultantRepository;
    private final SecurityUtils securityUtils;

    /**
     * Tạo slot thời gian mới cho tư vấn viên
     * 
     * @param requestDto Đối tượng chứa thông tin slot cần tạo
     * @return Thông tin slot đã được tạo
     * @throws IllegalArgumentException nếu thời gian không hợp lệ hoặc slot đã tồn tại
     */
    @Override
    public SlotResponseDto createSlot(SlotRequestDto requestDto) {

        // Lấy thông tin tư vấn viên hiện tại từ context bảo mật
        User consultant = securityUtils.getCurrentUser();

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        // Kiểm tra slot không được nằm trong quá khứ
        if (requestDto.getDate().isBefore(today) ||
                (requestDto.getDate().isEqual(today) && requestDto.getStartTime().isBefore(now))) {
            throw new IllegalArgumentException("Không thể đăng ký slot ở thời gian quá khứ.");
        }

        // Kiểm tra thời lượng slot phải đúng 1 giờ
        Duration duration = Duration.between(requestDto.getStartTime(), requestDto.getEndTime());
        if (!duration.equals(Duration.ofHours(1))) {
            throw new IllegalArgumentException("Slot phải kéo dài đúng 1 giờ.");
        }

        // Kiểm tra slot không được trùng lặp
        boolean isExist = slotRepository.existsByConsultantAndDateAndStartTime(
                consultant, requestDto.getDate(), requestDto.getStartTime()
        );
        if (isExist) {
            throw new IllegalArgumentException("Slot này đã được đăng ký.");
        }

        // Tạo đối tượng Slot từ requestDto
        Slot slot = new Slot();
        slot.setDate(requestDto.getDate());
        slot.setStartTime(requestDto.getStartTime());
        slot.setEndTime(requestDto.getEndTime());
        slot.setConsultant(consultant);
        slot.setAvailable(true);

        // Lưu vào database và chuyển đổi sang DTO để trả về
        Slot savedSlot = slotRepository.save(slot);
        return mapToResponseDto(savedSlot);
    }

    /**
     * Lấy danh sách tất cả các slot của một tư vấn viên
     * 
     * @param consultantId ID của tư vấn viên
     * @return Danh sách các slot thời gian của tư vấn viên
     * @throws ResourceNotFoundException nếu không tìm thấy tư vấn viên
     */
    @Override
    public List<SlotResponseDto> getSlotsByConsultantId(Long consultantId) {
        User consultant = consultantRepository.findById(consultantId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tư vấn viên với ID: " + consultantId));
        List<Slot> slots =  slotRepository.findByConsultantAndAvailableTrue(consultant);
        return slots.stream()
                .map(this::mapToResponseDto)
                .toList();
    }

    /**
     * Lấy danh sách các slot khả dụng của một tư vấn viên vào một ngày cụ thể
     * Nếu ngày là hôm nay, chỉ trả về các slot có thời gian bắt đầu sau thời điểm hiện tại
     * 
     * @param consultantId ID của tư vấn viên
     * @param date Ngày cần tìm kiếm slot
     * @return Danh sách các slot khả dụng của tư vấn viên vào ngày đã chọn
     * @throws ResourceNotFoundException nếu không tìm thấy tư vấn viên
     */
    @Override
    public List<SlotResponseDto> getAvailableSlotsByConsultantAndDate(Long consultantId, LocalDate date) {
        User consultant = consultantRepository.findById(consultantId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tư vấn viên với ID: " + consultantId));

        List<Slot> slots = slotRepository.findByConsultantAndDateAndAvailable(consultant, date, true);

        // Nếu ngày là hôm nay, lọc bỏ các slot đã qua
        if (date.equals(LocalDate.now())) {
            LocalTime now = LocalTime.now();
            slots = slots.stream()
                    .filter(slot -> slot.getStartTime().isAfter(now))
                    .toList();
        }

        return slots.stream()
                .map(this::mapToResponseDto)
                .toList();
    }

    /**
     * Cập nhật trạng thái khả dụng của slot
     * 
     * @param slotId ID của slot cần cập nhật
     * @param isAvailable Trạng thái khả dụng mới
     * @param consultantId ID của tư vấn viên thực hiện cập nhật
     * @return Slot đã được cập nhật
     * @throws ResourceNotFoundException nếu không tìm thấy slot
     * @throws IllegalArgumentException nếu tư vấn viên không có quyền cập nhật slot
     */
    @Override
    public Slot updateSlotAvailability(Long slotId, boolean isAvailable, Long consultantId) {
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy slot thời gian với ID: " + slotId));

        // Kiểm tra xem slot có thuộc về tư vấn viên này không
        if (slot.getConsultant().getId() != consultantId) {
            throw new IllegalArgumentException("Tư vấn viên không có quyền cập nhật slot này");
        }

        slot.setAvailable(isAvailable);
        return slotRepository.save(slot);
    }

    /**
     * Xóa slot thời gian
     * 
     * @param slotId ID của slot cần xóa
     * @param consultantId ID của tư vấn viên thực hiện xóa
     * @throws ResourceNotFoundException nếu không tìm thấy slot
     * @throws IllegalArgumentException nếu tư vấn viên không có quyền xóa slot
     */
    @Override
    public void deleteSlot(Long slotId, Long consultantId) {
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy slot thời gian với ID: " + slotId));

        // Kiểm tra xem slot có thuộc về tư vấn viên này không
        if (slot.getConsultant().getId() != consultantId) {
            throw new IllegalArgumentException("Tư vấn viên không có quyền xóa slot này");
        }

        slotRepository.delete(slot);
    }

    /**
     * Chuyển đổi đối tượng Slot thành SlotResponseDto
     * 
     * @param slot Đối tượng Slot cần chuyển đổi
     * @return Đối tượng SlotResponseDto tương ứng
     */
    private SlotResponseDto mapToResponseDto(Slot slot) {
        SlotResponseDto responseDto = new SlotResponseDto();
        responseDto.setId(slot.getId());
        responseDto.setDate(slot.getDate());
        responseDto.setStartTime(slot.getStartTime());
        responseDto.setEndTime(slot.getEndTime());
        responseDto.setConsultantName(slot.getConsultant().getFullname());
        return responseDto;
    }
} 