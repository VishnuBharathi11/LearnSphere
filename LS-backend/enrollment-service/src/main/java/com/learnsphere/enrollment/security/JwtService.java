package com.learnsphere.enrollment.security;

import java.security.Key;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {
	@Value("${jwt.secret}")
	private String secret;
	private Key getSignKey() {
		return Keys.hmacShaKeyFor(secret.getBytes());
	}
	public String extractUsername(String token) {
		return extractAllClaims(token).getSubject();
	}
	public Claims extractAllClaims(String token) {
		return Jwts.parserBuilder()
				.setSigningKey(getSignKey())
				.build()
				.parseClaimsJws(token)
				.getBody();
	}
}
