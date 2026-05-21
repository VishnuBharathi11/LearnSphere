package com.learnsphere.certificate.service;

import com.learnsphere.certificate.entity.Certificate;

public interface PdfGenerationService {
    byte[] renderCertificate(Certificate certificate);
}
