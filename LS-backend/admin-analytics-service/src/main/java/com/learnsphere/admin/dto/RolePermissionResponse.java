package com.learnsphere.admin.dto;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RolePermissionResponse {
    private String role;
    private List<String> permissions;
    private long users;
}

