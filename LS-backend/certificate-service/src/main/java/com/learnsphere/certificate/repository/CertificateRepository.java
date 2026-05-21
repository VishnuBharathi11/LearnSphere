package com.learnsphere.certificate.repository;

import com.learnsphere.certificate.entity.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CertificateRepository extends JpaRepository<Certificate, String> {
    Optional<Certificate> findByStudentUserIdAndCourseId(String studentUserId, String courseId);
    Optional<Certificate> findByVerificationToken(String verificationToken);
    List<Certificate> findByStudentUserIdOrderByIssuedAtDesc(String studentUserId);
}
