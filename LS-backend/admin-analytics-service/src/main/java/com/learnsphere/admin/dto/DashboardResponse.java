package com.learnsphere.admin.dto;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardResponse {

    private Long totalUsers;
    private Long totalCourses;
    private Long publishedCourses;
    private Long pendingCourses;
    private Long totalEnrollments;
    private Double totalRevenue;
}
