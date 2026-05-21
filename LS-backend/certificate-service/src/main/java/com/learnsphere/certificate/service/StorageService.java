package com.learnsphere.certificate.service;

public interface StorageService {
    String savePdf(String certificateId, byte[] content);
    byte[] read(String storageKey);
    String publicUrl(String storageKey);
}
