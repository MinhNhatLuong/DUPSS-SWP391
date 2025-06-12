package com.dupss.app.BE_Dupss.controller;

import com.dupss.app.BE_Dupss.dto.request.SlotRequestDto;
import com.dupss.app.BE_Dupss.dto.response.SlotResponseDto;
import com.dupss.app.BE_Dupss.entity.Consultant;
import com.dupss.app.BE_Dupss.entity.Slot;
import com.dupss.app.BE_Dupss.exception.ResourceNotFoundException;
import com.dupss.app.BE_Dupss.respository.ConsultantRepository;
import com.dupss.app.BE_Dupss.service.SlotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/slots")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class SlotController {

    private final SlotService slotService;
    private final ConsultantRepository consultantRepository;

    /**
     * API tạo slot thời gian mới cho tư vấn viên
     * Chỉ tư vấn viên mới có thể tạo slot của chính họ
     */
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_CONSULTANT')")
    public ResponseEntity<SlotResponseDto> createSlot(@Valid @RequestBody SlotRequestDto requestDto) {
        // Lấy thông tin tư vấn viên
//        Consultant consultant = consultantRepository.findById(requestDto.getConsultantId())
//                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tư vấn viên với ID: " + requestDto.getConsultantId()));
//
//        // Tạo đối tượng Slot từ requestDto
//        Slot slot = new Slot();
//        slot.setDate(requestDto.getDate());
//        slot.setStartTime(requestDto.getStartTime());
//        slot.setEndTime(requestDto.getEndTime());
//        slot.setConsultant(consultant);
//        slot.setAvailable(requestDto.isAvailable());
        
        // Lưu slot
//        Slot createdSlot = slotService.createSlot(requestDto);
        
        // Chuyển đổi thành SlotResponseDto
//        SlotResponseDto responseDto = mapToResponseDto(createdSlot);
        SlotResponseDto responseDto = slotService.createSlot(requestDto);
        
        return new ResponseEntity<>(responseDto, HttpStatus.CREATED);
    }

    /**
     * API lấy tất cả các slot của một tư vấn viên
     */
    @GetMapping("/consultant/{consultantId}")
    public ResponseEntity<List<SlotResponseDto>> getSlotsByConsultantId(@PathVariable Long consultantId) {
        List<Slot> slots = slotService.getSlotsByConsultantId(consultantId);
        List<SlotResponseDto> responseDtos = slots.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responseDtos);
    }

    /**
     * API lấy các slot khả dụng của một tư vấn viên vào một ngày cụ thể
     * Dùng cho việc hiển thị các slot khả dụng để khách hàng đặt lịch
     */
    @GetMapping("/available")
    public ResponseEntity<List<SlotResponseDto>> getAvailableSlots(
            @RequestParam Long consultantId,
            @RequestParam @DateTimeFormat(pattern = "dd/MM/yyyy") LocalDate date) {
        List<Slot> availableSlots = slotService.getAvailableSlotsByConsultantAndDate(consultantId, date);
        List<SlotResponseDto> responseDtos = availableSlots.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responseDtos);
    }

    /**
     * API cập nhật trạng thái khả dụng của slot
     * Chỉ tư vấn viên mới có thể cập nhật slot của chính họ
     */
    @PatchMapping("/{slotId}/availability")
    public ResponseEntity<SlotResponseDto> updateSlotAvailability(
            @PathVariable Long slotId,
            @RequestParam boolean isAvailable,
            @RequestParam Long consultantId) {
        Slot updatedSlot = slotService.updateSlotAvailability(slotId, isAvailable, consultantId);
        SlotResponseDto responseDto = mapToResponseDto(updatedSlot);
        return ResponseEntity.ok(responseDto);
    }

    /**
     * API xóa slot
     * Chỉ tư vấn viên mới có thể xóa slot của chính họ
     */
    @DeleteMapping("/{slotId}")
    public ResponseEntity<Void> deleteSlot(
            @PathVariable Long slotId,
            @RequestParam Long consultantId) {
        slotService.deleteSlot(slotId, consultantId);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Chuyển đổi từ Slot entity sang SlotResponseDto
     */
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

//Lịch sử API: lấy danh sách các apoiment của một tư vấn viên đã được tư vấn thành công (vd: sattus = "COMPLETED")
//list slot: sau khi ăng ký lịch thành công thì có api get all slot của một tư vấn viên
// manager gán topic cho consultant : update consultant