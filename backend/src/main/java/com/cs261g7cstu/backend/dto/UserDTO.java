package com.cs261g7cstu.backend.dto;

import java.util.UUID;

public record UserDTO(
        UUID id,
        String studentId,
        String displayNameTh,
        String displayNameEn,
        String email,
        String tuStatus,
        String faculty,
        String department
) {
}
