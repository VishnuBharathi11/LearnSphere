package com.learnsphere.progress;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class LearnProgressServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(LearnProgressServiceApplication.class, args);
    }
}
