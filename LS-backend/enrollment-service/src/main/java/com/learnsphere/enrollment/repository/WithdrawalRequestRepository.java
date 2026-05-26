package com.learnsphere.enrollment.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.learnsphere.enrollment.entity.WithdrawalRequest;

public interface WithdrawalRequestRepository extends JpaRepository<WithdrawalRequest, Long> {
	List<WithdrawalRequest> findByInstructorIdOrderByRequestedAtDesc(String instructorId, Pageable pageable);
	List<WithdrawalRequest> findByInstructorId(String instructorId);
}
