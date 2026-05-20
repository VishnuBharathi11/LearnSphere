package com.learnsphere.admin.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="payment_stats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double totalRevenue;
    private Long totalEnrollments;
}
