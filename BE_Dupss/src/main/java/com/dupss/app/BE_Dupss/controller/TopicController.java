package com.dupss.app.BE_Dupss.controller;

import com.dupss.app.BE_Dupss.dto.response.TopicResponse;
import com.dupss.app.BE_Dupss.entity.Topic;
import com.dupss.app.BE_Dupss.respository.TopicRepository;
import com.dupss.app.BE_Dupss.service.TopicService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/topics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class TopicController {

    private final TopicRepo topicRepository;
    private final TopicService topicService;

    /**
     * API lấy tất cả chủ đề tư vấn
     * Phục vụ cho việc hiển thị danh sách chủ đề tư vấn khi đặt lịch
     */
    @GetMapping
    public ResponseEntity<List<TopicResponse>> getAllTopics() {
        List<TopicResponse> topics = topicService.getAllTopics();
        return ResponseEntity.ok(topics);
    }

    /**
     * API lấy chủ đề tư vấn theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Topic> getTopicById(@PathVariable Long id) {
        return topicRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER')")
    public ResponseEntity<List<TopicResponse>> getAllTopicsByMe() {
        List<TopicResponse> topics = topicService.getTopicsCreatedByCurrentUser();
        return ResponseEntity.ok(topics);
    }
} 