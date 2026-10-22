package com.cs261g7cstu.backend.service;

import com.cs261g7cstu.backend.dto.CourseProgressDTO;
import com.cs261g7cstu.backend.dto.ProgressDTO;
import com.cs261g7cstu.backend.entity.Progress;
import com.cs261g7cstu.backend.entity.ProgressId;
import com.cs261g7cstu.backend.mapper.ProgressMapper;
import com.cs261g7cstu.backend.repository.ProgressRepository;
import com.cs261g7cstu.backend.repository.TopicRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ProgressService {

    private final ProgressRepository progressRepository;
    private final TopicRepository topicRepository;
    private final ProgressMapper progressMapper;

    public ProgressService(ProgressRepository progressRepository,
                           TopicRepository topicRepository,
                           ProgressMapper progressMapper) {
        this.progressRepository = progressRepository;
        this.topicRepository = topicRepository;
        this.progressMapper = progressMapper;
    }

    public List<ProgressDTO> getProgress(UUID userId) {
        return progressRepository.findByIdUserId(userId).stream()
                .map(progressMapper::toDTO)
                .toList();
    }

    public List<CourseProgressDTO> getCourseProgress(UUID userId) {
        return progressRepository.findCourseProgressCounts(userId).stream()
                .map(progressMapper::toCourseProgressDTO)
                .toList();
    }

    public ProgressDTO markDone(UUID userId, UUID topicId) {
        if (!topicRepository.existsById(topicId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found");
        }
        ProgressId id = new ProgressId(userId, topicId);
        Progress progress = progressRepository.findById(id)
                .orElseGet(() -> progressRepository.save(new Progress(id, LocalDateTime.now())));
        return progressMapper.toDTO(progress);
    }

    public void unmarkDone(UUID userId, UUID topicId) {
        progressRepository.deleteById(new ProgressId(userId, topicId));
    }
}
