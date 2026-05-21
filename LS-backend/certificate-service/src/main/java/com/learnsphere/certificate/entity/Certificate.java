package com.learnsphere.certificate.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "certificates",
        indexes = {
                @Index(name = "idx_cert_user", columnList = "student_user_id"),
                @Index(name = "idx_cert_course", columnList = "course_id"),
                @Index(name = "idx_cert_verification_token", columnList = "verification_token"),
                @Index(name = "idx_cert_unique_student_course", columnList = "student_user_id,course_id", unique = true)
        }
)
public class Certificate {
    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "student_user_id", nullable = false, length = 64)
    private String studentUserId;

    @Column(name = "student_name", nullable = false, length = 160)
    private String studentName;

    @Column(name = "course_id", nullable = false, length = 64)
    private String courseId;

    @Column(name = "course_title", nullable = false, length = 180)
    private String courseTitle;

    @Column(name = "instructor_name", length = 160)
    private String instructorName;

    @Column(name = "instructor_signature_url", length = 512)
    private String instructorSignatureUrl;

    @Column(name = "skill_badges_json", columnDefinition = "json")
    private String skillBadgesJson;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private CertificateTemplate template;

    @Column(name = "verification_token", nullable = false, unique = true, length = 96)
    private String verificationToken;

    @Column(name = "verification_url", nullable = false, length = 1024)
    private String verificationUrl;

    @Column(name = "pdf_storage_key", nullable = false, length = 1024)
    private String pdfStorageKey;

    @Column(name = "pdf_download_url", nullable = false, length = 1024)
    private String pdfDownloadUrl;

    @Lob
    @Column(name = "qr_code_data_uri", columnDefinition = "TEXT")
    private String qrCodeDataUri;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private CertificateStatus status;

    @Column(name = "issued_at", nullable = false)
    private Instant issuedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        if (id == null) id = UUID.randomUUID().toString();
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
        if (issuedAt == null) issuedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }
}
