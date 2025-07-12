package com.dupss.app.BE_Dupss.service.impl;

import com.dupss.app.BE_Dupss.dto.request.TopicRequest;
import com.dupss.app.BE_Dupss.dto.response.TopicResponse;
import com.dupss.app.BE_Dupss.entity.Topic;
import com.dupss.app.BE_Dupss.entity.User;
import com.dupss.app.BE_Dupss.exception.ResourceNotFoundException;
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
        return topicRepository.findAllActive();
    }

    @Override
    public TopicResponse getTopicById(Long id) {
        Topic topic = topicRepository.findByIdAndActive(id, true);
        if(topic == null) {
            throw new ResourceNotFoundException("Topic not found with id: " + id);
        } else {
            return mapToResponse(topic, topic.getCreator().getFullname());
        }
    }

    @Override
    public TopicResponse create(TopicRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User creator = userRepository.findByUsernameAndEnabledTrue(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (topicRepository.existsByNameIgnoreCase(request.getName())) {
            throw new IllegalArgumentException("Topic with the same name already exists");
        }

        Topic topic = new Topic();
        topic.setName(request.getName());
        topic.setDescription(request.getDescription());
        topic.setCreator(creator);
        topic.setActive(true);
        Topic savedTopic = topicRepository.save(topic);
        return mapToResponse(savedTopic, creator.getFullname());
    }

    @Override
    public List<TopicResponse> getTopicsCreatedByCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        List<Topic> topics = topicRepository.findByCreator_UsernameAndActive(username, true);

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
        return topicRepository.findAllActive().stream()
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
        Topic topic = topicRepository.findByIdAndActive(id, true);
        if (request.getName() != null && !request.getName().isBlank()) {
            topic.setName(request.getName().trim());
        }
        if (request.getDescription() != null && !request.getDescription().isBlank()) {
            topic.setDescription(request.getDescription().trim());
        }
        Topic savedTopic = topicRepository.save(topic);
        return mapToResponse(savedTopic, topic.getCreator().getFullname());
    }

    @Override
    public void delete(Long id) {
        Topic topic = topicRepository.findByIdAndActive(id, true);
        if (!topic.isActive()) {
            throw new IllegalArgumentException("Topic is already inactive");
        }
        topic.setActive(false);
        topicRepository.save(topic);
    }

    private TopicResponse mapToResponse(Topic topic, String authorName) {
        return TopicResponse.builder()
                .id(topic.getId())
                .topicName(topic.getName())
                .topicDescription(topic.getDescription())
                .creatorName(authorName)
                .createdAt(topic.getCreatedAt())
                .updatedAt(topic.getUpdatedAt())
                .build();
    }

}
