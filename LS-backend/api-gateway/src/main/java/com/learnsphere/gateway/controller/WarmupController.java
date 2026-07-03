package com.learnsphere.gateway.controller;

import java.time.Duration;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;

import reactor.core.publisher.Mono;

@RestController
public class WarmupController {

    private static final Logger log = LoggerFactory.getLogger(WarmupController.class);
    private static final Duration SERVICE_TIMEOUT = Duration.ofSeconds(90);

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
                        "status", overallStatus(results.getT1(), results.getT2()),
                        "services", List.of(results.getT1(), results.getT2())));
    }

    private Mono<Map<String, String>> checkService(String serviceName, String healthUrl) {
        log.info("Warming {}...", serviceName);

        return webClient.get()
                .uri(healthUrl)
                .retrieve()
                .toBodilessEntity()
                .timeout(SERVICE_TIMEOUT)
                .map(response -> serviceStatus(serviceName, "UP"))
                .onErrorResume(error -> {
                    String status = isColdStartFailure(error) ? "WAKING_UP" : "DOWN";
                    log.warn("{} {}: {}", serviceName, status, error.getMessage());
                    return Mono.just(serviceStatus(serviceName, status));
                });
    }

    private boolean isColdStartFailure(Throwable error) {
        if (error instanceof WebClientResponseException responseError) {
            int status = responseError.getStatusCode().value();
            return status == 502 || status == 503 || status == 504;
        }
        return error instanceof java.util.concurrent.TimeoutException
                || error.getCause() instanceof java.util.concurrent.TimeoutException
                || error instanceof org.springframework.web.reactive.function.client.WebClientRequestException;
    }

    @SafeVarargs
    private final String overallStatus(Map<String, String>... services) {
        boolean wakingUp = false;
        for (Map<String, String> service : services) {
            if ("DOWN".equals(service.get("status"))) {
                return "DOWN";
            }
            wakingUp |= "WAKING_UP".equals(service.get("status"));
        }
        return wakingUp ? "WAKING_UP" : "UP";
    }

    private Map<String, String> serviceStatus(String serviceName, String status) {
        if ("UP".equals(status)) {
            log.info("{} UP.", serviceName);
        }
        return Map.of("name", serviceName, "status", status);
    }
}
