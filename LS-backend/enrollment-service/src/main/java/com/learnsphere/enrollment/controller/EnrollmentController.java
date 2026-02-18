package com.learnsphere.enrollment.controller;

import org.springframework.web.bind.annotation.*;

import com.learnsphere.enrollment.dto.CreateOrderRequest;
import com.learnsphere.enrollment.dto.EnrollmentResponse;
import com.learnsphere.enrollment.dto.VerifyPaymentRequest;
import com.learnsphere.enrollment.service.EnrollmentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {
	private final EnrollmentService enrollmentService;
	@PostMapping("/order")
	public String createOrder(@Valid @RequestBody CreateOrderRequest request) {
		return enrollmentService.createOrder(request);
	}
	@PostMapping("/verify")
	public EnrollmentResponse verifyPayment(@Valid @RequestBody VerifyPaymentRequest request) {
		return enrollmentService.verifyPayment(request);
	}

}
