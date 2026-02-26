package com.learnsphere.admin.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminSettingResponse {
    private String siteName;
    private String siteEmail;
    private String supportEmail;
    private Double platformFeePercent;
    private Integer minCoursePrice;
    private Integer maxCoursePrice;
    private Boolean userRegistration;
    private Boolean emailVerification;
    private Boolean courseReviews;
    private Boolean discussions;
    private Boolean autoApproveInstructors;
    private Boolean autoApproveCourses;
    private Boolean guestBrowsing;
    private Boolean maintenanceMode;
}

