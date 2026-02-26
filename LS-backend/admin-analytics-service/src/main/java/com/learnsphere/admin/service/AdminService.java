package com.learnsphere.admin.service;

import com.learnsphere.admin.dto.DashboardResponse;
import com.learnsphere.admin.dto.*;

import java.util.List;

public interface AdminService {

    DashboardResponse getDashboard();
    List<AdminUserResponse> getUsers();
    AdminUserResponse setUserSuspended(Long userId, boolean suspended);
    void softDeleteUser(Long userId);
    AdminUserResponse updateUserRole(Long userId, String role);
    AdminSettingResponse getSettings();
    AdminSettingResponse saveSettings(AdminSettingRequest request);
    List<RolePermissionResponse> getRolePermissions();
    RolePermissionResponse saveRolePermissions(RolePermissionRequest request);
    List<CourseMetricResponse> getCourseMetrics(List<String> courseIds);
}
