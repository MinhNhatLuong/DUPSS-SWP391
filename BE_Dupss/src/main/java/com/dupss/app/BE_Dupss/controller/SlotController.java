package com.dupss.app.BE_Dupss.controller;

import com.dupss.app.BE_Dupss.dto.request.SlotRequestDto;
import com.dupss.app.BE_Dupss.dto.response.SlotResponseDto;
import com.dupss.app.BE_Dupss.entity.Slot;
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

    @GetMapping("/consultant/{consultantId}")
    public ResponseEntity<List<SlotResponseDto>> getSlotsByConsultantIdAndDate(@PathVariable Long consultantId, @RequestParam(required = false) @DateTimeFormat(pattern = "dd/MM/yyyy") LocalDate date) {
        if(date == null) {
            date = LocalDate.now();
        }
        List<SlotResponseDto> res = slotService.getAvailableSlotsByConsultantAndDate(consultantId, date);
        return ResponseEntity.ok(res);
    }
}

