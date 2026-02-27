package com.learnsphere.auth.controller;

import com.learnsphere.auth.dto.ApproveInstructorRequest;
import com.learnsphere.auth.dto.InstructorApplicationResponse;
import com.learnsphere.auth.entity.InstructorApplication;
import com.learnsphere.auth.entity.User;
import com.learnsphere.auth.repository.InstructorApplicationRepository;
import com.learnsphere.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.security.Principal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class InstructorApplicationController {

    private static final Set<String> ALLOWED_RESUME_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    private final InstructorApplicationRepository repository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    @org.springframework.beans.factory.annotation.Value("${app.mail.from:LearnSphere}")
    private String fromMail;

    @PostMapping(value = "/instructor-applications", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> submitApplication(
            @RequestParam String name,
            @RequestParam String expertise,
            @RequestParam String email,
            @RequestParam String phone,
            @RequestParam LocalDate dateOfBirth,
            @RequestParam String linkedin,
            @RequestParam("resume") MultipartFile resume
    ) {
        String normalizedEmail = normalize(email);

        if (!StringUtils.hasText(name)
                || !StringUtils.hasText(expertise)
                || !StringUtils.hasText(normalizedEmail)
                || !StringUtils.hasText(phone)
                || dateOfBirth == null
                || !StringUtils.hasText(linkedin)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "All fields are required.");
        }

        if (resume == null || resume.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Resume is required.");
        }

        if (!ALLOWED_RESUME_TYPES.contains(resume.getContentType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Resume must be PDF or DOC/DOCX.");
        }

        if (repository.existsByEmailAndStatus(normalizedEmail, "PENDING")) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You already have a pending application.");
        }

        byte[] resumeData = readResumeData(resume);

        InstructorApplication application = InstructorApplication.builder()
                .name(name.trim())
                .expertise(expertise.trim())
                .email(normalizedEmail)
                .phone(phone.trim())
                .dateOfBirth(dateOfBirth)
                .linkedin(linkedin.trim())
                .resumeFileName(resume.getOriginalFilename())
                .resumeContentType(resume.getContentType())
                .resumeData(resumeData)
                .createdAt(Instant.now())
                .build();

        InstructorApplication saved = repository.save(application);

        return ResponseEntity.ok(Map.of(
                "message", "Application submitted successfully.",
                "applicationId", saved.getId()
        ));
    }

    @GetMapping("/instructor-applications")
    public List<InstructorApplicationResponse> getApplications(Principal principal) {
        requireAdmin(principal);
        return repository.findAll()
                .stream()
                .sorted(Comparator.comparing(InstructorApplication::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/instructor-applications/{id}/resume")
    public ResponseEntity<byte[]> getResume(@PathVariable Long id, Principal principal) {
        requireAdmin(principal);
        InstructorApplication application = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));

        if (application.getResumeData() == null || application.getResumeData().length == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Resume not found");
        }

        String filename = StringUtils.hasText(application.getResumeFileName())
                ? application.getResumeFileName()
                : "resume";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(Optional.ofNullable(application.getResumeContentType()).orElse(MediaType.APPLICATION_OCTET_STREAM_VALUE)))
                .header("Content-Disposition", "inline; filename=\"" + filename + "\"")
                .body(application.getResumeData());
    }

    @PostMapping("/instructor-applications/{id}/approve")
    public ResponseEntity<Map<String, Object>> approveApplication(
            @PathVariable Long id,
            @RequestBody ApproveInstructorRequest request,
            Principal principal
    ) {
        String adminEmail = requireAdmin(principal);
        InstructorApplication application = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));

        if (!"PENDING".equalsIgnoreCase(application.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Application is already reviewed");
        }

        String email = normalize(request.getEmail());
        if (!StringUtils.hasText(email)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }
        if (!StringUtils.hasText(request.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
        }

        User user = userRepository.findByEmail(email).orElseGet(User::new);
        user.setEmail(email);
        user.setName(application.getName());
        user.setPhone(application.getPhone());
        user.setExpertise(application.getExpertise());
        user.setLinkedin(application.getLinkedin());
        user.setRole("instructor");
        user.setActive(true);
        user.setSuspended(false);
        if (user.getCreatedAt() == null) {
            user.setCreatedAt(Instant.now());
        }
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        application.setStatus("APPROVED");
        application.setReviewedAt(Instant.now());
        application.setReviewedBy(adminEmail);
        repository.save(application);

        sendApprovalEmail(email, request.getPassword());

        return ResponseEntity.ok(Map.of(
                "message", "Application approved and instructor account created."
        ));
    }

    @PostMapping("/instructor-applications/{id}/reject")
    public ResponseEntity<Map<String, Object>> rejectApplication(@PathVariable Long id, Principal principal) {
        String adminEmail = requireAdmin(principal);
        InstructorApplication application = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));

        if (!"PENDING".equalsIgnoreCase(application.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Application is already reviewed");
        }

        application.setStatus("REJECTED");
        application.setReviewedAt(Instant.now());
        application.setReviewedBy(adminEmail);
        repository.save(application);

        return ResponseEntity.ok(Map.of(
                "message", "Application rejected."
        ));
    }

    private String normalize(String value) {
        if (!StringUtils.hasText(value)) {
            return "";
        }
        return value.trim().toLowerCase();
    }

    private byte[] readResumeData(MultipartFile resume) {
        try {
            return resume.getBytes();
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to read resume file.");
        }
    }

    private InstructorApplicationResponse toResponse(InstructorApplication application) {
        return InstructorApplicationResponse.builder()
                .id(application.getId())
                .name(application.getName())
                .expertise(application.getExpertise())
                .email(application.getEmail())
                .phone(application.getPhone())
                .dateOfBirth(application.getDateOfBirth())
                .linkedin(application.getLinkedin())
                .status(application.getStatus())
                .createdAt(application.getCreatedAt())
                .reviewedAt(application.getReviewedAt())
                .reviewedBy(application.getReviewedBy())
                .build();
    }

    private String requireAdmin(Principal principal) {
        if (principal == null || !StringUtils.hasText(principal.getName())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        User user = userRepository.findByEmail(principal.getName().trim().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized"));
        String role = String.valueOf(user.getRole()).toLowerCase();
        if (!"admin".equals(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }
        return user.getEmail();
    }

    private void sendApprovalEmail(String email, String password) {
        SimpleMailMessage message = new SimpleMailMessage();
        if (StringUtils.hasText(fromMail)) {
            message.setFrom(fromMail);
        }
        message.setTo(email);
        message.setSubject("LearnSphere Instructor Approval");
        message.setText("Your instructor application has been approved.\n\n" +
                "Login email: " + email + "\n" +
                "Temporary password: " + password + "\n\n" +
                "Please log in and update your password after first login.");
        try {
            mailSender.send(message);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Failed to send approval email. Check SMTP credentials.");
        }
    }
}
