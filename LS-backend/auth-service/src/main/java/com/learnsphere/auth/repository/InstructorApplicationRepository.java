package com.learnsphere.auth.repository;

import com.learnsphere.auth.entity.InstructorApplication;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InstructorApplicationRepository extends JpaRepository<InstructorApplication, Long> {
    boolean existsByEmailAndStatus(String email, String status);
}
