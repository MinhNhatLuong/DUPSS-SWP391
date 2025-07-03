package com.dupss.app.BE_Dupss.service;

import com.dupss.app.BE_Dupss.dto.response.ConsultantResponse;
import com.dupss.app.BE_Dupss.dto.response.SlotResponseDto;
import com.dupss.app.BE_Dupss.entity.ERole;
import com.dupss.app.BE_Dupss.entity.User;
import com.dupss.app.BE_Dupss.respository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ConsultantService {
    private final UserRepository userRepository;
    private final SlotService slotService;

    public List<ConsultantResponse> getAllConsultantsWithAvailableSlots(LocalDate date) {
        List<User> consultants = userRepository.findByRoleAndEnabled(ERole.ROLE_CONSULTANT, true);
        List<ConsultantResponse> result = new ArrayList<>();

        for (User consultant : consultants) {
            List<SlotResponseDto> slots = slotService.getAvailableSlotsByConsultantAndDate(consultant.getId(), date);
            ConsultantResponse dto = new ConsultantResponse();
            dto.setConsultantName(consultant.getFullname());
            dto.setAvatar(consultant.getAvatar());
            dto.setCertificates(consultant.getConsultantProfile().getCertificates());
            dto.setBio(consultant.getConsultantProfile().getBio());
            if (!slots.isEmpty()) {
                dto.setAvailableSlots(slots);
            }
            result.add(dto);
        }
        return result;
    }

}
