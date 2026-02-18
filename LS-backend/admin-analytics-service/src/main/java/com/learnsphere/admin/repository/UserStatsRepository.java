package com.learnsphere.admin.repository;

import com.learnsphere.admin.entity.UserStats;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserStatsRepository
        extends JpaRepository<UserStats, Long> {
}
