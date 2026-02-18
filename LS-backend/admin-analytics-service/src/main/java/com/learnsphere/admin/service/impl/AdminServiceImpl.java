package com.learnsphere.admin.service.impl;

import com.learnsphere.admin.dto.DashboardResponse;
import com.learnsphere.admin.entity.CourseStats;
import com.learnsphere.admin.entity.PaymentStats;
import com.learnsphere.admin.entity.UserStats;
import com.learnsphere.admin.repository.CourseStatsRepository;
import com.learnsphere.admin.repository.PaymentStatsRepository;
import com.learnsphere.admin.repository.UserStatsRepository;
import com.learnsphere.admin.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserStatsRepository userRepo;
    private final CourseStatsRepository courseRepo;
    private final PaymentStatsRepository paymentRepo;

    @Override
    public DashboardResponse getDashboard() {

        UserStats users = userRepo.findAll().stream().findFirst().orElse(new UserStats());
        CourseStats courses = courseRepo.findAll().stream().findFirst().orElse(new CourseStats());
        PaymentStats payments = paymentRepo.findAll().stream().findFirst().orElse(new PaymentStats());

        return DashboardResponse.builder()
                .totalUsers(users.getTotalUsers())
                .totalCourses(courses.getTotalCourses())
                .publishedCourses(courses.getPublishedCourses())
                .pendingCourses(courses.getPendingCourses())
                .totalEnrollments(payments.getTotalEnrollments())
                .totalRevenue(payments.getTotalRevenue())
                .build();
    }
}
