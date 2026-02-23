package com.learnsphere.auth.service;

import com.learnsphere.auth.dto.LoginRequest;
import com.learnsphere.auth.dto.LoginResponse;
import com.learnsphere.auth.dto.RegisterRequest;
import com.learnsphere.auth.dto.ForgotPasswordRequest;
import com.learnsphere.auth.dto.ResetPasswordRequest;

public interface AuthService {

    String register(RegisterRequest request);

    LoginResponse login(LoginRequest request);

    String sendForgotPasswordOtp(ForgotPasswordRequest request);

    String resetPassword(ResetPasswordRequest request);
}
