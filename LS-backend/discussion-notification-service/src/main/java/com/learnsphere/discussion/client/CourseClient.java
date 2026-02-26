package com.learnsphere.discussion.client;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Component
public class CourseClient {
    private final RestTemplate restTemplate;
    private final String courseServiceBaseUrl;

    public CourseClient(RestTemplateBuilder builder, @Value("${forum.course-service.base-url}") String courseServiceBaseUrl) {
        this.restTemplate = builder.build();
        this.courseServiceBaseUrl = courseServiceBaseUrl;
    }

    public Optional<CourseSummary> getCourseById(String courseId, String authHeader) {
        try {
            HttpHeaders headers = new HttpHeaders();
            if (authHeader != null && !authHeader.isBlank()) {
                headers.set(HttpHeaders.AUTHORIZATION, authHeader);
            }
            ResponseEntity<CourseSummary> response = restTemplate.exchange(
                courseServiceBaseUrl + "/api/courses/" + courseId,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                CourseSummary.class
            );
            return Optional.ofNullable(response.getBody());
        } catch (RestClientException ex) {
            return Optional.empty();
        }
    }
}
