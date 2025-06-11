package com.dupss.app.BE_Dupss.service;

import com.dupss.app.BE_Dupss.entity.Slot;

import java.time.LocalDate;
import java.util.List;

public interface SlotService {
    
    /**
     * Tạo slot thời gian mới cho tư vấn viên
     */
    Slot createSlot(Slot slot);
    
    /**
     * Lấy tất cả các slot của một tư vấn viên
     */
    List<Slot> getSlotsByConsultantId(Long consultantId);
    
    /**
     * Lấy các slot khả dụng của một tư vấn viên vào một ngày cụ thể
     */
    List<Slot> getAvailableSlotsByConsultantAndDate(Long consultantId, LocalDate date);
    
    /**
     * Cập nhật trạng thái khả dụng của slot
     */
    Slot updateSlotAvailability(Long slotId, boolean isAvailable, Long consultantId);
    
    /**
     * Xóa slot
     */
    void deleteSlot(Long slotId, Long consultantId);
} 