package com.learnsphere.auth.service;

import com.learnsphere.auth.dto.LoginRequest;
import com.learnsphere.auth.dto.LoginResponse;
import com.learnsphere.auth.dto.ProfileResponse;
import com.learnsphere.auth.dto.RegisterRequest;
import com.learnsphere.auth.dto.ForgotPasswordRequest;
import com.learnsphere.auth.dto.ResetPasswordRequest;
import com.learnsphere.auth.dto.UpdateProfileRequest;

public interface AuthService {

    String register(RegisterRequest request);

    LoginResponse login(LoginRequest request);

    String sendForgotPasswordOtp(ForgotPasswordRequest request);

    String resetPassword(ResetPasswordRequest request);

    ProfileResponse getProfile(String email);

    ProfileResponse updateProfile(String email, UpdateProfileRequest request);
}
