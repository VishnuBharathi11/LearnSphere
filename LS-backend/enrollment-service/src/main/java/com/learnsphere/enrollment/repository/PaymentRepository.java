package com.learnsphere.enrollment.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.learnsphere.enrollment.entity.Payment;
import com.learnsphere.enrollment.enums.PaymentStatus;

public interface PaymentRepository extends JpaRepository<Payment,Long>{
	Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);
	List<Payment> findByCourseIdInAndStatus(List<String> courseIds, PaymentStatus status);
}
