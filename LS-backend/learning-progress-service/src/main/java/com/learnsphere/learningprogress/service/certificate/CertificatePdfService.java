package com.learnsphere.learningprogress.service.certificate;

import java.io.ByteArrayInputStream;

public interface CertificatePdfService {

    ByteArrayInputStream generateCertificate(
            String userName,
            String courseId);
}
