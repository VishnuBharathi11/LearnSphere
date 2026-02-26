package com.learnsphere.admin.controller;

import com.learnsphere.admin.dto.*;
import com.learnsphere.admin.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService service;

    @GetMapping("/dashboard")
    public DashboardResponse dashboard() {
        return service.getDashboard();
    }

    @GetMapping("/users")
    public List<AdminUserResponse> users() {
        return service.getUsers();
    }

    @PutMapping("/users/{userId}/suspend")
    public AdminUserResponse suspendUser(@PathVariable Long userId, @RequestParam boolean value) {
        return service.setUserSuspended(userId, value);
    }

    @DeleteMapping("/users/{userId}")
    public void deleteUser(@PathVariable Long userId) {
        service.softDeleteUser(userId);
    }

    @PutMapping("/users/{userId}/role")
    public AdminUserResponse updateRole(@PathVariable Long userId, @RequestBody UpdateRoleRequest request) {
        return service.updateUserRole(userId, request.getRole());
    }

    @GetMapping("/settings")
    public AdminSettingResponse getSettings() {
        return service.getSettings();
    }

    @PutMapping("/settings")
    public AdminSettingResponse updateSettings(@RequestBody AdminSettingRequest request) {
        return service.saveSettings(request);
    }

    @GetMapping("/roles")
    public List<RolePermissionResponse> roles() {
        return service.getRolePermissions();
    }

    @PutMapping("/roles")
    public RolePermissionResponse updateRoles(@RequestBody RolePermissionRequest request) {
        return service.saveRolePermissions(request);
    }

    @GetMapping("/course-metrics")
    public List<CourseMetricResponse> courseMetrics(@RequestParam List<String> courseIds) {
        return service.getCourseMetrics(courseIds);
    }
}

