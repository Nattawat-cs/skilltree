package com.cs261g7cstu.backend.mapper;

import com.cs261g7cstu.backend.dto.CourseProgressCount;
import com.cs261g7cstu.backend.dto.CourseProgressDTO;
import com.cs261g7cstu.backend.dto.ProgressDTO;
import com.cs261g7cstu.backend.entity.Progress;
import com.cs261g7cstu.backend.entity.ProgressId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class ProgressMapperTest {

    private ProgressMapper progressMapper;

    @BeforeEach
    void setUp() {
        progressMapper = new ProgressMapper();
    }

    @Test
    void toDTO_shouldMapProgressEntityToProgressDTO() {
        UUID userId = UUID.randomUUID();
        UUID topicId = UUID.randomUUID();
        LocalDateTime doneAt = LocalDateTime.of(2026, 10, 20, 10, 30);

        Progress progress = new Progress(new ProgressId(userId, topicId), doneAt);

        ProgressDTO result = progressMapper.toDTO(progress);

        assertNotNull(result);
        assertEquals(topicId, result.topicId());
        assertEquals(doneAt, result.doneAt());
    }

    @Test
    void toCourseProgressDTO_whenTotalTopicsIsZero_shouldReturnZeroPercent() {
        UUID courseId = UUID.randomUUID();
        CourseProgressCount count = new CourseProgressCount(
                courseId,
                "CS100",
                "Empty Course",
                0L,
                0L
        );

        CourseProgressDTO result = progressMapper.toCourseProgressDTO(count);

        assertNotNull(result);
        assertEquals(courseId, result.courseId());
        assertEquals("CS100", result.code());
        assertEquals("Empty Course", result.name());
        assertEquals(0L, result.totalTopics());
        assertEquals(0L, result.doneTopics());
        assertEquals(0, result.percent());
    }

    @Test
    void toCourseProgressDTO_whenEvenlyDivisible_shouldCalculateExactPercent() {
        UUID courseId = UUID.randomUUID();
        CourseProgressCount count = new CourseProgressCount(
                courseId,
                "CS101",
                "Intro to CS",
                4L,
                2L
        );

        CourseProgressDTO result = progressMapper.toCourseProgressDTO(count);

        assertNotNull(result);
        assertEquals(4L, result.totalTopics());
        assertEquals(2L, result.doneTopics());
        assertEquals(50, result.percent());
    }

    @Test
    void toCourseProgressDTO_whenNotEvenlyDivisible_shouldTruncateUsingIntegerDivision() {
        UUID courseId = UUID.randomUUID();
        CourseProgressCount count = new CourseProgressCount(
                courseId,
                "CS261",
                "Software Engineering",
                3L,
                1L
        );

        CourseProgressDTO result = progressMapper.toCourseProgressDTO(count);

        assertNotNull(result);
        assertEquals(3L, result.totalTopics());
        assertEquals(1L, result.doneTopics());
        assertEquals(33, result.percent());
    }
}

