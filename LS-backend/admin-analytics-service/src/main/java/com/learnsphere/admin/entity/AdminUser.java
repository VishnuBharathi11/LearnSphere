package com.learnsphere.admin.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String email;

    private String name;

    private String phone;

    private String role;

    private Boolean active;

    private Boolean suspended;

    private Instant createdAt;

    private Instant lastLoginAt;

    private Instant deletedAt;
}

