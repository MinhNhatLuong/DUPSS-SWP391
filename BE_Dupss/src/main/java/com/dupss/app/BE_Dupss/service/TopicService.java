package com.dupss.app.BE_Dupss.service;


import com.dupss.app.BE_Dupss.entity.Topic;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

public interface TopicService {
    List<Topic> getAll();
    Topic getById(Long id);
    Topic create(Topic request);
    Topic update(Long id, Topic request);
    void delete(Long id);
}
