package com.learnsphere.certificate.repository;

import com.learnsphere.certificate.entity.CertificateTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CertificateTemplateRepository extends JpaRepository<CertificateTemplate, String> {
    Optional<CertificateTemplate> findByCode(String code);
    Optional<CertificateTemplate> findFirstByDefaultTemplateTrueAndActiveTrueOrderByUpdatedAtDesc();
    List<CertificateTemplate> findByActiveTrueOrderByDefaultTemplateDescNameAsc();
}
