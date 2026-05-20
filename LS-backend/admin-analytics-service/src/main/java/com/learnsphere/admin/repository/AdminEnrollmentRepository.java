package com.learnsphere.admin.repository;

import com.learnsphere.admin.entity.AdminEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface AdminEnrollmentRepository extends JpaRepository<AdminEnrollment, Long> {
    List<AdminEnrollment> findByEnrolledAtAfter(Instant from);
    List<AdminEnrollment> findByCourseIdIn(List<String> courseIds);
}

