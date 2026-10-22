package com.cs261g7cstu.backend.dto;

import java.util.UUID;

public record CourseProgressDTO(
        UUID courseId,
        String code,
        String name,
        long totalTopics,
        long doneTopics,
        int percent
) {
}
