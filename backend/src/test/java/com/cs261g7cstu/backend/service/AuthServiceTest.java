package com.cs261g7cstu.backend.service;

import com.cs261g7cstu.backend.client.TuApiClient;
import com.cs261g7cstu.backend.dto.TuVerifyResponseDTO;
import com.cs261g7cstu.backend.dto.UserDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private TuApiClient tuApiClient;

    @Mock
    private UserService userService;

    @InjectMocks
    private AuthService authService;

    @Test
    void login_whenTuVerifyStatusIsFalse_shouldThrowUnauthorizedException() {
        TuVerifyResponseDTO failedResponse = new TuVerifyResponseDTO(
                false,
                "Invalid credentials",
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
        );

        when(tuApiClient.verify("6709681234", "wrongpass")).thenReturn(failedResponse);

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> authService.login("6709681234", "wrongpass")
        );

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
        verifyNoInteractions(userService);
    }

    @Test
    void login_whenUserTypeIsNotStudent_shouldThrowForbiddenException() {
        TuVerifyResponseDTO employeeResponse = new TuVerifyResponseDTO(
                true,
                "Success",
                "employee",
                "emp001",
                "ปกติ",
                "10",
                "อาจารย์ ทดสอบ",
                "Teacher Test",
                "teacher@tu.ac.th",
                "วิทยาการคอมพิวเตอร์",
                "คณะวิทยาศาสตร์และเทคโนโลยี"
        );

        when(tuApiClient.verify("emp001", "pass123")).thenReturn(employeeResponse);

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> authService.login("emp001", "pass123")
        );

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verifyNoInteractions(userService);
    }

    @Test
    void login_whenValidStudent_shouldReturnUserDTO() {
        TuVerifyResponseDTO validResponse = new TuVerifyResponseDTO(
                true,
                "Success",
                "student",
                "6709681234",
                "ปกติ",
                "10",
                "สมชาย ใจดี",
                "Somchai Jaidee",
                "somchai.jai@dome.tu.ac.th",
                "วิทยาการคอมพิวเตอร์",
                "คณะวิทยาศาสตร์และเทคโนโลยี"
        );

        UserDTO expectedUser = new UserDTO(
                UUID.randomUUID(),
                "6709681234",
                "สมชาย ใจดี",
                "Somchai Jaidee",
                "somchai.jai@dome.tu.ac.th",
                "ปกติ",
                "คณะวิทยาศาสตร์และเทคโนโลยี",
                "วิทยาการคอมพิวเตอร์"
        );

        when(tuApiClient.verify("6709681234", "secret")).thenReturn(validResponse);
        when(userService.getOrCreate(validResponse)).thenReturn(expectedUser);

        UserDTO result = authService.login("6709681234", "secret");

        assertNotNull(result);
        assertEquals(expectedUser, result);
        verify(tuApiClient).verify("6709681234", "secret");
        verify(userService).getOrCreate(validResponse);
    }
}

