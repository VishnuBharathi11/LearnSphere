package com.learnsphere.enrollment.controller;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.learnsphere.enrollment.client.CourseClient;
import com.learnsphere.enrollment.client.CourseClient.CourseDto;
import com.learnsphere.enrollment.dto.InstructorFinancialsResponse;
import com.learnsphere.enrollment.dto.WithdrawalRequest;
import com.learnsphere.enrollment.entity.Enrollment;
import com.learnsphere.enrollment.entity.Withdrawal;
import com.learnsphere.enrollment.enums.EnrollmentStatus;
import com.learnsphere.enrollment.repository.EnrollmentRepository;
import com.learnsphere.enrollment.repository.WithdrawalRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class WithdrawalController {

	private final CourseClient courseClient;
	private final EnrollmentRepository enrollmentRepository;
	private final WithdrawalRepository withdrawalRepository;

	@GetMapping("/withdrawals/instructor/{userId}")
	public ResponseEntity<InstructorFinancialsResponse> getInstructorFinancials(
			@PathVariable String userId,
			@RequestHeader(value = "Authorization", required = false) String authorizationHeader
	) {
		FinancialSnapshot snapshot = buildFinancialSnapshot(userId, authorizationHeader);

		InstructorFinancialsResponse response = InstructorFinancialsResponse.builder()
				.totalEarnings(snapshot.totalEarnings())
				.totalWithdrawn(snapshot.totalWithdrawn())
				.totalPending(snapshot.totalPending())
				.availableBalance(snapshot.availableBalance())
				.withdrawals(snapshot.withdrawals())
				.build();

		return ResponseEntity.ok(response);
	}

	@PostMapping("/withdraw")
	public ResponseEntity<?> requestWithdrawal(
			@Valid @RequestBody WithdrawalRequest request,
			@RequestHeader(value = "Authorization", required = false) String authorizationHeader
	) {
		String userId = request.getUserId();
		int amount = request.getAmount();

		FinancialSnapshot snapshot = buildFinancialSnapshot(userId, authorizationHeader);

		// 2. Validations
		if (amount < 100) {
			return ResponseEntity.badRequest().body(java.util.Map.of("message", "Minimum withdrawal request is Rs 100."));
		}

		if (amount > snapshot.availableBalance()) {
			return ResponseEntity.badRequest().body(java.util.Map.of("message", "Insufficient balance. Maximum available is Rs " + snapshot.availableBalance()));
		}

		// Check if there is already an active pending request
		boolean hasPending = snapshot.withdrawals().stream().anyMatch(w -> "Pending".equalsIgnoreCase(w.getStatus()));
		if (hasPending) {
			return ResponseEntity.badRequest().body(java.util.Map.of("message", "You already have an active pending withdrawal request. Please wait for it to be processed."));
		}

		// 3. Generate Simulated Razorpay Payout ID
		String simulatedPayoutId = "pout_test_" + Math.abs(java.util.UUID.randomUUID().getMostSignificantBits());

		// 4. Save PENDING Withdrawal
		String rawAccount = request.getBankAccount();
		String maskedAccount = rawAccount.length() > 4 ? "********" + rawAccount.substring(rawAccount.length() - 4) : rawAccount;

		Withdrawal withdrawal = Withdrawal.builder()
				.userId(userId)
				.amount(amount)
				.bankName(request.getBankName())
				.bankAccount(maskedAccount)
				.ifscCode(request.getIfscCode().toUpperCase())
				.status("Pending")
				.razorpayPayoutId(simulatedPayoutId)
				.createdAt(Instant.now())
				.build();

		withdrawalRepository.save(withdrawal);

		// 5. Simulate real-time payout processing asynchronously
		final String withdrawalId = withdrawal.getId();
		new Thread(() -> {
			try {
				Thread.sleep(5000); // 5 seconds processing time
				Withdrawal w = withdrawalRepository.findById(withdrawalId).orElse(null);
				if (w != null && "Pending".equals(w.getStatus())) {
					w.setStatus("Completed");
					withdrawalRepository.save(w);
				}
			} catch (InterruptedException e) {
				Thread.currentThread().interrupt();
			}
		}).start();

		return ResponseEntity.ok(withdrawal);
	}

	private FinancialSnapshot buildFinancialSnapshot(String userId, String authorizationHeader) {
		int totalEarnings = calculateTotalEarnings(userId, authorizationHeader);
		List<Withdrawal> withdrawals = withdrawalRepository.findByUserIdOrderByCreatedAtDesc(userId);

		int totalWithdrawn = withdrawals.stream()
				.filter(w -> "Completed".equalsIgnoreCase(w.getStatus()))
				.mapToInt(Withdrawal::getAmount)
				.sum();

		int totalPending = withdrawals.stream()
				.filter(w -> "Pending".equalsIgnoreCase(w.getStatus()))
				.mapToInt(Withdrawal::getAmount)
				.sum();

		int availableBalance = Math.max(0, totalEarnings - totalWithdrawn - totalPending);
		return new FinancialSnapshot(totalEarnings, totalWithdrawn, totalPending, availableBalance, withdrawals);
	}

	private int calculateTotalEarnings(String userId, String authorizationHeader) {
		List<CourseDto> courses = courseClient.getInstructorCourses(userId, authorizationHeader);
		if (courses.isEmpty()) {
			return calculateTotalEarningsFromEnrollmentCourses(userId);
		}

		List<String> courseIds = courses.stream()
				.map(CourseDto::getId)
				.filter(id -> id != null && !id.isBlank())
				.collect(Collectors.toList());
		return calculateTotalEarningsForCourses(courseIds, courses);
	}

	private int calculateTotalEarningsFromEnrollmentCourses(String userId) {
		List<Enrollment> activeEnrollments = enrollmentRepository.findByStatus(EnrollmentStatus.ACTIVE);
		Map<String, CourseDto> coursesById = new HashMap<>();

		for (Enrollment enrollment : activeEnrollments) {
			String courseId = enrollment.getCourseId();
			if (courseId == null || courseId.isBlank() || coursesById.containsKey(courseId)) {
				continue;
			}
			CourseDto course = courseClient.getCourseById(courseId);
			if (course != null
					&& userId.equals(String.valueOf(course.getInstructorId()))
					&& course.getId() != null
					&& !course.getId().isBlank()) {
				coursesById.put(course.getId(), course);
			}
		}

		return activeEnrollments.stream()
				.filter(enrollment -> coursesById.containsKey(String.valueOf(enrollment.getCourseId())))
				.mapToInt(enrollment -> priceOf(coursesById.get(String.valueOf(enrollment.getCourseId()))))
				.sum();
	}

	private int calculateTotalEarningsForCourses(List<String> courseIds, List<CourseDto> courses) {
		if (courseIds == null || courseIds.isEmpty()) {
			return 0;
		}

		List<Enrollment> enrollments = enrollmentRepository.findByCourseIdIn(courseIds);
		return enrollments.stream()
				.filter(enrollment -> enrollment.getStatus() == EnrollmentStatus.ACTIVE)
				.mapToInt(enrollment -> {
					CourseDto course = courses.stream()
							.filter(c -> String.valueOf(c.getId()).equals(String.valueOf(enrollment.getCourseId())))
							.findFirst()
							.orElse(null);
					return priceOf(course);
				})
				.sum();
	}

	private int priceOf(CourseDto course) {
		return course == null || course.getPrice() == null ? 0 : (int) Math.round(course.getPrice());
	}

	private record FinancialSnapshot(
			int totalEarnings,
			int totalWithdrawn,
			int totalPending,
			int availableBalance,
			List<Withdrawal> withdrawals
	) {
	}
}
