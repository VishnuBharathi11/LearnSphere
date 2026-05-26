package com.learnsphere.enrollment.dto;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WithdrawalRequestDto {
	@NotNull(message = "Withdrawal amount is required")
	@DecimalMin(value = "1.0", message = "Withdrawal amount must be greater than zero")
	private BigDecimal amount;

	@NotBlank(message = "Payout method is required")
	private String payoutMethod;

	private String accountHolderName;
	private String bankName;
	private String accountNumber;
	private String ifscCode;
	private String upiId;
	private String note;
	private List<String> courseIds;
}
