package com.learnsphere.certificate.config;

import com.learnsphere.certificate.dto.TemplateRequest;
import com.learnsphere.certificate.entity.TemplateFormat;
import com.learnsphere.certificate.repository.CertificateTemplateRepository;
import com.learnsphere.certificate.service.CertificateService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class CertificateTemplateSeeder implements CommandLineRunner {
    private final CertificateTemplateRepository templateRepository;
    private final CertificateService certificateService;

    @Override
    public void run(String... args) {
        if (templateRepository.count() > 0) return;
        List<SeedTemplate> templates = List.of(
                new SeedTemplate("minimal-luxury", "Minimal Luxury", "horizontal-luxury", TemplateFormat.A4_LANDSCAPE, "blue-gold", true),
                new SeedTemplate("vertical-executive", "Vertical Executive", "vertical-executive", TemplateFormat.A4_PORTRAIT, "silver", false),
                new SeedTemplate("dark-premium", "Dark Premium", "dark-premium", TemplateFormat.A4_LANDSCAPE, "dark", false),
                new SeedTemplate("glass-future", "Glassmorphism Future", "glass-future", TemplateFormat.A4_LANDSCAPE, "glass", false),
                new SeedTemplate("academic-luxury", "Luxury Academic", "academic-luxury", TemplateFormat.A4_LANDSCAPE, "academic", false)
        );
        templates.forEach(seed -> {
            TemplateRequest request = new TemplateRequest();
            request.setCode(seed.code());
            request.setName(seed.name());
            request.setComponentKey(seed.componentKey());
            request.setFormat(seed.format());
            request.setTheme(seed.theme());
            request.setActive(true);
            request.setDefaultTemplate(seed.defaultTemplate());
            request.setDesignConfigJson("{}");
            certificateService.upsertTemplate(request);
        });
    }

    private record SeedTemplate(String code, String name, String componentKey, TemplateFormat format, String theme, boolean defaultTemplate) {
    }
}
