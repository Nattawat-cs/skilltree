package com.cs261g7cstu.backend.controller;

import com.cs261g7cstu.backend.dto.LoginRequestDTO;
import com.cs261g7cstu.backend.dto.UserDTO;
import com.cs261g7cstu.backend.service.AuthService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/auth/login")
    public ResponseEntity<UserDTO> login(@RequestBody LoginRequestDTO request, HttpSession session) {
        UserDTO userDTO = authService.login(request.username(), request.password());
        session.setAttribute("userId", userDTO.id());
        return ResponseEntity.ok(userDTO);
    }
}
