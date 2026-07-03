package com.learnsphere.gateway.filter;
import com.learnsphere.gateway.util.JwtUtil;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
@Component
@RequiredArgsConstructor
public class JwtAuthFilter implements GlobalFilter {
    private final JwtUtil jwtUtil;
    @Override
    public Mono<Void> filter(ServerWebExchange exchange,
                             org.springframework.cloud.gateway.filter.GatewayFilterChain chain) {
        // Bypass preflight OPTIONS requests to allow CORS configuration to handle them
        if (HttpMethod.OPTIONS.equals(exchange.getRequest().getMethod())) {
            return chain.filter(exchange);
        }
        String path = exchange.getRequest().getURI().getPath();
        if (isPublicPath(path, exchange.getRequest().getMethod())) {
            return chain.filter(exchange);
        }
        String authHeader =
                exchange.getRequest().getHeaders()
                        .getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
        String token = authHeader.substring(7);
        try {
            Claims claims = jwtUtil.validateToken(token);
            String role = claims.get("role", String.class);
            String normalizedRole = role == null ? "" : role.trim().toUpperCase();
            if ((path.startsWith("/api/admin") || path.startsWith("/admin")) && !"ADMIN".equals(normalizedRole)) {
                exchange.getResponse()
                        .setStatusCode(HttpStatus.FORBIDDEN);
                return exchange.getResponse().setComplete();
            }
            if ((path.startsWith("/api/payments") || path.startsWith("/payments"))
                    && !("STUDENT".equals(normalizedRole)
                         || "LEARNER".equals(normalizedRole)
                         || "ADMIN".equals(normalizedRole))) {
                exchange.getResponse()
                        .setStatusCode(HttpStatus.FORBIDDEN);
                return exchange.getResponse().setComplete();
            }
        } catch (Exception e) {
            exchange.getResponse()
                    .setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
        return chain.filter(exchange);
    }
    private boolean isPublicPath(String path, HttpMethod method) {
        if ("/warmup".equals(path)) {
            return true;
        }
        if (path.contains("/actuator/")) {
            return true;
        }
        if (path.startsWith("/api/auth/")) {
            if ("/api/auth/instructor-applications".equals(path) && HttpMethod.POST.equals(method)) {
                return true;
            }
            return path.startsWith("/api/auth/login")
                    || path.startsWith("/api/auth/register")
                    || path.startsWith("/api/auth/forgot-password")
                    || path.startsWith("/api/auth/reset-password")
                    || path.startsWith("/api/auth/refresh");
        }
        if (path.startsWith("/api/courses/")) {
            String suffix = path.substring("/api/courses/".length());
            return "published".equals(suffix) || !suffix.contains("/");
        }
        if (path.startsWith("/api/categories")) {
            String suffix = path.substring("/api/categories".length());
            return suffix.isEmpty() || "/".equals(suffix) || "/active".equals(suffix) || (suffix.startsWith("/") && !suffix.substring(1).contains("/"));
        }
        if (path.startsWith("/api/certificates/")) {
            String suffix = path.substring("/api/certificates/".length());
            if (suffix.startsWith("verify/") || suffix.startsWith("render/") || suffix.startsWith("qr/")) {
                return true;
            }
            if (!suffix.contains("/")) {
                return true;
            }
            return suffix.endsWith("/download") && suffix.indexOf("/") == suffix.lastIndexOf("/");
        }
        return false;
    }
}
