package com.learnsphere.admin.repository;

import com.learnsphere.admin.entity.CourseStats;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseStatsRepository
        extends JpaRepository<CourseStats, Long> {
}
