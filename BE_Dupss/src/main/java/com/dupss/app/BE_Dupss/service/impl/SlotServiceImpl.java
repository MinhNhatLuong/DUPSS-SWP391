package com.dupss.app.BE_Dupss.service.impl;

import com.dupss.app.BE_Dupss.dto.request.SlotRequestDto;
import com.dupss.app.BE_Dupss.dto.response.SlotResponseDto;
import com.dupss.app.BE_Dupss.entity.Consultant;
import com.dupss.app.BE_Dupss.entity.Slot;
import com.dupss.app.BE_Dupss.exception.ResourceNotFoundException;
import com.dupss.app.BE_Dupss.respository.ConsultantRepository;
import com.dupss.app.BE_Dupss.respository.SlotRepository;
import com.dupss.app.BE_Dupss.service.SlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SlotServiceImpl implements SlotService {

    private final SlotRepository slotRepository;
    private final ConsultantRepository consultantRepository;

    @Override
    public SlotResponseDto createSlot(SlotRequestDto requestDto) {
        Consultant consultant = consultantRepository.findById(requestDto.getConsultantId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tư vấn viên với ID: " + requestDto.getConsultantId()));

        // Tạo đối tượng Slot từ requestDto
        Slot slot = new Slot();
        slot.setDate(requestDto.getDate());
        slot.setStartTime(requestDto.getStartTime());
        slot.setEndTime(requestDto.getEndTime());
        slot.setConsultant(consultant);
        slot.setAvailable(requestDto.isAvailable());

        Slot savedSlot = slotRepository.save(slot);
        return mapToResponseDto(savedSlot);
    }

    @Override
    public List<Slot> getSlotsByConsultantId(Long consultantId) {
        Consultant consultant = consultantRepository.findById(consultantId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tư vấn viên với ID: " + consultantId));
        return slotRepository.findByConsultant(consultant);
    }

    @Override
    public List<Slot> getAvailableSlotsByConsultantAndDate(Long consultantId, LocalDate date) {
        Consultant consultant = consultantRepository.findById(consultantId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tư vấn viên với ID: " + consultantId));
        
        return slotRepository.findByConsultantAndDateAndIsAvailable(consultant, date, true);
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
        responseDto.setConsultantId(slot.getConsultant().getId());
        responseDto.setConsultantName(slot.getConsultant().getFullname());
        responseDto.setAvailable(slot.isAvailable());
        return responseDto;
    }
} 