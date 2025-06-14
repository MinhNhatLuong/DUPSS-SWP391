package com.dupss.app.BE_Dupss.controller;

import com.dupss.app.BE_Dupss.entity.Topic;
import com.dupss.app.BE_Dupss.respository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/topics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class TopicController {

    private final TopicRepository topicRepository;

    /**
     * API lấy tất cả chủ đề tư vấn
     * Phục vụ cho việc hiển thị danh sách chủ đề tư vấn khi đặt lịch
     */
    @GetMapping
    public ResponseEntity<List<Topic>> getAllTopics() {
        List<Topic> topics = topicRepository.findAll();
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
} 