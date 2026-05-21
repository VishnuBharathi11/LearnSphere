package com.learnsphere.certificate.dto;

import com.learnsphere.certificate.entity.CertificateStatus;
import com.learnsphere.certificate.entity.TemplateFormat;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.List;

@Getter
@Builder
public class CertificateResponse {
    private String id;
    private String studentUserId;
    private String studentName;
    private String courseId;
    private String courseTitle;
    private String instructorName;
    private String instructorSignatureUrl;
    private List<String> skillBadges;
    private String templateCode;
    private String templateName;
    private String componentKey;
    private TemplateFormat format;
    private String theme;
    private String verificationToken;
    private String verificationUrl;
    private String pdfDownloadUrl;
    private String qrCodeDataUri;
    private CertificateStatus status;
    private Instant issuedAt;
}
