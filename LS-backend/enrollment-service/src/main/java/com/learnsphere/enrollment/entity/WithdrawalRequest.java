package com.learnsphere.enrollment.entity;

import java.math.BigDecimal;
import java.time.Instant;

import com.learnsphere.enrollment.enums.WithdrawalStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "withdrawal_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WithdrawalRequest {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String instructorId;

	@Column(nullable = false, precision = 12, scale = 2)
	private BigDecimal amount;

	@Column(nullable = false)
	private String currency;

	@Column(nullable = false)
	private String payoutMethod;

	private String accountHolderName;
	private String bankName;
	private String accountNumber;
	private String ifscCode;
	private String upiId;

	@Column(length = 800)
	private String note;

	@Column(length = 4000)
	private String courseIds;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private WithdrawalStatus status;

	@Column(nullable = false)
	private Instant requestedAt;

	private Instant updatedAt;

	@PrePersist
	private void beforePersist() {
		if (currency == null || currency.isBlank()) {
			currency = "INR";
		}
		if (status == null) {
			status = WithdrawalStatus.PENDING;
		}
		if (requestedAt == null) {
			requestedAt = Instant.now();
		}
		updatedAt = requestedAt;
	}
}
