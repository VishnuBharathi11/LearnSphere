package com.learnsphere.auth.service.impl;

import com.learnsphere.auth.dto.ForgotPasswordRequest;
import com.learnsphere.auth.dto.LoginRequest;
import com.learnsphere.auth.dto.LoginResponse;
import com.learnsphere.auth.dto.RegisterRequest;
import com.learnsphere.auth.dto.ResetPasswordRequest;
import com.learnsphere.auth.entity.User;
import com.learnsphere.auth.repository.UserRepository;
import com.learnsphere.auth.security.JwtUtil;
import com.learnsphere.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private static final Set<String> ALLOWED_SELF_REGISTER_ROLES = Set.of("learner", "instructor");
    private static final Random RANDOM = new Random();

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final JavaMailSender mailSender;

    @Value("${auth.otp-expiration-minutes:10}")
    private int otpExpiryMinutes;

    @Value("${app.mail.from:LearnSphere}")
    private String fromMail;

    private final Map<String, OtpEntry> otpStore = new ConcurrentHashMap<>();

    private record OtpEntry(String otp, Instant expiresAt) {}

    // ✅ REGISTER USER
    @Override
    public String register(RegisterRequest request) {
        String email = request.getEmail() == null ? null : request.getEmail().trim().toLowerCase();
        String role = request.getRole() == null ? "learner" : request.getRole().trim().toLowerCase();

        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email is required");
        }

        if (!ALLOWED_SELF_REGISTER_ROLES.contains(role)) {
            throw new RuntimeException("Only learner/instructor registration is allowed");
        }

        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("User already exists");
        }

        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();

        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);
        return "User registered successfully";
    }

    // ✅ LOGIN USER + GENERATE TOKEN
    @Override
    public LoginResponse login(LoginRequest request) {
        String email = request.getEmail() == null ? "" : request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getEmail());

        return LoginResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .token(token)
                .build();
    }

    @Override
    public String sendForgotPasswordOtp(ForgotPasswordRequest request) {
        String email = request.getEmail() == null ? null : request.getEmail().trim().toLowerCase();
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email is required");
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        String otp = String.format("%06d", RANDOM.nextInt(1_000_000));
        Instant expiresAt = Instant.now().plusSeconds((long) otpExpiryMinutes * 60);
        otpStore.put(email, new OtpEntry(otp, expiresAt));

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromMail);
        message.setTo(email);
        message.setSubject("LearnSphere Password Reset OTP");
        message.setText("Your OTP is " + otp + ". It expires in " + otpExpiryMinutes + " minutes.");
        try {
            mailSender.send(message);
        } catch (Exception ex) {
            otpStore.remove(email);
            throw new RuntimeException("Failed to send OTP email. Check mail credentials.");
        }

        return "OTP sent successfully";
    }

    @Override
    public String resetPassword(ResetPasswordRequest request) {
        String email = request.getEmail() == null ? null : request.getEmail().trim().toLowerCase();
        String otp = request.getOtp() == null ? null : request.getOtp().trim();
        String newPassword = request.getNewPassword();

        if (email == null || email.isBlank() || otp == null || otp.isBlank() || newPassword == null || newPassword.isBlank()) {
            throw new RuntimeException("Email, OTP and new password are required");
        }

        OtpEntry entry = otpStore.get(email);
        if (entry == null) {
            throw new RuntimeException("OTP not found or expired");
        }
        if (Instant.now().isAfter(entry.expiresAt())) {
            otpStore.remove(email);
            throw new RuntimeException("OTP expired");
        }
        if (!entry.otp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        otpStore.remove(email);

        return "Password reset successful";
    }
}
