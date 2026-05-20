package com.learnsphere.course.client;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Component
public class AdminSettingsClient {

    private final RestTemplate restTemplate;
    private final String adminServiceBaseUrl;

    public AdminSettingsClient(
        RestTemplateBuilder builder,
        @Value("${admin.service.base-url:http://localhost:9095}") String adminServiceBaseUrl
    ) {
        this.restTemplate = builder.build();
        this.adminServiceBaseUrl = adminServiceBaseUrl;
    }

    public Optional<AdminSettingsSnapshot> getSettings() {
        try {
            ResponseEntity<AdminSettingsSnapshot> response = restTemplate.exchange(
                adminServiceBaseUrl + "/api/admin/settings",
                HttpMethod.GET,
                null,
                AdminSettingsSnapshot.class
            );
            return Optional.ofNullable(response.getBody());
        } catch (RestClientException ex) {
            return Optional.empty();
        }
    }
}

