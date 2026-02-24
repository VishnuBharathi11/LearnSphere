package com.learnsphere.auth.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String email;

    private String name;

    private String phone;

    private String password;

    private String role;

    @Column(length = 2000)
    private String bio;

    private String expertise;

    private String experience;

    private String linkedin;

    private String portfolio;

    private String professionalWebsite;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String profileImage;
}
