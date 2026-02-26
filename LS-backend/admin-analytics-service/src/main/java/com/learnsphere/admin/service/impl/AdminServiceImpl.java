package com.learnsphere.admin.service.impl;

import com.learnsphere.admin.dto.*;
import com.learnsphere.admin.entity.*;
import com.learnsphere.admin.repository.*;
import com.learnsphere.admin.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.TextStyle;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final AdminUserRepository userRepo;
    private final AdminEnrollmentRepository enrollmentRepo;
    private final AdminPaymentRepository paymentRepo;
    private final AdminSettingRepository settingRepo;
    private final RolePermissionRepository rolePermissionRepo;
    private final JavaMailSender mailSender;
    private static final Pattern PERM_SPLIT = Pattern.compile("\\s*\\|\\|\\s*");

    @Value("${app.mail.from:LearnSphere}")
    private String fromMail;

    @Override
    public DashboardResponse getDashboard() {
        AdminSetting settings = getOrCreateSettings();
        double feePercent = settings.getPlatformFeePercent() == null ? 15.0 : settings.getPlatformFeePercent();

        List<AdminUser> users = userRepo.findByDeletedAtIsNull();
        List<AdminEnrollment> enrollments = enrollmentRepo.findAll();
        List<AdminPayment> payments = paymentRepo.findAll();

        List<AdminUser> activeUsers = users.stream()
                .filter(user -> Boolean.TRUE.equals(user.getActive()) && !Boolean.TRUE.equals(user.getSuspended()))
                .toList();

        long activeLearners = activeUsers.stream()
                .filter(user -> "learner".equalsIgnoreCase(user.getRole()))
                .count();
        long activeInstructors = activeUsers.stream()
                .filter(user -> "instructor".equalsIgnoreCase(user.getRole()))
                .count();

        List<AdminPayment> successPayments = payments.stream()
                .filter(payment -> "SUCCESS".equalsIgnoreCase(payment.getStatus()))
                .toList();

        double grossRevenue = successPayments.stream()
                .mapToDouble(payment -> safeAmount(payment.getAmount()))
                .sum();
        double platformRevenue = grossRevenue * (feePercent / 100.0);

        List<DashboardResponse.UserGrowthPoint> userGrowth = buildUserGrowth(users);
        List<DashboardResponse.RevenueTrendPoint> revenueTrend = buildRevenueTrend(successPayments, enrollments, feePercent);
        List<DashboardResponse.PendingTask> pendingTasks = buildPendingTasks(users);
        List<DashboardResponse.RecentActivity> recentActivities = buildRecentActivities(users, enrollments, successPayments);

        return DashboardResponse.builder()
                .activeLearners(activeLearners)
                .activeInstructors(activeInstructors)
                .totalActiveUsers(activeUsers.size())
                .totalEnrollments(enrollments.size())
                .grossRevenue(round(grossRevenue))
                .platformRevenue(round(platformRevenue))
                .platformFeePercent(round(feePercent))
                .userGrowth(userGrowth)
                .revenueTrend(revenueTrend)
                .pendingTasks(pendingTasks)
                .recentActivity(recentActivities)
                .build();
    }

    @Override
    public List<AdminUserResponse> getUsers() {
        return userRepo.findByDeletedAtIsNull().stream()
                .sorted(Comparator.comparing(AdminUser::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .map(this::toUserResponse)
                .toList();
    }

    @Override
    @Transactional
    public AdminUserResponse setUserSuspended(Long userId, boolean suspended) {
        AdminUser user = getUser(userId);
        if ("admin".equalsIgnoreCase(user.getRole())) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Admin account cannot be suspended.");
        }
        user.setSuspended(suspended);
        user.setActive(!suspended);
        AdminUser saved = userRepo.save(user);
        sendMail(saved.getEmail(),
                suspended ? "Account Suspended" : "Account Reactivated",
                suspended
                        ? "Your LearnSphere account was suspended by admin."
                        : "Your LearnSphere account is active again.");
        return toUserResponse(saved);
    }

    @Override
    @Transactional
    public void softDeleteUser(Long userId) {
        AdminUser user = getUser(userId);
        if ("admin".equalsIgnoreCase(user.getRole())) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Admin account cannot be deleted.");
        }
        user.setActive(false);
        user.setSuspended(true);
        user.setDeletedAt(Instant.now());
        userRepo.save(user);
        sendMail(user.getEmail(), "Account Removed", "Your LearnSphere account has been removed by admin.");
    }

    @Override
    @Transactional
    public AdminUserResponse updateUserRole(Long userId, String role) {
        AdminUser user = getUser(userId);
        if (role == null || role.isBlank()) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Role is required.");
        }
        String safeRole = role.trim().toLowerCase();
        if (!Set.of("learner", "instructor", "admin").contains(safeRole)) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Invalid role.");
        }
        user.setRole(safeRole);
        AdminUser saved = userRepo.save(user);
        sendMail(saved.getEmail(), "Role Updated", "Your role was changed to " + safeRole + ".");
        return toUserResponse(saved);
    }

    @Override
    public AdminSettingResponse getSettings() {
        return toSettingResponse(getOrCreateSettings());
    }

    @Override
    @Transactional
    public AdminSettingResponse saveSettings(AdminSettingRequest request) {
        AdminSetting setting = getOrCreateSettings();
        setting.setSiteName(defaultString(request.getSiteName(), setting.getSiteName()));
        setting.setSiteEmail(defaultString(request.getSiteEmail(), setting.getSiteEmail()));
        setting.setSupportEmail(defaultString(request.getSupportEmail(), setting.getSupportEmail()));
        setting.setPlatformFeePercent(request.getPlatformFeePercent() == null ? setting.getPlatformFeePercent() : request.getPlatformFeePercent());
        setting.setMinCoursePrice(request.getMinCoursePrice() == null ? setting.getMinCoursePrice() : request.getMinCoursePrice());
        setting.setMaxCoursePrice(request.getMaxCoursePrice() == null ? setting.getMaxCoursePrice() : request.getMaxCoursePrice());
        setting.setUserRegistration(booleanOrDefault(request.getUserRegistration(), setting.getUserRegistration()));
        setting.setEmailVerification(booleanOrDefault(request.getEmailVerification(), setting.getEmailVerification()));
        setting.setCourseReviews(booleanOrDefault(request.getCourseReviews(), setting.getCourseReviews()));
        setting.setDiscussions(booleanOrDefault(request.getDiscussions(), setting.getDiscussions()));
        setting.setAutoApproveInstructors(booleanOrDefault(request.getAutoApproveInstructors(), setting.getAutoApproveInstructors()));
        setting.setAutoApproveCourses(booleanOrDefault(request.getAutoApproveCourses(), setting.getAutoApproveCourses()));
        setting.setGuestBrowsing(booleanOrDefault(request.getGuestBrowsing(), setting.getGuestBrowsing()));
        setting.setMaintenanceMode(booleanOrDefault(request.getMaintenanceMode(), setting.getMaintenanceMode()));
        setting.setUpdatedAt(Instant.now());
        return toSettingResponse(settingRepo.save(setting));
    }

    @Override
    public List<RolePermissionResponse> getRolePermissions() {
        ensureDefaultRolePermissions();

        Map<String, Long> usersByRole = userRepo.findByDeletedAtIsNull().stream()
                .collect(Collectors.groupingBy(
                        user -> String.valueOf(user.getRole()).toLowerCase(),
                        Collectors.counting()
                ));

        return rolePermissionRepo.findAll().stream()
                .map(rolePermission -> RolePermissionResponse.builder()
                        .role(rolePermission.getRole())
                        .permissions(parsePermissions(rolePermission.getPermissionsJson()))
                        .users(usersByRole.getOrDefault(String.valueOf(rolePermission.getRole()).toLowerCase(), 0L))
                        .build())
                .sorted(Comparator.comparing(RolePermissionResponse::getRole))
                .toList();
    }

    @Override
    @Transactional
    public RolePermissionResponse saveRolePermissions(RolePermissionRequest request) {
        if (request.getRole() == null || request.getRole().isBlank()) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Role is required.");
        }
        String role = request.getRole().trim().toLowerCase();
        RolePermission rolePermission = rolePermissionRepo.findByRole(role)
                .orElse(RolePermission.builder().role(role).build());
        rolePermission.setPermissionsJson(writePermissions(request.getPermissions()));
        rolePermission.setUpdatedAt(Instant.now());
        RolePermission saved = rolePermissionRepo.save(rolePermission);
        long users = userRepo.findByDeletedAtIsNull().stream()
                .filter(user -> role.equalsIgnoreCase(user.getRole()))
                .count();
        return RolePermissionResponse.builder()
                .role(saved.getRole())
                .permissions(parsePermissions(saved.getPermissionsJson()))
                .users(users)
                .build();
    }

    @Override
    public List<CourseMetricResponse> getCourseMetrics(List<String> courseIds) {
        if (courseIds == null || courseIds.isEmpty()) {
            return List.of();
        }
        Set<String> safeIds = courseIds.stream().filter(Objects::nonNull).map(String::trim).filter(id -> !id.isBlank()).collect(Collectors.toSet());
        if (safeIds.isEmpty()) return List.of();

        AdminSetting settings = getOrCreateSettings();
        double feePercent = settings.getPlatformFeePercent() == null ? 15.0 : settings.getPlatformFeePercent();

        List<AdminEnrollment> enrollments = enrollmentRepo.findByCourseIdIn(new ArrayList<>(safeIds));
        List<AdminPayment> successPayments = paymentRepo.findByCourseIdIn(new ArrayList<>(safeIds)).stream()
                .filter(payment -> "SUCCESS".equalsIgnoreCase(payment.getStatus()))
                .toList();

        Map<String, Long> learnersByCourse = enrollments.stream()
                .collect(Collectors.groupingBy(AdminEnrollment::getCourseId, Collectors.counting()));

        Map<String, Double> revenueByCourse = successPayments.stream()
                .collect(Collectors.groupingBy(
                        AdminPayment::getCourseId,
                        Collectors.summingDouble(payment -> safeAmount(payment.getAmount()))
                ));

        return safeIds.stream()
                .map(courseId -> {
                    double gross = revenueByCourse.getOrDefault(courseId, 0.0);
                    return CourseMetricResponse.builder()
                            .courseId(courseId)
                            .learners(learnersByCourse.getOrDefault(courseId, 0L))
                            .grossRevenue(round(gross))
                            .platformRevenue(round(gross * (feePercent / 100.0)))
                            .build();
                })
                .toList();
    }

    private List<DashboardResponse.UserGrowthPoint> buildUserGrowth(List<AdminUser> users) {
        Map<String, DashboardResponse.UserGrowthPoint.UserGrowthPointBuilder> map = new LinkedHashMap<>();
        LocalDate now = LocalDate.now(ZoneOffset.UTC).withDayOfMonth(1);
        for (int i = 5; i >= 0; i--) {
            LocalDate monthStart = now.minusMonths(i);
            String month = monthStart.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            map.put(month, DashboardResponse.UserGrowthPoint.builder().month(month).registrations(0).logins(0));
        }

        users.forEach(user -> {
            if (user.getCreatedAt() != null) {
                String month = user.getCreatedAt().atZone(ZoneOffset.UTC).getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
                if (map.containsKey(month)) {
                    DashboardResponse.UserGrowthPoint.UserGrowthPointBuilder builder = map.get(month);
                    DashboardResponse.UserGrowthPoint existing = builder.build();
                    map.put(month, DashboardResponse.UserGrowthPoint.builder()
                            .month(month)
                            .registrations(existing.getRegistrations() + 1)
                            .logins(existing.getLogins()));
                }
            }
            if (user.getLastLoginAt() != null) {
                String month = user.getLastLoginAt().atZone(ZoneOffset.UTC).getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
                if (map.containsKey(month)) {
                    DashboardResponse.UserGrowthPoint.UserGrowthPointBuilder builder = map.get(month);
                    DashboardResponse.UserGrowthPoint existing = builder.build();
                    map.put(month, DashboardResponse.UserGrowthPoint.builder()
                            .month(month)
                            .registrations(existing.getRegistrations())
                            .logins(existing.getLogins() + 1));
                }
            }
        });

        return map.values().stream().map(DashboardResponse.UserGrowthPoint.UserGrowthPointBuilder::build).toList();
    }

    private List<DashboardResponse.RevenueTrendPoint> buildRevenueTrend(
            List<AdminPayment> payments,
            List<AdminEnrollment> enrollments,
            double feePercent
    ) {
        Map<String, Double> grossByMonth = new LinkedHashMap<>();
        Map<String, Long> enrollByMonth = new LinkedHashMap<>();
        LocalDate now = LocalDate.now(ZoneOffset.UTC).withDayOfMonth(1);
        for (int i = 5; i >= 0; i--) {
            LocalDate monthStart = now.minusMonths(i);
            String month = monthStart.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            grossByMonth.put(month, 0.0);
            enrollByMonth.put(month, 0L);
        }

        payments.forEach(payment -> {
            if (payment.getCreatedAt() == null) return;
            String month = payment.getCreatedAt().atZone(ZoneOffset.UTC).getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            if (!grossByMonth.containsKey(month)) return;
            grossByMonth.put(month, grossByMonth.get(month) + safeAmount(payment.getAmount()));
        });

        enrollments.forEach(enrollment -> {
            if (enrollment.getEnrolledAt() == null) return;
            String month = enrollment.getEnrolledAt().atZone(ZoneOffset.UTC).getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            if (!enrollByMonth.containsKey(month)) return;
            enrollByMonth.put(month, enrollByMonth.get(month) + 1);
        });

        return grossByMonth.keySet().stream()
                .map(month -> {
                    double gross = grossByMonth.get(month);
                    return DashboardResponse.RevenueTrendPoint.builder()
                            .month(month)
                            .enrollments(enrollByMonth.getOrDefault(month, 0L))
                            .grossRevenue(round(gross))
                            .commissionRevenue(round(gross * (feePercent / 100.0)))
                            .build();
                })
                .toList();
    }

    private List<DashboardResponse.PendingTask> buildPendingTasks(List<AdminUser> users) {
        long suspended = users.stream().filter(user -> Boolean.TRUE.equals(user.getSuspended())).count();
        long noLoginYet = users.stream()
                .filter(user -> user.getLastLoginAt() == null)
                .count();
        return List.of(
                DashboardResponse.PendingTask.builder()
                        .text("Suspended users need review")
                        .priority("high")
                        .count(suspended)
                        .build(),
                DashboardResponse.PendingTask.builder()
                        .text("New users not logged in yet")
                        .priority("medium")
                        .count(noLoginYet)
                        .build()
        );
    }

    private List<DashboardResponse.RecentActivity> buildRecentActivities(
            List<AdminUser> users,
            List<AdminEnrollment> enrollments,
            List<AdminPayment> payments
    ) {
        List<DashboardResponse.RecentActivity> activity = new ArrayList<>();

        users.stream()
                .filter(user -> user.getCreatedAt() != null)
                .sorted(Comparator.comparing(AdminUser::getCreatedAt).reversed())
                .limit(4)
                .forEach(user -> activity.add(DashboardResponse.RecentActivity.builder()
                        .type("registration")
                        .message("User registered: " + defaultString(user.getName(), user.getEmail()))
                        .timestamp(user.getCreatedAt())
                        .build()));

        users.stream()
                .filter(user -> user.getLastLoginAt() != null)
                .sorted(Comparator.comparing(AdminUser::getLastLoginAt).reversed())
                .limit(4)
                .forEach(user -> activity.add(DashboardResponse.RecentActivity.builder()
                        .type("login")
                        .message("User logged in: " + defaultString(user.getName(), user.getEmail()))
                        .timestamp(user.getLastLoginAt())
                        .build()));

        enrollments.stream()
                .filter(enrollment -> enrollment.getEnrolledAt() != null)
                .sorted(Comparator.comparing(AdminEnrollment::getEnrolledAt).reversed())
                .limit(4)
                .forEach(enrollment -> activity.add(DashboardResponse.RecentActivity.builder()
                        .type("enrollment")
                        .message("New enrollment in course " + enrollment.getCourseId())
                        .timestamp(enrollment.getEnrolledAt())
                        .build()));

        payments.stream()
                .filter(payment -> payment.getCreatedAt() != null)
                .sorted(Comparator.comparing(AdminPayment::getCreatedAt).reversed())
                .limit(4)
                .forEach(payment -> activity.add(DashboardResponse.RecentActivity.builder()
                        .type("payment")
                        .message("Payment success for course " + payment.getCourseId())
                        .timestamp(payment.getCreatedAt())
                        .build()));

        return activity.stream()
                .sorted(Comparator.comparing(DashboardResponse.RecentActivity::getTimestamp, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(10)
                .toList();
    }

    private AdminUser getUser(Long userId) {
        return userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));
    }

    private AdminUserResponse toUserResponse(AdminUser user) {
        String status;
        if (user.getDeletedAt() != null) {
            status = "deleted";
        } else if (Boolean.TRUE.equals(user.getSuspended())) {
            status = "suspended";
        } else {
            status = "active";
        }

        return AdminUserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .status(status)
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .build();
    }

    private AdminSetting getOrCreateSettings() {
        return settingRepo.findById(1L).orElseGet(() ->
                settingRepo.save(AdminSetting.builder()
                        .id(1L)
                        .siteName("LearnSphere")
                        .siteEmail("admin@learnsphere.com")
                        .supportEmail("support@learnsphere.com")
                        .platformFeePercent(15.0)
                        .minCoursePrice(299)
                        .maxCoursePrice(9999)
                        .userRegistration(true)
                        .emailVerification(true)
                        .courseReviews(true)
                        .discussions(true)
                        .autoApproveInstructors(false)
                        .autoApproveCourses(false)
                        .guestBrowsing(true)
                        .maintenanceMode(false)
                        .updatedAt(Instant.now())
                        .build())
        );
    }

    private AdminSettingResponse toSettingResponse(AdminSetting settings) {
        return AdminSettingResponse.builder()
                .siteName(settings.getSiteName())
                .siteEmail(settings.getSiteEmail())
                .supportEmail(settings.getSupportEmail())
                .platformFeePercent(settings.getPlatformFeePercent())
                .minCoursePrice(settings.getMinCoursePrice())
                .maxCoursePrice(settings.getMaxCoursePrice())
                .userRegistration(settings.getUserRegistration())
                .emailVerification(settings.getEmailVerification())
                .courseReviews(settings.getCourseReviews())
                .discussions(settings.getDiscussions())
                .autoApproveInstructors(settings.getAutoApproveInstructors())
                .autoApproveCourses(settings.getAutoApproveCourses())
                .guestBrowsing(settings.getGuestBrowsing())
                .maintenanceMode(settings.getMaintenanceMode())
                .build();
    }

    private List<String> parsePermissions(String permissionsJson) {
        if (permissionsJson == null || permissionsJson.isBlank()) return List.of();
        return Arrays.stream(PERM_SPLIT.split(permissionsJson))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .toList();
    }

    private void ensureDefaultRolePermissions() {
        if (rolePermissionRepo.count() > 0) return;
        saveRolePermissionsInternal("admin", List.of(
                "View Dashboard",
                "Manage Users",
                "Manage Courses",
                "Approve Courses",
                "Manage Categories",
                "Content Moderation",
                "Moderate Discussions",
                "View Reports",
                "System Settings",
                "Manage Roles"
        ));
        saveRolePermissionsInternal("instructor", List.of(
                "View Dashboard",
                "Manage Courses",
                "Create Courses",
                "Upload Lessons",
                "Create Quizzes",
                "View Student Progress",
                "Moderate Discussions"
        ));
        saveRolePermissionsInternal("learner", List.of("View Dashboard"));
    }

    private void saveRolePermissionsInternal(String role, List<String> permissions) {
        RolePermission rolePermission = RolePermission.builder()
                .role(role)
                .permissionsJson(writePermissions(permissions))
                .updatedAt(Instant.now())
                .build();
        rolePermissionRepo.save(rolePermission);
    }

    private String writePermissions(List<String> permissions) {
        if (permissions == null || permissions.isEmpty()) return "";
        return permissions.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .distinct()
                .collect(Collectors.joining("||"));
    }

    private void sendMail(String to, String subject, String text) {
        if (to == null || to.isBlank()) return;
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            if (fromMail != null && !fromMail.isBlank()) {
                message.setFrom(fromMail);
            }
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
        } catch (Exception ignored) {
        }
    }

    private String defaultString(String value, String fallback) {
        return (value == null || value.isBlank()) ? fallback : value;
    }

    private Boolean booleanOrDefault(Boolean value, Boolean fallback) {
        return value == null ? fallback : value;
    }

    private double safeAmount(Integer amount) {
        if (amount == null) return 0.0;
        return amount / 100.0;
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
