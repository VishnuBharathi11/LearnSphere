package com.learnsphere.enrollment.dto;

import java.math.BigDecimal;
import java.time.Instant;

import com.learnsphere.enrollment.enums.WithdrawalStatus;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class WithdrawalResponse {
	private Long id;
	private BigDecimal amount;
	private String currency;
	private String payoutMethod;
	private String accountHolderName;
	private String bankName;
	private String accountNumber;
	private String ifscCode;
	private String upiId;
	private String note;
	private WithdrawalStatus status;
	private Instant requestedAt;
	private Instant updatedAt;
}
