package com.learnsphere.certificate.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CertificateGenerateRequest {
    @NotBlank
    private String studentUserId;

    @NotBlank
    private String studentName;

    @NotBlank
    private String courseId;

    @NotBlank
    private String courseTitle;

    private String instructorName;
    private String instructorSignatureUrl;
    private String templateCode;
    private List<String> skillBadges;
}
