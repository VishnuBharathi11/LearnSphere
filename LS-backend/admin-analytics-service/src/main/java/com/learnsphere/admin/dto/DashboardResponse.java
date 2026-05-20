package com.learnsphere.admin.dto;

import lombok.*;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private long activeLearners;
    private long activeInstructors;
    private long totalActiveUsers;
    private long totalEnrollments;
    private double grossRevenue;
    private double platformRevenue;
    private double platformFeePercent;
    private List<UserGrowthPoint> userGrowth;
    private List<RevenueTrendPoint> revenueTrend;
    private List<PendingTask> pendingTasks;
    private List<RecentActivity> recentActivity;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserGrowthPoint {
        private String month;
        private long registrations;
        private long logins;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueTrendPoint {
        private String month;
        private long enrollments;
        private double grossRevenue;
        private double commissionRevenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PendingTask {
        private String text;
        private String priority;
        private long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentActivity {
        private String type;
        private String message;
        private Instant timestamp;
    }
}

