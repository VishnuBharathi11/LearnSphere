package com.learnsphere.admin.dto;

import lombok.Data;

import java.util.List;

@Data
public class RolePermissionRequest {
    private String role;
    private List<String> permissions;
}

