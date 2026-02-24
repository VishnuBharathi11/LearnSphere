package com.learnsphere.auth.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String name;
    private String phone;
    private String bio;
    private String expertise;
    private String experience;
    private String linkedin;
    private String portfolio;
    private String professionalWebsite;
    private String profileImage;
}
