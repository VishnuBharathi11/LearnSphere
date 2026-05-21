package com.learnsphere.certificate.exception;

public class CertificateGenerationException extends RuntimeException {
    public CertificateGenerationException(String message, Throwable cause) {
        super(message, cause);
    }

    public CertificateGenerationException(String message) {
        super(message);
    }
}
