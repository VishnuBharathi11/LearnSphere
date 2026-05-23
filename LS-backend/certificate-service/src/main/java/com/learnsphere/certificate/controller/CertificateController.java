package com.learnsphere.certificate.controller;

import com.learnsphere.certificate.dto.CertificateGenerateRequest;
import com.learnsphere.certificate.dto.CertificateResponse;
import com.learnsphere.certificate.dto.TemplateRequest;
import com.learnsphere.certificate.dto.TemplateResponse;
import com.learnsphere.certificate.dto.VerificationResponse;
import com.learnsphere.certificate.service.CertificateService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/certificates")
@RequiredArgsConstructor
public class CertificateController {
    private final CertificateService certificateService;

    @PostMapping("/generate")
    public CertificateResponse generate(@Valid @RequestBody CertificateGenerateRequest request) {
        return certificateService.generate(request);
    }

    @GetMapping("/{certificateId}")
    public CertificateResponse get(@PathVariable String certificateId) {
        return certificateService.get(certificateId);
    }

    @GetMapping("/student/{studentUserId}")
    public List<CertificateResponse> getStudentCertificates(@PathVariable String studentUserId) {
        return certificateService.getByStudent(studentUserId);
    }

    @GetMapping("/render/{certificateId}")
    public CertificateResponse renderData(@PathVariable String certificateId) {
        return certificateService.get(certificateId);
    }

    @GetMapping("/verify/{token}")
    public VerificationResponse verify(@PathVariable String token, HttpServletRequest request) {
        return certificateService.verify(token, request.getRemoteAddr(), request.getHeader("User-Agent"));
    }

    @GetMapping("/{certificateId}/download")
    public ResponseEntity<byte[]> download(@PathVariable String certificateId) {
        byte[] pdf = certificateService.downloadPdf(certificateId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename("learnsphere-certificate-" + certificateId + ".pdf").build().toString())
                .body(pdf);
    }

    @GetMapping("/qr/{token}")
    public Map<String, String> qr(@PathVariable String token) {
        return Map.of("qrCodeDataUri", certificateService.generateQr(token));
    }

    @GetMapping("/templates")
    public List<TemplateResponse> templates() {
        return certificateService.templates();
    }

    @PostMapping("/templates")
    @PreAuthorize("hasRole('ADMIN')")
    public TemplateResponse upsertTemplate(@Valid @RequestBody TemplateRequest request) {
        return certificateService.upsertTemplate(request);
    }
}
