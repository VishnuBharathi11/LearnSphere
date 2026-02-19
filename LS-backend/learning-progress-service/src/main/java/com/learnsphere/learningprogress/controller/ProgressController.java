package com.learnsphere.learningprogress.controller;

import com.learnsphere.learningprogress.dto.CertificateResponse;
import com.learnsphere.learningprogress.dto.CourseProgressResponse;
import com.learnsphere.learningprogress.entity.VideoProgress;
import com.learnsphere.learningprogress.service.ProgressService;
import com.learnsphere.learningprogress.service.certificate.CertificatePdfService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;

@RestController
@RequestMapping("/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progressService;
    private final CertificatePdfService certificatePdfService;

    // ================= UPDATE PROGRESS =================
    @PostMapping("/update")
    public VideoProgress updateProgress(
            @RequestBody VideoProgress request) {

        String userId =
                SecurityContextHolder.getContext()
                        .getAuthentication()
                        .getName();

        return progressService.updateProgress(userId, request);
    }

    // ================= RESUME LEARNING =================
    @GetMapping("/resume/{courseId}")
    public VideoProgress resumeLearning(
            @PathVariable String courseId) {

        String userId =
                SecurityContextHolder.getContext()
                        .getAuthentication()
                        .getName();

        return progressService.getResumeLesson(userId, courseId);
    }

    // ================= COURSE PROGRESS =================
    @GetMapping("/course/{courseId}")
    public CourseProgressResponse getCourseProgress(
            @PathVariable String courseId) {

        String userId =
                SecurityContextHolder.getContext()
                        .getAuthentication()
                        .getName();

        return progressService.getCourseProgress(userId, courseId);
    }

    // ================= CERTIFICATE ELIGIBILITY =================
    @GetMapping("/certificate/{courseId}")
    public CertificateResponse certificateEligibility(
            @PathVariable String courseId) {

        String userId =
                SecurityContextHolder.getContext()
                        .getAuthentication()
                        .getName();

        return progressService.checkCertificateEligibility(
                userId,
                courseId);
    }

    // ================= DOWNLOAD CERTIFICATE PDF =================
    @GetMapping("/certificate/pdf/{courseId}")
    public ResponseEntity<byte[]> downloadCertificate(
            @PathVariable String courseId) throws Exception {

        String userId =
                SecurityContextHolder.getContext()
                        .getAuthentication()
                        .getName();

        CertificateResponse eligibility =
                progressService.checkCertificateEligibility(
                        userId,
                        courseId);

        if (!eligibility.isEligible()) {
            throw new RuntimeException(
                    "Certificate not eligible");
        }

        ByteArrayInputStream pdf =
                certificatePdfService.generateCertificate(
                        userId,
                        courseId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=certificate.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf.readAllBytes());
    }
}
