package com.learnsphere.learningprogress.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CertificateResponse {

    private String courseId;
    private boolean eligible;
    private String message;
}
