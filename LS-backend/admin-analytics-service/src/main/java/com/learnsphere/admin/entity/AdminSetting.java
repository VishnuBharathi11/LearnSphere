package com.learnsphere.admin.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "admin_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminSetting {

    @Id
    private Long id;

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

    private Instant updatedAt;
}

