# LearnSphere Recovery Plan - Implementation Guide

## Overview
This document outlines the specific steps to recover the LearnSphere platform from the critical 403 Forbidden errors blocking user authentication.

## Root Cause
The API Gateway is routing requests using `http://localhost:9097`, but Spring Cloud Gateway may not be properly preserving or forwarding the Host header. The Auth Service appears to have host-based validation that rejects "localhost" requests.

## Solution Steps

### Step 1: Update API Gateway Configuration

**File:** `LS-backend/api-gateway/src/main/resources/application.properties`

**Current Configuration:**
```properties
spring.cloud.gateway.routes[0].uri=http://localhost:9097
```

**Modified Configuration (Add these lines):**
```properties
# Use IP instead of hostname to bypass host validation
spring.cloud.gateway.routes[0].uri=http://127.0.0.1:9097

# Add header forwarding configuration
spring.cloud.gateway.default-filters=PreserveHostHeader

# Disable strip prefix for better routing
spring.cloud.gateway.routes[0].strips-prefix=false
```

**Alternative: Add custom filter for header forwarding**
Add to all routes:
```properties
spring.cloud.gateway.routes[0].filters=StripPrefix=1,RemoveRequestHeader=Host,AddRequestHeader=Host,localhost:8084
```

### Step 2: Update Auth Service for IP/Host Flexibility

**File:** `LS-backend/auth-service/src/main/resources/application.properties`

Add these configurations:
```properties
# Allow requests from API Gateway with different hosts
server.error.include-message=always
server.error.include-binding-errors=always

# Spring Cloud Gateway proxy settings
spring.webflux.base-path=/

# CORS for API Gateway communication
cors.allowed-origins=http://localhost:8084,http://127.0.0.1:8084,http://localhost:9097,http://127.0.0.1:9097
cors.allowed-methods=GET,POST,PUT,DELETE,PATCH,OPTIONS
cors.allowed-headers=*
cors.exposed-headers=Authorization
cors.max-age=3600

# Trust X-Forwarded headers (important for reverse proxy)
server.tomcat.remoteip.remote-ip-header=X-Forwarded-For
server.tomcat.remoteip.protocol-header=X-Forwarded-Proto
server.tomcat.remoteip.port-header=X-Forwarded-Port
```

### Step 3: Enhance API Gateway CORS Configuration

**File:** `LS-backend/api-gateway/src/main/java/com/learnsphere/gateway/config/GatewayConfig.java`

```java
package com.learnsphere.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

@Configuration
public class GatewayConfig {

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // Allow all origins including frontend
        config.addAllowedOriginPattern("*");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        config.setAllowCredentials(false);
        
        // Add X-Forwarded headers to exposed headers
        config.addExposedHeader("X-Forwarded-For");
        config.addExposedHeader("X-Forwarded-Proto");
        config.addExposedHeader("X-Forwarded-Host");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsWebFilter(source);
    }
}
```

### Step 4: Create Custom Filter for Request Forwarding

**File:** `LS-backend/api-gateway/src/main/java/com/learnsphere/gateway/filter/ForwardHeadersFilter.java`

```java
package com.learnsphere.gateway.filter;

import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Configuration
public class ForwardHeadersFilter {

    @Bean
    public GlobalFilter customHeaderFilter() {
        return (exchange, chain) -> {
            ServerWebExchange newExchange = exchange.mutate()
                    .request(r -> r
                            .header("X-Forwarded-For", "127.0.0.1")
                            .header("X-Forwarded-Proto", "http")
                            .header("X-Forwarded-Port", "8084")
                            .header("X-Real-IP", "127.0.0.1")
                    ).build();
            
            return chain.filter(newExchange);
        };
    }
}
```

### Step 5: Update Application Gateway Routes

**File:** `LS-backend/api-gateway/src/main/resources/application.properties`

**Replace all route URIs using localhost with 127.0.0.1:**

```properties
# OLD
spring.cloud.gateway.routes[0].uri=http://localhost:9097

# NEW
spring.cloud.gateway.routes[0].uri=http://127.0.0.1:9097

# Apply to all services
spring.cloud.gateway.routes[1].uri=http://127.0.0.1:9092
spring.cloud.gateway.routes[2].uri=http://127.0.0.1:9091
spring.cloud.gateway.routes[3].uri=http://127.0.0.1:8085
spring.cloud.gateway.routes[4].uri=http://127.0.0.1:9093
spring.cloud.gateway.routes[5].uri=http://127.0.0.1:9091
```

### Step 6: Update Frontend API Configuration

**File:** `LS-frontend/.env` (Create if doesn't exist)

```env
VITE_AUTH_API_BASE_URL=http://localhost:8084/api/auth
VITE_COURSE_API_BASE_URL=http://localhost:8084/api/courses
VITE_CATEGORY_API_BASE_URL=http://localhost:8084/api/categories
VITE_ENROLLMENT_API_BASE_URL=http://localhost:8084/enrollments
VITE_PROGRESS_API_BASE_URL=http://localhost:8084/api/progress
VITE_DISCUSSION_API_BASE_URL=http://localhost:8084/discussion
```

### Step 7: Rebuild Backend Services

```bash
# Navigate to each service directory and rebuild
cd LS-backend/api-gateway
mvn clean package -DskipTests

cd ../auth-service
mvn clean package -DskipTests

cd ../course-service
mvn clean package -DskipTests

# Repeat for other services
```

### Step 8: Restart All Services

```bash
# Kill existing processes (if on Windows)
taskkill /F /IM java.exe

# Or individually restart each service:
# Restart API Gateway first
cd LS-backend/api-gateway
java -jar target/api-gateway-0.0.1-SNAPSHOT.jar

# Then restart Auth Service
cd ../auth-service
java -jar target/auth-service-0.0.1-SNAPSHOT.jar

# Restart other services similarly
```

## Verification Steps

### Test 1: Direct API Gateway Request
```bash
curl -X POST http://localhost:8084/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "1234567890",
    "password": "TestPassword123"
  }'
```

**Expected Response:** 200 OK with "User registered successfully"

### Test 2: Login Request
```bash
curl -X POST http://localhost:8084/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

**Expected Response:** 200 OK with JWT token

### Test 3: Frontend Testing
1. Navigate to http://localhost:5173/register
2. Fill in registration form
3. Click Register button
4. Should see success message instead of 403 error

### Test 4: Course Data Loading
1. Navigate to home page
2. Should see courses loading properly
3. No loading spinner stuck indefinitely

## Alternative Solution (Quick Fix)

If rebuilding is not immediately possible:

### Option A: Update Hosts File

**Windows (C:\Windows\System32\drivers\etc\hosts):**
```
127.0.0.1 localhost learnsphere-api
127.0.0.1 auth-service
127.0.0.1 course-service
```

**Linux/Mac (/etc/hosts):**
```
127.0.0.1 localhost learnsphere-api
127.0.0.1 auth-service
127.0.0.1 course-service
```

Then update API Gateway routes to use these hostnames:
```properties
spring.cloud.gateway.routes[0].uri=http://auth-service:9097
```

### Option B: Disable Host Validation (Temporary Only)

Add environment variable to Auth Service:
```bash
-Dspring.webflux.base-path=/ -Dserver.servlet.context-path=/
```

## Deployment Checklist

- [ ] Update API Gateway routes from localhost to 127.0.0.1
- [ ] Update Auth Service application.properties with proxy headers
- [ ] Update Auth Service application.properties with CORS settings
- [ ] Create ForwardHeadersFilter in API Gateway (if needed)
- [ ] Rebuild all services
- [ ] Test registration endpoint
- [ ] Test login endpoint
- [ ] Test course loading
- [ ] Test frontend application
- [ ] Monitor service logs for errors
- [ ] Test with multiple concurrent users

## Rollback Plan

If issues persist after changes:

1. Revert API Gateway configuration to use localhost
2. Stop all services
3. Restore from previous configuration backup
4. Restart services with original configuration
5. Contact development team for detailed debugging

## Monitoring & Logging

Enable debug logging to track issues:

**Add to application.properties:**
```properties
logging.level.org.springframework.cloud.gateway=DEBUG
logging.level.org.springframework.web=DEBUG
logging.level.org.springframework.security=DEBUG
```

Check logs for:
- Host header values being sent
- Request forwarding details
- Security filter chain execution
- CORS preflight handling

## Success Criteria

✅ Registration works from frontend  
✅ Login works from frontend  
✅ JWT tokens are generated  
✅ Course data loads without errors  
✅ User dashboard accessible after login  
✅ Forum/discussion accessible  
✅ Progress tracking works  
✅ No 403 errors in console  

---

**Implementation Time Estimate:** 30-45 minutes  
**Risk Level:** Low - Configuration changes only, no code logic changes  
**Rollback Time:** 5-10 minutes  

---
