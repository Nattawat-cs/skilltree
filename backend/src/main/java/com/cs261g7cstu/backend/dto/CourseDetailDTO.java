package com.cs261g7cstu.backend.dto;

import java.util.List;
import java.util.UUID;

public record CourseDetailDTO(
        UUID id,
        String code,
        String name,
        String desc,
        List<TopicItemDTO> topics
) {
}
