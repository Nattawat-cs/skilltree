package com.cs261g7cstu.backend.dto;

import java.util.UUID;
import java.time.LocalDateTime;

public record ProgressDTO(
        UUID topicId,
        LocalDateTime doneAt
) {
}