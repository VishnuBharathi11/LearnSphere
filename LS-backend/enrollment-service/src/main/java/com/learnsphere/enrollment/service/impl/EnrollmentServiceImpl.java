package com.learnsphere.enrollment.service.impl;

import java.time.Instant;
import java.util.List;


import org.json.JSONObject;
import org.springframework.stereotype.Service;

import com.learnsphere.enrollment.client.CourseClient;
import com.learnsphere.enrollment.config.RazorpayConfig;
import com.learnsphere.enrollment.dto.*;
import com.learnsphere.enrollment.repository.*;
import com.learnsphere.enrollment.entity.Enrollment;
import com.learnsphere.enrollment.entity.Payment;
import com.learnsphere.enrollment.enums.EnrollmentStatus;
import com.learnsphere.enrollment.enums.PaymentStatus;
import com.learnsphere.enrollment.service.EnrollmentService;
import com.razorpay.*;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EnrollmentServiceImpl implements EnrollmentService{
	
	private final RazorpayClient razorpayClient;
	private final PaymentRepository paymentRepository;
	private final EnrollmentRepository enrollmentRepository;
	private final CourseClient courseClient;
	private final RazorpayConfig razorpayConfig;

	@Override
	public String createOrder(CreateOrderRequest request) {
		try {
			Integer price = null;
			try {
				price = courseClient.getCoursePrice(request.getCourseId());
			} catch (Exception ignored) {
				price = request.getAmount();
			}
			if (price == null || price <= 0) {
				throw new RuntimeException("Invalid course price for payment");
			}
			JSONObject orderReq= new JSONObject();
			orderReq.put("amount", price*100);
			orderReq.put("currency", "INR");
			orderReq.put("receipt","rcpt_"+System.currentTimeMillis());
			Order order=razorpayClient.orders.create(orderReq);
			
			Payment payment=Payment.builder()
					.userId(request.getUserId())
					.courseId(request.getCourseId())
					.razorpayOrderId(order.get("id"))
					.amount(price)
					.currency("INR")
					.status(PaymentStatus.CREATED)
					.createdAt(Instant.now())
					.build();
			paymentRepository.save(payment);
			return order.get("id");
			
		} catch (Exception e) {
			throw new RuntimeException("Failed to create razorpay order: " + e.getMessage());
		}
	}
	@Override
	public EnrollmentResponse verifyPayment(VerifyPaymentRequest request) {
		Payment payment=paymentRepository
				.findByRazorpayOrderId(request.getRazorpayOrderId())
				.orElseThrow(()->new RuntimeException("Payment not found"));
		try {
			String payload=request.getRazorpayOrderId()+"|"+request.getRazorpayPaymentId();
			String generatedSignature=hmacSHA256(payload,razorpayConfig.getSecret());
			if (!generatedSignature.equals(request.getRazorpaySignature())) {
				payment.setStatus(PaymentStatus.FAILED);
				paymentRepository.save(payment);
				throw new RuntimeException("Invalid payment signature");
			}
			payment.setStatus(PaymentStatus.SUCCESS);
			payment.setRazorpaymentId(request.getRazorpayPaymentId());
			paymentRepository.save(payment);

			Enrollment enrollment = enrollmentRepository
					.findByUserIdAndCourseId(payment.getUserId(), request.getCourseId())
					.orElseGet(() -> Enrollment.builder()
							.userId(payment.getUserId())
							.courseId(request.getCourseId())
							.status(EnrollmentStatus.ACTIVE)
							.enrolledAt(Instant.now())
							.build());
			enrollment.setStatus(EnrollmentStatus.ACTIVE);
			if (enrollment.getEnrolledAt() == null) {
				enrollment.setEnrolledAt(Instant.now());
			}
			enrollmentRepository.save(enrollment);
			return EnrollmentResponse.builder()
					.message("Enrollment Successful")
					.enrollmentId(enrollment.getId())
					.build();
		} catch (Exception e) {
			throw new RuntimeException("Payment verification failed");
		}
	}

	@Override
	public EnrollmentResponse enrollFree(FreeEnrollRequest request) {
		Enrollment existing = enrollmentRepository
				.findByUserIdAndCourseId(request.getUserId(), request.getCourseId())
				.orElse(null);
		if (existing != null && existing.getStatus() == EnrollmentStatus.ACTIVE) {
			return EnrollmentResponse.builder()
					.message("Already enrolled")
					.enrollmentId(existing.getId())
					.build();
		}

		Enrollment enrollment = existing != null ? existing : Enrollment.builder()
				.userId(request.getUserId())
				.courseId(request.getCourseId())
				.enrolledAt(Instant.now())
				.build();
		enrollment.setStatus(EnrollmentStatus.ACTIVE);
		if (enrollment.getEnrolledAt() == null) {
			enrollment.setEnrolledAt(Instant.now());
		}
		enrollmentRepository.save(enrollment);

		return EnrollmentResponse.builder()
				.message("Enrollment Successful")
				.enrollmentId(enrollment.getId())
				.build();
	}

	@Override
	public boolean isEnrolled(String userId, String courseId) {
		return enrollmentRepository
				.findByUserIdAndCourseId(userId, courseId)
				.map(e -> e.getStatus() == EnrollmentStatus.ACTIVE)
				.orElse(false);
	}

	@Override
	public List<Enrollment> getByCourseId(String courseId) {
		return enrollmentRepository.findByCourseId(courseId);
	}

	@Override
	public List<Enrollment> getByCourseIds(List<String> courseIds) {
		if (courseIds == null || courseIds.isEmpty()) {
			return List.of();
		}
		return enrollmentRepository.findByCourseIdIn(courseIds);
	}

	@Override
	public List<Enrollment> getByUserId(String userId) {
		if (userId == null || userId.isBlank()) {
			return List.of();
		}
		return enrollmentRepository.findByUserId(userId.trim());
	}

	private String hmacSHA256(String data,String secret) throws Exception{
		javax.crypto.Mac mac=javax.crypto.Mac.getInstance("HmacSHA256");
		javax.crypto.spec.SecretKeySpec secretKey=
				new javax.crypto.spec.SecretKeySpec(secret.getBytes(),"HmacSHA256");
		mac.init(secretKey);
		byte[] hash=mac.doFinal(data.getBytes());
		StringBuilder hexString = new StringBuilder();
		for (byte b : hash) {
			hexString.append(String.format("%02x", b));
		}
		return hexString.toString();
	}
}
