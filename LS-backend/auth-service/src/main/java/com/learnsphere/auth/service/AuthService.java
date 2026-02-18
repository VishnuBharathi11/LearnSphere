package com.learnsphere.auth.service;

import com.learnsphere.auth.dto.LoginRequest;
import com.learnsphere.auth.dto.LoginResponse;
import com.learnsphere.auth.dto.RegisterRequest;

public interface AuthService {

    String register(RegisterRequest request);

    LoginResponse login(LoginRequest request);
}
