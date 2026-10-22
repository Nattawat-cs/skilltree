package com.cs261g7cstu.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record TuVerifyResponseDTO(
        boolean status,
        String message,
        String type,
        String username,
        @JsonProperty("tu_status") String tuStatus,
        @JsonProperty("statusid") String statusId,
        @JsonProperty("displayname_th") String displayNameTh,
        @JsonProperty("displayname_en") String displayNameEn,
        String email,
        String department,
        String faculty
) {
}
