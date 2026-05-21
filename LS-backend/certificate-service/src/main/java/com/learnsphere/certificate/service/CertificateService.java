package com.learnsphere.certificate.service;

import com.learnsphere.certificate.dto.CertificateGenerateRequest;
import com.learnsphere.certificate.dto.CertificateResponse;
import com.learnsphere.certificate.dto.TemplateRequest;
import com.learnsphere.certificate.dto.TemplateResponse;
import com.learnsphere.certificate.dto.VerificationResponse;

import java.util.List;

public interface CertificateService {
    CertificateResponse generate(CertificateGenerateRequest request);
    CertificateResponse get(String certificateId);
    List<CertificateResponse> getByStudent(String studentUserId);
    VerificationResponse verify(String token, String ipAddress, String userAgent);
    byte[] downloadPdf(String certificateId);
    String generateQr(String token);
    List<TemplateResponse> templates();
    TemplateResponse upsertTemplate(TemplateRequest request);
}
