package com.cs261g7cstu.backend.dto;

import java.util.UUID;

public record PrerequisiteDTO(
    UUID courseId,
    UUID prerequisiteId
) {}
