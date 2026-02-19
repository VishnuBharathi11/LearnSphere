package com.learnsphere.enrollment.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.learnsphere.enrollment.entity.Payment;

public interface PaymentRepository extends JpaRepository<Payment,Long>{
	Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);
}
