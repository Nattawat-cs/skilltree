package com.cs261g7cstu.backend.service;

import com.cs261g7cstu.backend.dto.CourseProgressCount;
import com.cs261g7cstu.backend.dto.CourseProgressDTO;
import com.cs261g7cstu.backend.dto.ProgressDTO;
import com.cs261g7cstu.backend.entity.Progress;
import com.cs261g7cstu.backend.entity.ProgressId;
import com.cs261g7cstu.backend.mapper.ProgressMapper;
import com.cs261g7cstu.backend.repository.ProgressRepository;
import com.cs261g7cstu.backend.repository.TopicRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProgressServiceTest {

    @Mock
    private ProgressRepository progressRepository;

    @Mock
    private TopicRepository topicRepository;

    @Mock
    private ProgressMapper progressMapper;

    @InjectMocks
    private ProgressService progressService;

    @Test
    void getProgress_shouldReturnMappedProgressDTOList() {
        UUID userId = UUID.randomUUID();
        UUID topicId = UUID.randomUUID();
        LocalDateTime doneAt = LocalDateTime.now();

        Progress progress = new Progress(new ProgressId(userId, topicId), doneAt);
        ProgressDTO expectedDto = new ProgressDTO(topicId, doneAt);

        when(progressRepository.findByIdUserId(userId)).thenReturn(List.of(progress));
        when(progressMapper.toDTO(progress)).thenReturn(expectedDto);

        List<ProgressDTO> result = progressService.getProgress(userId);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(expectedDto, result.get(0));
        verify(progressRepository).findByIdUserId(userId);
        verify(progressMapper).toDTO(progress);
    }

    @Test
    void getCourseProgress_shouldReturnMappedCourseProgressDTOList() {
        UUID userId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();

        CourseProgressCount count = new CourseProgressCount(courseId, "CS101", "Intro", 4L, 2L);
        CourseProgressDTO expectedDto = new CourseProgressDTO(courseId, "CS101", "Intro", 4L, 2L, 50);

        when(progressRepository.findCourseProgressCounts(userId)).thenReturn(List.of(count));
        when(progressMapper.toCourseProgressDTO(count)).thenReturn(expectedDto);

        List<CourseProgressDTO> result = progressService.getCourseProgress(userId);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(expectedDto, result.get(0));
        verify(progressRepository).findCourseProgressCounts(userId);
        verify(progressMapper).toCourseProgressDTO(count);
    }

    @Test
    void markDone_whenTopicDoesNotExist_shouldThrowNotFoundException() {
        UUID userId = UUID.randomUUID();
        UUID topicId = UUID.randomUUID();

        when(topicRepository.existsById(topicId)).thenReturn(false);

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> progressService.markDone(userId, topicId)
        );

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        verify(progressRepository, never()).save(any());
    }

    @Test
    void markDone_whenNewProgress_shouldSaveProgressWithNonNullDoneAtAndReturnDTO() {
        UUID userId = UUID.randomUUID();
        UUID topicId = UUID.randomUUID();
        ProgressId expectedId = new ProgressId(userId, topicId);

        when(topicRepository.existsById(topicId)).thenReturn(true);
        when(progressRepository.findById(expectedId)).thenReturn(Optional.empty());
        when(progressRepository.save(any(Progress.class))).thenAnswer(inv -> inv.getArgument(0));

        ProgressDTO expectedDto = new ProgressDTO(topicId, LocalDateTime.now());
        when(progressMapper.toDTO(any(Progress.class))).thenReturn(expectedDto);

        ProgressDTO result = progressService.markDone(userId, topicId);

        assertNotNull(result);
        assertEquals(expectedDto, result);

        ArgumentCaptor<Progress> captor = ArgumentCaptor.forClass(Progress.class);
        verify(progressRepository).save(captor.capture());

        Progress savedProgress = captor.getValue();
        assertEquals(expectedId, savedProgress.getId());
        assertNotNull(savedProgress.getDoneAt());
    }

    @Test
    void markDone_whenProgressAlreadyExists_shouldReturnExistingDTOWithoutSaving() {
        UUID userId = UUID.randomUUID();
        UUID topicId = UUID.randomUUID();
        ProgressId expectedId = new ProgressId(userId, topicId);
        LocalDateTime existingDoneAt = LocalDateTime.of(2026, 10, 18, 9, 0);

        Progress existingProgress = new Progress(expectedId, existingDoneAt);
        ProgressDTO expectedDto = new ProgressDTO(topicId, existingDoneAt);

        when(topicRepository.existsById(topicId)).thenReturn(true);
        when(progressRepository.findById(expectedId)).thenReturn(Optional.of(existingProgress));
        when(progressMapper.toDTO(existingProgress)).thenReturn(expectedDto);

        ProgressDTO result = progressService.markDone(userId, topicId);

        assertNotNull(result);
        assertEquals(expectedDto, result);
        verify(progressRepository, never()).save(any());
        verify(progressMapper).toDTO(existingProgress);
    }

    @Test
    void unmarkDone_shouldDeleteProgressByCompositeId() {
        UUID userId = UUID.randomUUID();
        UUID topicId = UUID.randomUUID();
        ProgressId expectedId = new ProgressId(userId, topicId);

        progressService.unmarkDone(userId, topicId);

        verify(progressRepository).deleteById(expectedId);
    }
}

