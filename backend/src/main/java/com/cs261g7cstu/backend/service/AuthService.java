package com.cs261g7cstu.backend.service;

import com.cs261g7cstu.backend.client.TuApiClient;
import com.cs261g7cstu.backend.dto.TuVerifyResponseDTO;
import com.cs261g7cstu.backend.dto.UserDTO;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private static final String STUDENT_TYPE = "student";

    private final TuApiClient tuApiClient;
    private final UserService userService;

    public AuthService(TuApiClient tuApiClient, UserService userService) {
        this.tuApiClient = tuApiClient;
        this.userService = userService;
    }

    public UserDTO login(String username, String password) {
        TuVerifyResponseDTO response = tuApiClient.verify(username, password);
        if (response == null || !response.status()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
        }
        if (!STUDENT_TYPE.equals(response.type())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only students can log in");
        }
        return userService.getOrCreate(response);
    }
}
