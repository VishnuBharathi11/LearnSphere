package com.learnsphere.admin.config;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.stereotype.Component;
import java.net.URI;

@Component
public class DatabaseUrlSanitizer implements BeanPostProcessor {

    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
        if (bean instanceof DataSourceProperties) {
            DataSourceProperties properties = (DataSourceProperties) bean;
            String url = properties.getUrl();
            
            if (url != null && url.contains("@")) {
                try {
                    String jdbcPrefix = "";
                    String cleanUrl = url;
                    if (url.startsWith("jdbc:")) {
                        jdbcPrefix = "jdbc:";
                        cleanUrl = url.substring(5);
                    }
                    
                    URI uri = new URI(cleanUrl);
                    String userInfo = uri.getUserInfo();
                    if (userInfo != null && userInfo.contains(":")) {
                        String[] parts = userInfo.split(":", 2);
                        properties.setUsername(parts[0]);
                        properties.setPassword(parts[1]);
                    }
                    
                    StringBuilder sb = new StringBuilder();
                    sb.append(jdbcPrefix).append(uri.getScheme()).append("://").append(uri.getHost());
                    if (uri.getPort() != -1) {
                        sb.append(":").append(uri.getPort());
                    }
                    if (uri.getPath() != null) {
                        sb.append(uri.getPath());
                    }
                    if (uri.getQuery() != null) {
                        String query = uri.getQuery().replace("ssl-mode=", "sslMode=");
                        sb.append("?").append(query);
                    }
                    properties.setUrl(sb.toString());
                } catch (Exception e) {
                    // Fallback to original URL if parsing fails
                }
            }
        }
        return bean;
    }
}
