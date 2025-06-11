package com.dupss.app.BE_Dupss.controller;

import com.dupss.app.BE_Dupss.dto.request.ConsultantTopicsRequestDto;
import com.dupss.app.BE_Dupss.entity.Consultant;
import com.dupss.app.BE_Dupss.entity.Topic;
import com.dupss.app.BE_Dupss.exception.ResourceNotFoundException;
import com.dupss.app.BE_Dupss.respository.ConsultantRepository;
import com.dupss.app.BE_Dupss.respository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/manager/consultant-topics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class ConsultantTopicController {

    private final ConsultantRepository consultantRepository;
    private final TopicRepository topicRepository;

    /**
     * API lấy danh sách chủ đề của một tư vấn viên
     */
    @GetMapping("/consultant/{consultantId}")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<Set<Topic>> getTopicsByConsultantId(@PathVariable Long consultantId) {
        Consultant consultant = consultantRepository.findById(consultantId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tư vấn viên với ID: " + consultantId));
        return ResponseEntity.ok(consultant.getTopics());
    }

    /**
     * API lấy danh sách tư vấn viên của một chủ đề
     */
    @GetMapping("/topic/{topicId}")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<Set<Consultant>> getConsultantsByTopicId(@PathVariable Long topicId) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chủ đề với ID: " + topicId));
        return ResponseEntity.ok(topic.getConsultants());
    }

    /**
     * API thêm chủ đề cho tư vấn viên
     */
    @PostMapping("/consultant/{consultantId}/topic/{topicId}")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<Consultant> addTopicToConsultant(
            @PathVariable Long consultantId,
            @PathVariable Long topicId) {
        
        Consultant consultant = consultantRepository.findById(consultantId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tư vấn viên với ID: " + consultantId));
        
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chủ đề với ID: " + topicId));
        
        consultant.getTopics().add(topic);
        consultantRepository.save(consultant);
        
        return ResponseEntity.ok(consultant);
    }

    /**
     * API xóa chủ đề khỏi tư vấn viên
     */
    @DeleteMapping("/consultant/{consultantId}/topic/{topicId}")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<Consultant> removeTopicFromConsultant(
            @PathVariable Long consultantId,
            @PathVariable Long topicId) {
        
        Consultant consultant = consultantRepository.findById(consultantId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tư vấn viên với ID: " + consultantId));
        
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chủ đề với ID: " + topicId));
        
        consultant.getTopics().remove(topic);
        consultantRepository.save(consultant);
        
        return ResponseEntity.ok(consultant);
    }
    
    /**
     * API thiết lập nhiều chủ đề cho một tư vấn viên
     */
    @PutMapping("/consultant/{consultantId}/topics")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<Consultant> setTopicsForConsultant(
            @PathVariable Long consultantId,
            @RequestBody ConsultantTopicsRequestDto requestDto) {
        
        Consultant consultant = consultantRepository.findById(consultantId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tư vấn viên với ID: " + consultantId));
        
        // Xóa tất cả chủ đề hiện tại
        consultant.getTopics().clear();
        
        // Thêm các chủ đề mới
        for (Long topicId : requestDto.getTopicIds()) {
            Topic topic = topicRepository.findById(topicId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chủ đề với ID: " + topicId));
            consultant.getTopics().add(topic);
        }
        
        consultantRepository.save(consultant);
        
        return ResponseEntity.ok(consultant);
    }
} 