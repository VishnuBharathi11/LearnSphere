package com.learnsphere.admin.repository;

import com.learnsphere.admin.entity.PaymentStats;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentStatsRepository
        extends JpaRepository<PaymentStats, Long> {
}
