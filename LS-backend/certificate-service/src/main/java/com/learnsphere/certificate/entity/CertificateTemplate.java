package com.learnsphere.certificate.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "certificate_templates")
public class CertificateTemplate {
    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false, unique = true, length = 80)
    private String code;

    @Column(nullable = false, length = 140)
    private String name;

    @Column(name = "component_key", nullable = false, length = 60)
    private String componentKey;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private TemplateFormat format;

    @Column(nullable = false, length = 24)
    private String theme;

    @Column(nullable = false)
    private boolean active;

    @Column(name = "default_template", nullable = false)
    private boolean defaultTemplate;

    @Column(name = "design_config_json", columnDefinition = "json")
    private String designConfigJson;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        if (id == null) id = UUID.randomUUID().toString();
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }
}
