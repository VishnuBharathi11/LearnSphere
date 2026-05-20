package com.learnsphere.auth.controller;

import com.learnsphere.auth.dto.LoginRequest;
import com.learnsphere.auth.dto.LoginResponse;
import com.learnsphere.auth.dto.ProfileResponse;
import com.learnsphere.auth.dto.RegisterRequest;
import com.learnsphere.auth.dto.ForgotPasswordRequest;
import com.learnsphere.auth.dto.ResetPasswordRequest;
import com.learnsphere.auth.dto.UpdateProfileRequest;
import com.learnsphere.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import java.security.Principal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/forgot-password")
    public String forgotPassword(@RequestBody ForgotPasswordRequest request) {
        return authService.sendForgotPasswordOtp(request);
    }

    @PostMapping("/reset-password")
    public String resetPassword(@RequestBody ResetPasswordRequest request) {
        return authService.resetPassword(request);
    }

    @GetMapping("/profile")
    public ProfileResponse getProfile(Principal principal) {
        return authService.getProfile(principal.getName());
    }

    @PutMapping("/profile")
    public ProfileResponse updateProfile(Principal principal, @RequestBody UpdateProfileRequest request) {
        return authService.updateProfile(principal.getName(), request);
    }
}
