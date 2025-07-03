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
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SlotServiceImpl implements SlotService {

    private final SlotRepository slotRepository;
    private final UserRepository consultantRepository;

    @Override
    public SlotResponseDto createSlot(SlotRequestDto requestDto) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User consultant = consultantRepository.findByUsernameAndEnabledTrue(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tư vấn viên với Username: " + username));

        Duration duration = Duration.between(requestDto.getStartTime(), requestDto.getEndTime());
        if (!duration.equals(Duration.ofHours(1))) {
            throw new IllegalArgumentException("Slot phải kéo dài đúng 1 giờ.");
        }

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

        Slot savedSlot = slotRepository.save(slot);
        return mapToResponseDto(savedSlot);
    }

    @Override
    public List<SlotResponseDto> getSlotsByConsultantId(Long consultantId) {
        User consultant = consultantRepository.findById(consultantId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tư vấn viên với ID: " + consultantId));
        List<Slot> slots =  slotRepository.findByConsultantAndAvailableTrue(consultant);
        return slots.stream()
                .map(this::mapToResponseDto)
                .toList();
    }

    @Override
    public List<SlotResponseDto> getAvailableSlotsByConsultantAndDate(Long consultantId, LocalDate date) {
        User consultant = consultantRepository.findById(consultantId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tư vấn viên với ID: " + consultantId));

        List<Slot> slots = slotRepository.findByConsultantAndDateAndAvailable(consultant, date, true);
        return slots.stream()
                .map(this::mapToResponseDto)
                .toList();
    }

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