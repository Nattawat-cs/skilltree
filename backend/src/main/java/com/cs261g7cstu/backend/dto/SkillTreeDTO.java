package com.cs261g7cstu.backend.dto;

import java.util.List;

public record SkillTreeDTO(
    List<CourseItemDTO> courses,
    List<PrerequisiteDTO> prerequisites
) {}