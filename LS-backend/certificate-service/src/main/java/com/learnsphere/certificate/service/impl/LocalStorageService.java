package com.learnsphere.certificate.service.impl;

import com.learnsphere.certificate.config.CertificateProperties;
import com.learnsphere.certificate.exception.ResourceNotFoundException;
import com.learnsphere.certificate.service.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Service
@RequiredArgsConstructor
public class LocalStorageService implements StorageService {
    private final CertificateProperties properties;

    @Override
    public String savePdf(String certificateId, byte[] content) {
        try {
            Path root = Path.of(properties.getStorage().getLocalRoot()).toAbsolutePath().normalize();
            Files.createDirectories(root);
            Path file = root.resolve(certificateId + ".pdf").normalize();
            Files.write(file, content);
            return file.toString();
        } catch (IOException ex) {
            throw new IllegalStateException("Unable to store certificate PDF", ex);
        }
    }

    @Override
    public byte[] read(String storageKey) {
        try {
            Path file = Path.of(storageKey).toAbsolutePath().normalize();
            if (!Files.exists(file)) {
                throw new ResourceNotFoundException("Certificate PDF not found");
            }
            return Files.readAllBytes(file);
        } catch (IOException ex) {
            throw new ResourceNotFoundException("Certificate PDF not found");
        }
    }

    @Override
    public String publicUrl(String storageKey) {
        return storageKey;
    }
}
