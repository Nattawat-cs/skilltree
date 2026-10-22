package com.cs261g7cstu.backend.dto;

import java.util.UUID;

public record CourseItemDTO(
    UUID id,
    String code,
    String name,
    String desc
) {}
