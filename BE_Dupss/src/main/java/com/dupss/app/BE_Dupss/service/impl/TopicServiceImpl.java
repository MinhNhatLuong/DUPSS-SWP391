package com.dupss.app.BE_Dupss.service.impl;

import com.dupss.app.BE_Dupss.entity.Topic;
import com.dupss.app.BE_Dupss.respository.TopicRepo;
import com.dupss.app.BE_Dupss.service.TopicService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Slf4j
public class TopicServiceImpl implements TopicService {
    private final TopicRepo topicRepository;

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
    public Topic create(Topic request) {
        if (topicRepository.existsByNameIgnoreCase(request.getName())) {
            throw new IllegalArgumentException("Topic with the same name already exists");
        }

        Topic topic = new Topic();
        topic.setName(request.getName());
        topic.setDescription(request.getDescription());
        return topicRepository.save(topic);
    }

    @Override
    public Topic update(Long id, Topic request) {
        Topic topic = getById(id);
        topic.setName(request.getName());
        return topicRepository.save(topic);
    }

    @Override
    public void delete(Long id) {
        Topic topic = getById(id);
        topicRepository.delete(topic);
    }
}
