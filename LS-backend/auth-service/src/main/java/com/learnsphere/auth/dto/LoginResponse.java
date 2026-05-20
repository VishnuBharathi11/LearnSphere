package com.learnsphere.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class LoginResponse {

    private Long userId;
    private String name;
    private String email;
    private String phone;
    private String profileImage;
    private String role;
    private String token;
}
