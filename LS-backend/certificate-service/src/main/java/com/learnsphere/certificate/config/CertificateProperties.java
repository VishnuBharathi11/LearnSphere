package com.learnsphere.certificate.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "certificate")
public class CertificateProperties {
    private String publicBaseUrl;
    private String renderBaseUrl;
    private Storage storage = new Storage();
    private Pdf pdf = new Pdf();

    @Getter
    @Setter
    public static class Storage {
        private String localRoot;
    }

    @Getter
    @Setter
    public static class Pdf {
        private String nodeCommand;
        private String scriptPath;
        private long timeoutSeconds = 60;
    }
}
