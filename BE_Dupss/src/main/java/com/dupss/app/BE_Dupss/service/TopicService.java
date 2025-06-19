package com.dupss.app.BE_Dupss.service;


import com.dupss.app.BE_Dupss.dto.request.TopicRequest;
import com.dupss.app.BE_Dupss.dto.response.TopicResponse;
import com.dupss.app.BE_Dupss.entity.Topic;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

public interface TopicService {
    List<Topic> getAll();
    TopicResponse create(TopicRequest request);
    TopicResponse update(Long id, TopicRequest request);
    List<TopicResponse> getAllTopics();
    List<TopicResponse> getTopicsCreatedByCurrentUser();
    void delete(Long id);
    TopicResponse getTopicById(Long id);
}
