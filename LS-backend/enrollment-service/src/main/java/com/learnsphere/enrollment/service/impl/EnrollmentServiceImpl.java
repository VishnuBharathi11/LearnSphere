package com.learnsphere.enrollment.service.impl;

import java.time.Instant;


import org.json.JSONObject;
import org.springframework.stereotype.Service;

import com.learnsphere.enrollment.client.CourseClient;
import com.learnsphere.enrollment.config.RazorpayConfig;
import com.learnsphere.enrollment.dto.*;
import com.learnsphere.enrollment.repository.*;
import com.learnsphere.enrollment.entity.*;
import com.learnsphere.enrollment.entity.Payment;
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
			Integer price=courseClient.getCoursePrice(request.getCourseId());
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
			throw new RuntimeException("Failed to create razorpay order");
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
			
			Enrollment enrollment=Enrollment.builder()
					.userId(payment.getUserId())
					.courseId(request.getCourseId())
					.status(EnrollmentStatus.ACTIVE)
					.enrolledAt(Instant.now())
					.build();
			enrollmentRepository.save(enrollment);
			return EnrollmentResponse.builder()
					.message("Enrollment Successful")
					.enrollmentId(enrollment.getId())
					.build();
		} catch (Exception e) {
			throw new RuntimeException("Payment verification failed");
		}
	}
	private String hmacSHA256(String data,String secret) throws Exception{
		javax.crypto.Mac mac=javax.crypto.Mac.getInstance("HmacSHA256");
		javax.crypto.spec.SecretKeySpec secretKey=
				new javax.crypto.spec.SecretKeySpec(secret.getBytes(),"HmacSH256");
		mac.init(secretKey);
		byte[] hash=mac.doFinal(data.getBytes());
		return java.util.Base64.getEncoder().encodeToString(hash);
	}
}
