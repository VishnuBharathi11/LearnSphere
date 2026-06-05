package com.learnsphere.gateway.util;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
@Component
public class JwtUtil {
    @org.springframework.beans.factory.annotation.Value("${jwt.secret:learnsphere-super-secure-jwt-secret-key-2026-project-auth-service}")
    private String secret;
    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }
    public Claims validateToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
    public String extractRole(String token) {
        return validateToken(token).get("role", String.class);
    }
}