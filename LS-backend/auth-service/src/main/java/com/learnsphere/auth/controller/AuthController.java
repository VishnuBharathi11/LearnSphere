package com.learnsphere.auth.controller;

import com.learnsphere.auth.dto.LoginRequest;
import com.learnsphere.auth.dto.LoginResponse;
import com.learnsphere.auth.dto.RegisterRequest;
import com.learnsphere.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // ✅ REGISTER
    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    // ✅ LOGIN
    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }
}
