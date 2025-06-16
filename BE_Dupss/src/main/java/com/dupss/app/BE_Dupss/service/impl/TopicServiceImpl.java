package com.dupss.app.BE_Dupss.service.impl;

import com.dupss.app.BE_Dupss.dto.request.TopicRequest;
import com.dupss.app.BE_Dupss.dto.response.TopicResponse;
import com.dupss.app.BE_Dupss.entity.Topic;
import com.dupss.app.BE_Dupss.entity.User;
import com.dupss.app.BE_Dupss.respository.TopicRepo;
import com.dupss.app.BE_Dupss.respository.UserRepository;
import com.dupss.app.BE_Dupss.service.TopicService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TopicServiceImpl implements TopicService {
    private final TopicRepo topicRepository;
    private final UserRepository userRepository;

    @Override
    public List<Topic> getAll() {
        return topicRepository.findAll();
    }

    @Override
    public Topic getById(Long id) {
        return topicRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Topic not found with id " + id));
    }

    @Override
    public TopicResponse create(TopicRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User creator = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (topicRepository.existsByNameIgnoreCase(request.getName())) {
            throw new IllegalArgumentException("Topic with the same name already exists");
        }

        Topic topic = new Topic();
        topic.setName(request.getName());
        topic.setDescription(request.getDescription());
        topic.setCreator(creator);
        Topic savedTopic = topicRepository.save(topic);
        return mapToResponse(savedTopic, creator.getFullname());
    }

    @Override
    public List<TopicResponse> getTopicsCreatedByCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        List<Topic> topics = topicRepository.findByCreator_Username(username);

        return topics.stream()
                .map(topic -> new TopicResponse(
                        topic.getId(),
                        topic.getName(),
                        topic.getDescription(),
                        topic.getCreator().getFullname(),
                        topic.getCreatedAt(),
                        topic.getUpdatedAt()
                ))
                .collect(Collectors.toList());
    }

    @Override
    public List<TopicResponse> getAllTopics() {
        return topicRepository.findAll().stream()
                .map(topic -> new TopicResponse(
                        topic.getId(),
                        topic.getName(),
                        topic.getDescription(),
                        topic.getCreator().getFullname(),
                        topic.getCreatedAt(),
                        topic.getUpdatedAt()
                ))
                .collect(Collectors.toList());
    }

    @Override
    public TopicResponse update(Long id, TopicRequest request) {
        Topic topic = getById(id);
        if (request.getName() != null && !request.getName().isBlank()) {
            topic.setName(request.getName().trim());
        }
        Topic savedTopic = topicRepository.save(topic);
        return mapToResponse(savedTopic, topic.getCreator().getFullname());
    }

    @Override
    public void delete(Long id) {
        Topic topic = getById(id);
        topicRepository.delete(topic);
    }

    private TopicResponse mapToResponse(Topic topic, String authorName) {
        return TopicResponse.builder()
                .topicName(topic.getName())
                .topicDescription(topic.getDescription())
                .creatorName(authorName)
                .createdAt(topic.getCreatedAt())
                .updatedAt(topic.getUpdatedAt())
                .build();
    }

}
