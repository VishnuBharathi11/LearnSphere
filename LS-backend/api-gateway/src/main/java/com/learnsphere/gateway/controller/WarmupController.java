package com.learnsphere.gateway.controller;

import java.time.Duration;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;

import reactor.core.publisher.Mono;

@RestController
public class WarmupController {

    private static final Logger log = LoggerFactory.getLogger(WarmupController.class);
    private static final Duration SERVICE_TIMEOUT = Duration.ofSeconds(10);

    private final WebClient webClient;
    private final String authServiceUrl;
    private final String courseServiceUrl;

    public WarmupController(
            WebClient.Builder webClientBuilder,
            @Value("${warmup.auth-service-url}") String authServiceUrl,
            @Value("${warmup.course-service-url}") String courseServiceUrl) {
        this.webClient = webClientBuilder.build();
        this.authServiceUrl = authServiceUrl;
        this.courseServiceUrl = courseServiceUrl;
    }

    @GetMapping("/warmup")
    public Mono<Map<String, Object>> warmup() {
        Mono<Map<String, String>> auth = checkService("Auth Service", authServiceUrl);
        Mono<Map<String, String>> course = checkService("Course Service", courseServiceUrl);

        return Mono.zip(auth, course)
                .map(results -> Map.of(
                        "status", "UP",
                        "services", List.of(results.getT1(), results.getT2())));
    }

    private Mono<Map<String, String>> checkService(String serviceName, String healthUrl) {
        log.info("Warming {}...", serviceName);

        return webClient.get()
                .uri(healthUrl)
                .retrieve()
                .onStatus(HttpStatusCode::isError, response ->
                        Mono.error(new IllegalStateException("HTTP " + response.statusCode().value())))
                .toBodilessEntity()
                .timeout(SERVICE_TIMEOUT)
                .map(response -> serviceStatus(serviceName, "UP"))
                .onErrorResume(error -> {
                    log.warn("{} DOWN: {}", serviceName, error.getMessage());
                    return Mono.just(serviceStatus(serviceName, "DOWN"));
                });
    }

    private Map<String, String> serviceStatus(String serviceName, String status) {
        if ("UP".equals(status)) {
            log.info("{} UP", serviceName);
        }
        return Map.of("name", serviceName, "status", status);
    }
}
