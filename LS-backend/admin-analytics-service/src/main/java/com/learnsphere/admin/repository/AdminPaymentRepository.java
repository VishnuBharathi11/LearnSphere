package com.learnsphere.admin.repository;

import com.learnsphere.admin.entity.AdminPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface AdminPaymentRepository extends JpaRepository<AdminPayment, Long> {
    List<AdminPayment> findByCreatedAtAfter(Instant from);
    List<AdminPayment> findByCourseIdIn(List<String> courseIds);
}

