package com.learnsphere.enrollment.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;


import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.learnsphere.enrollment.client.CourseClient;
import com.learnsphere.enrollment.config.RazorpayConfig;
import com.learnsphere.enrollment.dto.*;
import com.learnsphere.enrollment.repository.*;
import com.learnsphere.enrollment.entity.Enrollment;
import com.learnsphere.enrollment.entity.Payment;
import com.learnsphere.enrollment.entity.WithdrawalRequest;
import com.learnsphere.enrollment.enums.EnrollmentStatus;
import com.learnsphere.enrollment.enums.PaymentStatus;
import com.learnsphere.enrollment.enums.WithdrawalStatus;
import com.learnsphere.enrollment.service.EnrollmentService;
import com.razorpay.*;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EnrollmentServiceImpl implements EnrollmentService{
	
	private final RazorpayClient razorpayClient;
	private final PaymentRepository paymentRepository;
	private final EnrollmentRepository enrollmentRepository;
	private final WithdrawalRequestRepository withdrawalRequestRepository;
	private final CourseClient courseClient;
	private final RazorpayConfig razorpayConfig;
	@Value("${withdrawal.instructor-share-percent:80}")
	private int instructorSharePercent;
	@Value("${withdrawal.minimum-amount:500}")
	private BigDecimal minimumWithdrawalAmount;

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

	@Override
	public WithdrawalSummaryResponse getWithdrawalSummary(String instructorId, List<String> courseIds) {
		List<String> safeCourseIds = normalizeCourseIds(courseIds);
		BigDecimal grossRevenue = calculateGrossRevenue(safeCourseIds);
		BigDecimal netEarnings = percent(grossRevenue, safeInstructorSharePercent());
		BigDecimal platformFee = grossRevenue.subtract(netEarnings).setScale(2, RoundingMode.HALF_UP);

		List<WithdrawalRequest> withdrawals = withdrawalRequestRepository.findByInstructorId(safeInstructorId(instructorId));
		BigDecimal pending = sumWithdrawals(withdrawals, Set.of(
				WithdrawalStatus.PENDING,
				WithdrawalStatus.APPROVED,
				WithdrawalStatus.PROCESSING
		));
		BigDecimal paid = sumWithdrawals(withdrawals, Set.of(WithdrawalStatus.PAID));
		BigDecimal available = netEarnings.subtract(pending).subtract(paid).max(BigDecimal.ZERO)
				.setScale(2, RoundingMode.HALF_UP);

		return WithdrawalSummaryResponse.builder()
				.instructorId(safeInstructorId(instructorId))
				.currency("INR")
				.grossRevenue(grossRevenue)
				.platformFee(platformFee)
				.netEarnings(netEarnings)
				.pendingWithdrawal(pending)
				.totalWithdrawn(paid)
				.availableBalance(available)
				.minimumWithdrawal(scaled(minimumWithdrawalAmount))
				.instructorSharePercent(safeInstructorSharePercent())
				.build();
	}

	@Override
	public List<WithdrawalResponse> getWithdrawals(String instructorId, int limit) {
		int safeLimit = Math.max(1, Math.min(limit, 100));
		return withdrawalRequestRepository
				.findByInstructorIdOrderByRequestedAtDesc(safeInstructorId(instructorId), PageRequest.of(0, safeLimit))
				.stream()
				.map(this::toWithdrawalResponse)
				.toList();
	}

	@Override
	public WithdrawalResponse requestWithdrawal(String instructorId, WithdrawalRequestDto request) {
		String safeInstructorId = safeInstructorId(instructorId);
		List<String> safeCourseIds = normalizeCourseIds(request.getCourseIds());
		BigDecimal amount = scaled(request.getAmount());
		BigDecimal minimum = scaled(minimumWithdrawalAmount);
		if (amount.compareTo(minimum) < 0) {
			throw new RuntimeException("Minimum withdrawal amount is INR " + minimum.stripTrailingZeros().toPlainString());
		}

		String payoutMethod = safeText(request.getPayoutMethod()).toUpperCase();
		if (!Set.of("BANK", "UPI").contains(payoutMethod)) {
			throw new RuntimeException("Unsupported payout method");
		}
		if ("BANK".equals(payoutMethod)) {
			if (safeText(request.getAccountHolderName()).isBlank()
					|| safeText(request.getBankName()).isBlank()
					|| safeText(request.getAccountNumber()).isBlank()
					|| safeText(request.getIfscCode()).isBlank()) {
				throw new RuntimeException("Bank payout details are required");
			}
		}
		if ("UPI".equals(payoutMethod) && safeText(request.getUpiId()).isBlank()) {
			throw new RuntimeException("UPI ID is required");
		}

		BigDecimal available = getWithdrawalSummary(safeInstructorId, safeCourseIds).getAvailableBalance();
		if (amount.compareTo(available) > 0) {
			throw new RuntimeException("Withdrawal amount exceeds available balance");
		}

		WithdrawalRequest withdrawal = WithdrawalRequest.builder()
				.instructorId(safeInstructorId)
				.amount(amount)
				.currency("INR")
				.payoutMethod(payoutMethod)
				.accountHolderName(safeText(request.getAccountHolderName()))
				.bankName(safeText(request.getBankName()))
				.accountNumber(maskUnsafeSpacing(request.getAccountNumber()))
				.ifscCode(safeText(request.getIfscCode()).toUpperCase())
				.upiId(safeText(request.getUpiId()))
				.note(safeText(request.getNote()))
				.courseIds(String.join(",", safeCourseIds))
				.status(WithdrawalStatus.PENDING)
				.requestedAt(Instant.now())
				.updatedAt(Instant.now())
				.build();

		return toWithdrawalResponse(withdrawalRequestRepository.save(withdrawal));
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

	private List<String> normalizeCourseIds(List<String> courseIds) {
		if (courseIds == null) {
			return List.of();
		}
		return courseIds.stream()
				.map(this::safeText)
				.filter(value -> !value.isBlank())
				.distinct()
				.collect(Collectors.toCollection(ArrayList::new));
	}

	private BigDecimal calculateGrossRevenue(List<String> courseIds) {
		if (courseIds == null || courseIds.isEmpty()) {
			return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
		}
		return paymentRepository.findByCourseIdInAndStatus(courseIds, PaymentStatus.SUCCESS)
				.stream()
				.map(payment -> BigDecimal.valueOf(payment.getAmount() == null ? 0 : payment.getAmount()))
				.reduce(BigDecimal.ZERO, BigDecimal::add)
				.setScale(2, RoundingMode.HALF_UP);
	}

	private BigDecimal sumWithdrawals(List<WithdrawalRequest> withdrawals, Set<WithdrawalStatus> statuses) {
		return withdrawals.stream()
				.filter(withdrawal -> statuses.contains(withdrawal.getStatus()))
				.map(WithdrawalRequest::getAmount)
				.reduce(BigDecimal.ZERO, BigDecimal::add)
				.setScale(2, RoundingMode.HALF_UP);
	}

	private WithdrawalResponse toWithdrawalResponse(WithdrawalRequest withdrawal) {
		return WithdrawalResponse.builder()
				.id(withdrawal.getId())
				.amount(scaled(withdrawal.getAmount()))
				.currency(withdrawal.getCurrency())
				.payoutMethod(withdrawal.getPayoutMethod())
				.accountHolderName(withdrawal.getAccountHolderName())
				.bankName(withdrawal.getBankName())
				.accountNumber(maskAccountNumber(withdrawal.getAccountNumber()))
				.ifscCode(withdrawal.getIfscCode())
				.upiId(withdrawal.getUpiId())
				.note(withdrawal.getNote())
				.status(withdrawal.getStatus())
				.requestedAt(withdrawal.getRequestedAt())
				.updatedAt(withdrawal.getUpdatedAt())
				.build();
	}

	private BigDecimal percent(BigDecimal amount, int percent) {
		return amount.multiply(BigDecimal.valueOf(percent))
				.divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
	}

	private BigDecimal scaled(BigDecimal amount) {
		return (amount == null ? BigDecimal.ZERO : amount).setScale(2, RoundingMode.HALF_UP);
	}

	private int safeInstructorSharePercent() {
		return Math.max(1, Math.min(instructorSharePercent, 100));
	}

	private String safeInstructorId(String instructorId) {
		String safe = safeText(instructorId);
		if (safe.isBlank()) {
			throw new RuntimeException("Instructor ID is required");
		}
		return safe;
	}

	private String safeText(String value) {
		return value == null ? "" : value.trim();
	}

	private String maskUnsafeSpacing(String value) {
		return safeText(value).replaceAll("\\s+", "");
	}

	private String maskAccountNumber(String accountNumber) {
		String safe = maskUnsafeSpacing(accountNumber);
		if (safe.length() <= 4) {
			return safe;
		}
		return "****" + safe.substring(safe.length() - 4);
	}
}
