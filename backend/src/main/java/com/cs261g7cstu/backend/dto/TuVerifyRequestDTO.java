package com.cs261g7cstu.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record TuVerifyRequestDTO(
        @JsonProperty("UserName") String userName,
        @JsonProperty("PassWord") String passWord
) {
}
