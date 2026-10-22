package com.cs261g7cstu.backend.dto;

import java.util.UUID;

public record CourseProgressCount(
        UUID courseId,
        String code,
        String name,
        long totalTopics,
        long doneTopics
) {
}
