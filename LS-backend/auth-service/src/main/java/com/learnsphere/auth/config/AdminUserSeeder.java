package com.learnsphere.auth.config;

import com.learnsphere.auth.entity.User;
import com.learnsphere.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminUserSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.seed.enabled:true}")
    private boolean adminSeedEnabled;

    @Value("${app.admin.seed.email:admin@learnsphere.com}")
    private String adminEmail;

    @Value("${app.admin.seed.password:admin123}")
    private String adminPassword;

    @Value("${app.admin.seed.force-update-password:false}")
    private boolean forceUpdatePassword;

    @Override
    public void run(String... args) {
        if (!adminSeedEnabled) {
            return;
        }

        String normalizedAdminEmail = adminEmail.trim().toLowerCase();
        User existingAdmin = userRepository.findByEmail(normalizedAdminEmail).orElse(null);
        if (existingAdmin != null) {
            if (forceUpdatePassword) {
                existingAdmin.setPassword(passwordEncoder.encode(adminPassword));
                existingAdmin.setRole("admin");
                userRepository.save(existingAdmin);
                log.info("Updated seeded admin credentials: {}", normalizedAdminEmail);
            }
            return;
        }

        User admin = User.builder()
                .email(normalizedAdminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .role("admin")
                .build();

        userRepository.save(admin);
        log.info("Seeded default admin user: {}", normalizedAdminEmail);
    }
}
