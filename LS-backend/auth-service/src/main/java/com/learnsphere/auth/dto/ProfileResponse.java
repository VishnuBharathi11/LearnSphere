package com.learnsphere.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponse {
    private Long userId;
    private String name;
    private String email;
    private String phone;
    private String role;
    private String bio;
    private String expertise;
    private String experience;
    private String linkedin;
    private String portfolio;
    private String professionalWebsite;
    private String profileImage;
}
