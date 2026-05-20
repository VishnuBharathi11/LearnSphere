package com.learnsphere.admin.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminPayment {

    @Id
    @Column(name = "id")
    private Long id;

    private String userId;

    private String courseId;

    private String razorpayOrderId;

    private String razorpaymentId;

    private Integer amount;

    private String currency;

    private String status;

    private Instant createdAt;
}

