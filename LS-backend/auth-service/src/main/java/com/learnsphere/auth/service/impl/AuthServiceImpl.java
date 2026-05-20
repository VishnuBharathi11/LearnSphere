package com.learnsphere.auth.service.impl;

import com.learnsphere.auth.dto.ForgotPasswordRequest;
import com.learnsphere.auth.dto.LoginRequest;
import com.learnsphere.auth.dto.LoginResponse;
import com.learnsphere.auth.dto.ProfileResponse;
import com.learnsphere.auth.dto.RegisterRequest;
import com.learnsphere.auth.dto.ResetPasswordRequest;
import com.learnsphere.auth.dto.UpdateProfileRequest;
import com.learnsphere.auth.entity.User;
import com.learnsphere.auth.repository.UserRepository;
import com.learnsphere.auth.security.JwtUtil;
import com.learnsphere.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {
    private static final Set<String> ALLOWED_SELF_REGISTER_ROLES = Set.of("learner");
    private static final Random RANDOM = new Random();

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final JavaMailSender mailSender;

    @Value("${auth.otp-expiration-minutes:10}")
    private int otpExpiryMinutes;

    @Value("${app.mail.from:LearnSphere}")
    private String fromMail;

    @Value("${auth.otp.mail.enabled:true}")
    private boolean otpMailEnabled;

    @Value("${auth.otp.debug-return:false}")
    private boolean otpDebugReturn;

    private final Map<String, OtpEntry> otpStore = new ConcurrentHashMap<>();

    private record OtpEntry(String otp, Instant expiresAt) {}

    // ✅ REGISTER USER
    @Override
    public String register(RegisterRequest request) {
        String email = request.getEmail() == null ? null : request.getEmail().trim().toLowerCase();
        String role = "learner";

        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }

        if (userRepository.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User already exists");
        }

        User user = User.builder()
                .name(request.getName() == null ? null : request.getName().trim())
                .email(email)
                .phone(request.getPhone() == null ? null : request.getPhone().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .active(true)
                .suspended(false)
                .createdAt(Instant.now())
                .build();

        userRepository.save(user);
        return "User registered successfully";
    }

    // ✅ LOGIN USER + GENERATE TOKEN
    @Override
    public LoginResponse login(LoginRequest request) {
        String email = request.getEmail() == null ? "" : request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (Boolean.FALSE.equals(user.getActive()) || user.getDeletedAt() != null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Your account is deactivated. Please contact support.");
        }

        if (Boolean.TRUE.equals(user.getSuspended())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Your account is suspended. Please contact support.");
        }

        String password = request.getPassword() == null ? "" : request.getPassword();
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        return LoginResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .profileImage(user.getProfileImage())
                .role(user.getRole())
                .token(token)
                .build();
    }

    @Override
    public String sendForgotPasswordOtp(ForgotPasswordRequest request) {
        String email = request.getEmail() == null ? null : request.getEmail().trim().toLowerCase();
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }

        String otp = String.format("%06d", RANDOM.nextInt(1_000_000));
        Instant expiresAt = Instant.now().plusSeconds((long) otpExpiryMinutes * 60);
        otpStore.put(email, new OtpEntry(otp, expiresAt));

        String successMessage = otpDebugReturn
                ? "OTP sent successfully (DEV OTP: " + otp + ")"
                : "OTP sent successfully";

        if (!otpMailEnabled) {
            log.warn("OTP mail disabled. email={}, otp={}", email, otp);
            return successMessage;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        if (fromMail != null && !fromMail.isBlank()) {
            message.setFrom(fromMail);
        }
        message.setTo(email);
        message.setSubject("LearnSphere Password Reset OTP");
        message.setText("Your OTP is " + otp + ". It expires in " + otpExpiryMinutes + " minutes.");
        try {
            mailSender.send(message);
            log.info("OTP email sent to {}", email);
        } catch (Exception ex) {
            log.error("Failed to send OTP mail to {}: {}", email, ex.getMessage(), ex);
            if (otpDebugReturn) {
                return "Email send failed, use DEV OTP: " + otp;
            }
            otpStore.remove(email);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Failed to send OTP email. Check SMTP credentials/sender verification.");
        }

        return successMessage;
    }

    @Override
    public String resetPassword(ResetPasswordRequest request) {
        String email = request.getEmail() == null ? null : request.getEmail().trim().toLowerCase();
        String otp = request.getOtp() == null ? null : request.getOtp().trim();
        String newPassword = request.getNewPassword();

        if (email == null || email.isBlank() || otp == null || otp.isBlank() || newPassword == null || newPassword.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email, OTP and new password are required");
        }

        OtpEntry entry = otpStore.get(email);
        if (entry == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "OTP not found or expired");
        }
        if (Instant.now().isAfter(entry.expiresAt())) {
            otpStore.remove(email);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "OTP expired");
        }
        if (!entry.otp().equals(otp)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid OTP");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        otpStore.remove(email);

        return "Password reset successful";
    }

    @Override
    public ProfileResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return toProfileResponse(user);
    }

    @Override
    public ProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        user.setName(trimToNull(request.getName()));
        user.setPhone(trimToNull(request.getPhone()));
        user.setBio(trimToNull(request.getBio()));
        user.setExpertise(trimToNull(request.getExpertise()));
        user.setExperience(trimToNull(request.getExperience()));
        user.setLinkedin(trimToNull(request.getLinkedin()));
        user.setPortfolio(trimToNull(request.getPortfolio()));
        user.setProfessionalWebsite(trimToNull(request.getProfessionalWebsite()));
        user.setProfileImage(request.getProfileImage());

        User saved = userRepository.save(user);
        return toProfileResponse(saved);
    }

    private ProfileResponse toProfileResponse(User user) {
        return ProfileResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .bio(user.getBio())
                .expertise(user.getExpertise())
                .experience(user.getExperience())
                .linkedin(user.getLinkedin())
                .portfolio(user.getPortfolio())
                .professionalWebsite(user.getProfessionalWebsite())
                .profileImage(user.getProfileImage())
                .build();
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
