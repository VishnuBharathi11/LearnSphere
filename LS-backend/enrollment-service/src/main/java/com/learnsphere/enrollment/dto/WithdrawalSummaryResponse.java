package com.learnsphere.enrollment.dto;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class WithdrawalSummaryResponse {
	private String instructorId;
	private String currency;
	private BigDecimal grossRevenue;
	private BigDecimal platformFee;
	private BigDecimal netEarnings;
	private BigDecimal pendingWithdrawal;
	private BigDecimal totalWithdrawn;
	private BigDecimal availableBalance;
	private BigDecimal minimumWithdrawal;
	private Integer instructorSharePercent;
}
