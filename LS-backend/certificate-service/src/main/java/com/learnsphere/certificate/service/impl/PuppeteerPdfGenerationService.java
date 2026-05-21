package com.learnsphere.certificate.service.impl;

import com.learnsphere.certificate.config.CertificateProperties;
import com.learnsphere.certificate.entity.Certificate;
import com.learnsphere.certificate.entity.TemplateFormat;
import com.learnsphere.certificate.exception.CertificateGenerationException;
import com.learnsphere.certificate.service.PdfGenerationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class PuppeteerPdfGenerationService implements PdfGenerationService {
    private final CertificateProperties properties;

    @Override
    public byte[] renderCertificate(Certificate certificate) {
        try {
            Path tempFile = Files.createTempFile("learnsphere-certificate-", ".pdf");
            String url = properties.getRenderBaseUrl()
                    + "/certificate-render/" + certificate.getId()
                    + "?token=" + certificate.getVerificationToken();

            Process process = new ProcessBuilder(
                    properties.getPdf().getNodeCommand(),
                    properties.getPdf().getScriptPath(),
                    url,
                    tempFile.toString(),
                    certificate.getTemplate().getFormat() == TemplateFormat.A4_PORTRAIT ? "portrait" : "landscape"
            ).directory(Path.of(".").toFile()).redirectErrorStream(true).start();

            ByteArrayOutputStream logs = new ByteArrayOutputStream();
            process.getInputStream().transferTo(logs);
            boolean completed = process.waitFor(properties.getPdf().getTimeoutSeconds(), TimeUnit.SECONDS);
            if (!completed) {
                process.destroyForcibly();
                throw new CertificateGenerationException("PDF generation timed out");
            }
            if (process.exitValue() != 0) {
                throw new CertificateGenerationException("Puppeteer PDF generation failed: " + logs);
            }
            byte[] pdf = Files.readAllBytes(tempFile);
            Files.deleteIfExists(tempFile);
            return pdf;
        } catch (Exception ex) {
            if (ex instanceof CertificateGenerationException certificateException) {
                throw certificateException;
            }
            throw new CertificateGenerationException("Unable to render certificate PDF within "
                    + Duration.ofSeconds(properties.getPdf().getTimeoutSeconds()).toSeconds() + " seconds", ex);
        }
    }
}
