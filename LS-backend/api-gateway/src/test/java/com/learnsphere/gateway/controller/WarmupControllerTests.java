package com.learnsphere.gateway.controller;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.util.Map;
import java.util.concurrent.Executors;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.reactive.function.client.WebClient;

import com.sun.net.httpserver.HttpServer;

import reactor.test.StepVerifier;

class WarmupControllerTests {

    private HttpServer server;
    private String baseUrl;

    @BeforeEach
    void startServer() throws IOException {
        server = HttpServer.create(new InetSocketAddress(0), 0);
        server.setExecutor(Executors.newCachedThreadPool());
        server.start();
        baseUrl = "http://127.0.0.1:" + server.getAddress().getPort();
    }

    @AfterEach
    void stopServer() {
        server.stop(0);
    }

    @Test
    void reportsEachServiceWithoutFailingTheWholeRequest() {
        server.createContext("/auth/health", exchange -> {
            exchange.sendResponseHeaders(200, -1);
            exchange.close();
        });
        server.createContext("/course/health", exchange -> {
            exchange.sendResponseHeaders(502, -1);
            exchange.close();
        });

        WarmupController controller = new WarmupController(
                WebClient.builder(),
                baseUrl + "/auth/health",
                baseUrl + "/course/health");

        StepVerifier.create(controller.warmup())
                .assertNext(response -> {
                    assertThat(response.get("status")).isEqualTo("WAKING_UP");
                    assertThat(response.get("services")).asList().containsExactly(
                            Map.of("name", "Auth Service", "status", "UP"),
                            Map.of("name", "Course Service", "status", "WAKING_UP"));
                })
                .verifyComplete();
    }
}
