package com.learnsphere.enrollment.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import com.learnsphere.enrollment.enums.PaymentStatus;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long idLong;
	@Column(nullable = false)
	private String userId;
	@Column(nullable = false)
	private String courseId;
	@Column(nullable = false,unique =true)
	private String razorpayOrderId;
	private String razorpaymentId;
	@Column(nullable = false)
	private Integer amount;
	@Column(nullable = false)
	private String currency;
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private PaymentStatus status;
	@Column(nullable = false)
	private Instant createdAt;
}
