package com.learnsphere.certificate.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.learnsphere.certificate.config.CertificateProperties;
import com.learnsphere.certificate.dto.CertificateGenerateRequest;
import com.learnsphere.certificate.dto.CertificateResponse;
import com.learnsphere.certificate.dto.TemplateRequest;
import com.learnsphere.certificate.dto.TemplateResponse;
import com.learnsphere.certificate.dto.VerificationResponse;
import com.learnsphere.certificate.entity.Certificate;
import com.learnsphere.certificate.entity.CertificateStatus;
import com.learnsphere.certificate.entity.CertificateTemplate;
import com.learnsphere.certificate.entity.VerificationLog;
import com.learnsphere.certificate.exception.ResourceNotFoundException;
import com.learnsphere.certificate.repository.CertificateRepository;
import com.learnsphere.certificate.repository.CertificateTemplateRepository;
import com.learnsphere.certificate.repository.VerificationLogRepository;
import com.learnsphere.certificate.service.CertificateService;
import com.learnsphere.certificate.service.PdfGenerationService;
import com.learnsphere.certificate.service.QrCodeService;
import com.learnsphere.certificate.service.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CertificateServiceImpl implements CertificateService {
    private final CertificateRepository certificateRepository;
    private final CertificateTemplateRepository templateRepository;
    private final VerificationLogRepository verificationLogRepository;
    private final PdfGenerationService pdfGenerationService;
    private final QrCodeService qrCodeService;
    private final StorageService storageService;
    private final CertificateProperties properties;
    private final ObjectMapper objectMapper;
    private final SecureRandom secureRandom = new SecureRandom();

    @Override
    @Transactional
    public CertificateResponse generate(CertificateGenerateRequest request) {
        return certificateRepository
                .findByStudentUserIdAndCourseId(request.getStudentUserId(), request.getCourseId())
                .map(this::toResponse)
                .orElseGet(() -> generateNew(request));
    }

    private CertificateResponse generateNew(CertificateGenerateRequest request) {
        CertificateTemplate template = resolveTemplate(request.getTemplateCode());
        String token = createToken();
        String verificationUrl = properties.getPublicBaseUrl() + "/verify-certificate/" + token;
        String badgesJson = writeJson(request.getSkillBadges() == null ? List.of() : request.getSkillBadges());

        Certificate certificate = Certificate.builder()
                .studentUserId(request.getStudentUserId())
                .studentName(request.getStudentName().trim())
                .courseId(request.getCourseId())
                .courseTitle(request.getCourseTitle().trim())
                .instructorName(request.getInstructorName())
                .instructorSignatureUrl(request.getInstructorSignatureUrl())
                .skillBadgesJson(badgesJson)
                .template(template)
                .verificationToken(token)
                .verificationUrl(verificationUrl)
                .pdfStorageKey("pending")
                .pdfDownloadUrl("pending")
                .qrCodeDataUri(qrCodeService.createQrCodeDataUri(verificationUrl))
                .status(CertificateStatus.ISSUED)
                .issuedAt(Instant.now())
                .build();

        Certificate saved = certificateRepository.saveAndFlush(certificate);
        byte[] pdf = pdfGenerationService.renderCertificate(saved);
        String storageKey = storageService.savePdf(saved.getId(), pdf);
        saved.setPdfStorageKey(storageKey);
        saved.setPdfDownloadUrl(properties.getPublicBaseUrl() + "/api/certificates/" + saved.getId() + "/download");
        return toResponse(certificateRepository.save(saved));
    }

    @Override
    @Transactional(readOnly = true)
    public CertificateResponse get(String certificateId) {
        return toResponse(findCertificate(certificateId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CertificateResponse> getByStudent(String studentUserId) {
        return certificateRepository.findByStudentUserIdOrderByIssuedAtDesc(studentUserId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public VerificationResponse verify(String token, String ipAddress, String userAgent) {
        Certificate certificate = certificateRepository.findByVerificationToken(token).orElse(null);
        boolean valid = certificate != null && certificate.getStatus() == CertificateStatus.ISSUED;
        verificationLogRepository.save(VerificationLog.builder()
                .certificate(certificate)
                .token(token)
                .valid(valid)
                .ipAddress(ipAddress)
                .userAgent(userAgent == null ? null : userAgent.substring(0, Math.min(userAgent.length(), 512)))
                .build());

        if (!valid) {
            return VerificationResponse.builder()
                    .valid(false)
                    .message("Certificate could not be verified")
                    .build();
        }
        return VerificationResponse.builder()
                .valid(true)
                .certificateId(certificate.getId())
                .studentName(certificate.getStudentName())
                .courseTitle(certificate.getCourseTitle())
                .instructorName(certificate.getInstructorName())
                .issuedAt(certificate.getIssuedAt())
                .status(certificate.getStatus().name())
                .message("Certificate verified by LearnSphere")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] downloadPdf(String certificateId) {
        return storageService.read(findCertificate(certificateId).getPdfStorageKey());
    }

    @Override
    public String generateQr(String token) {
        String verificationUrl = properties.getPublicBaseUrl() + "/verify-certificate/" + token;
        return qrCodeService.createQrCodeDataUri(verificationUrl);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TemplateResponse> templates() {
        return templateRepository.findByActiveTrueOrderByDefaultTemplateDescNameAsc()
                .stream()
                .map(this::toTemplateResponse)
                .toList();
    }

    @Override
    @Transactional
    public TemplateResponse upsertTemplate(TemplateRequest request) {
        CertificateTemplate template = templateRepository.findByCode(request.getCode())
                .orElseGet(CertificateTemplate::new);
        template.setCode(request.getCode());
        template.setName(request.getName());
        template.setComponentKey(request.getComponentKey());
        template.setFormat(request.getFormat());
        template.setTheme(request.getTheme());
        template.setActive(request.isActive());
        template.setDefaultTemplate(request.isDefaultTemplate());
        template.setDesignConfigJson(request.getDesignConfigJson());
        return toTemplateResponse(templateRepository.save(template));
    }

    private CertificateTemplate resolveTemplate(String templateCode) {
        if (templateCode != null && !templateCode.isBlank()) {
            return templateRepository.findByCode(templateCode)
                    .orElseThrow(() -> new ResourceNotFoundException("Certificate template not found"));
        }
        return templateRepository.findFirstByDefaultTemplateTrueAndActiveTrueOrderByUpdatedAtDesc()
                .orElseThrow(() -> new ResourceNotFoundException("Default certificate template not configured"));
    }

    private Certificate findCertificate(String certificateId) {
        return certificateRepository.findById(certificateId)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found"));
    }

    private String createToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String writeJson(List<String> values) {
        try {
            return objectMapper.writeValueAsString(values);
        } catch (JsonProcessingException ex) {
            return "[]";
        }
    }

    private List<String> readBadges(String json) {
        try {
            if (json == null || json.isBlank()) return List.of();
            return objectMapper.readValue(json, objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));
        } catch (Exception ex) {
            return List.of();
        }
    }

    private CertificateResponse toResponse(Certificate certificate) {
        CertificateTemplate template = certificate.getTemplate();
        return CertificateResponse.builder()
                .id(certificate.getId())
                .studentUserId(certificate.getStudentUserId())
                .studentName(certificate.getStudentName())
                .courseId(certificate.getCourseId())
                .courseTitle(certificate.getCourseTitle())
                .instructorName(certificate.getInstructorName())
                .instructorSignatureUrl(certificate.getInstructorSignatureUrl())
                .skillBadges(readBadges(certificate.getSkillBadgesJson()))
                .templateCode(template.getCode())
                .templateName(template.getName())
                .componentKey(template.getComponentKey())
                .format(template.getFormat())
                .theme(template.getTheme())
                .verificationToken(certificate.getVerificationToken())
                .verificationUrl(certificate.getVerificationUrl())
                .pdfDownloadUrl(certificate.getPdfDownloadUrl())
                .qrCodeDataUri(certificate.getQrCodeDataUri())
                .status(certificate.getStatus())
                .issuedAt(certificate.getIssuedAt())
                .build();
    }

    private TemplateResponse toTemplateResponse(CertificateTemplate template) {
        return TemplateResponse.builder()
                .id(template.getId())
                .code(template.getCode())
                .name(template.getName())
                .componentKey(template.getComponentKey())
                .format(template.getFormat())
                .theme(template.getTheme())
                .active(template.isActive())
                .defaultTemplate(template.isDefaultTemplate())
                .designConfigJson(template.getDesignConfigJson())
                .build();
    }
}
