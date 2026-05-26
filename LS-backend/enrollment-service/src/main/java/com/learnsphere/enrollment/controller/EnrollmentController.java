package com.learnsphere.enrollment.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;

import com.learnsphere.enrollment.dto.CreateOrderRequest;
import com.learnsphere.enrollment.dto.EnrollmentResponse;
import com.learnsphere.enrollment.dto.FreeEnrollRequest;
import com.learnsphere.enrollment.dto.VerifyPaymentRequest;
import com.learnsphere.enrollment.dto.WithdrawalRequestDto;
import com.learnsphere.enrollment.dto.WithdrawalResponse;
import com.learnsphere.enrollment.dto.WithdrawalSummaryResponse;
import com.learnsphere.enrollment.entity.Enrollment;
import com.learnsphere.enrollment.service.EnrollmentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {
	private final EnrollmentService enrollmentService;
	@Value("${razorpay.key}")
	private String razorpayKey;

	@GetMapping("/payment-key")
	public Map<String, String> getPaymentKey() {
		return Map.of("key", razorpayKey);
	}

	@PostMapping("/order")
	public String createOrder(@Valid @RequestBody CreateOrderRequest request) {
		return enrollmentService.createOrder(request);
	}
	@PostMapping("/verify")
	public EnrollmentResponse verifyPayment(@Valid @RequestBody VerifyPaymentRequest request) {
		return enrollmentService.verifyPayment(request);
	}

	@PostMapping("/free")
	public EnrollmentResponse enrollFree(@Valid @RequestBody FreeEnrollRequest request) {
		return enrollmentService.enrollFree(request);
	}

	@GetMapping("/status")
	public boolean isEnrolled(@RequestParam String userId,@RequestParam String courseId) {
		return enrollmentService.isEnrolled(userId, courseId);
	}

	@GetMapping("/course/{courseId}")
	public List<Enrollment> byCourse(@PathVariable String courseId) {
		return enrollmentService.getByCourseId(courseId);
	}

	@GetMapping("/courses")
	public List<Enrollment> byCourses(@RequestParam List<String> courseIds) {
		return enrollmentService.getByCourseIds(courseIds);
	}

	@GetMapping("/user/{userId}")
	public List<Enrollment> byUser(@PathVariable String userId) {
		return enrollmentService.getByUserId(userId);
	}

	@GetMapping("/instructor/{instructorId}/withdrawals/summary")
	public WithdrawalSummaryResponse withdrawalSummary(
			@PathVariable String instructorId,
			@RequestParam(required = false) List<String> courseIds) {
		return enrollmentService.getWithdrawalSummary(instructorId, courseIds);
	}

	@GetMapping("/instructor/{instructorId}/withdrawals")
	public List<WithdrawalResponse> withdrawals(
			@PathVariable String instructorId,
			@RequestParam(defaultValue = "20") int limit) {
		return enrollmentService.getWithdrawals(instructorId, limit);
	}

	@PostMapping("/instructor/{instructorId}/withdrawals")
	public WithdrawalResponse requestWithdrawal(
			@PathVariable String instructorId,
			@Valid @RequestBody WithdrawalRequestDto request) {
		return enrollmentService.requestWithdrawal(instructorId, request);
	}
}
