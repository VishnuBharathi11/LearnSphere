package com.learnsphere.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class LoginResponse {

    private Long userId;
    private String email;
    private String role;
    private String token;
}
