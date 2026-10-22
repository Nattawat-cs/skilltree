package com.cs261g7cstu.backend.controller;

import com.cs261g7cstu.backend.dto.UserDTO;
import com.cs261g7cstu.backend.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @Test
    void login_whenSuccess_shouldSetUserIdInSessionAndReturn200() throws Exception {
        UUID userId = UUID.randomUUID();
        UserDTO userDTO = new UserDTO(
                userId,
                "6709681234",
                "สมชาย ใจดี",
                "Somchai Jaidee",
                "somchai.jai@dome.tu.ac.th",
                "ปกติ",
                "คณะวิทยาศาสตร์และเทคโนโลยี",
                "วิทยาการคอมพิวเตอร์"
        );

        when(authService.login("6709681234", "secret")).thenReturn(userDTO);

        String requestBody = """
                {
                  "username": "6709681234",
                  "password": "secret"
                }
                """;

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(request().sessionAttribute("userId", userId))
                .andExpect(jsonPath("$.id").value(userId.toString()))
                .andExpect(jsonPath("$.studentId").value("6709681234"))
                .andExpect(jsonPath("$.displayNameEn").value("Somchai Jaidee"));
    }

    @Test
    void login_whenInvalidCredentials_shouldReturn401() throws Exception {
        when(authService.login("6709681234", "wrongpass"))
                .thenThrow(new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        String requestBody = """
                {
                  "username": "6709681234",
                  "password": "wrongpass"
                }
                """;

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void login_whenNotStudent_shouldReturn403() throws Exception {
        when(authService.login("emp001", "pass123"))
                .thenThrow(new ResponseStatusException(HttpStatus.FORBIDDEN));

        String requestBody = """
                {
                  "username": "emp001",
                  "password": "pass123"
                }
                """;

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isForbidden());
    }
}

