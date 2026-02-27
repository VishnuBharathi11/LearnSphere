package com.learnsphere.auth.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "instructor_applications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstructorApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String expertise;

    private String email;

    private String phone;

    private LocalDate dateOfBirth;

    @Column(length = 1000)
    private String linkedin;

    private String resumeFileName;

    private String resumeContentType;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] resumeData;

    @Builder.Default
    private String status = "PENDING";

    private Instant createdAt;

    private Instant reviewedAt;

    private String reviewedBy;
}
