package com.learnsphere.auth.security;

import java.security.Key;
import java.util.Date;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {
	private static final String SECRET="learnsphere-super-secure-jwt-secret-key-2026-project-auth-service";
	private Key getSignKey() {
		return Keys.hmacShaKeyFor(SECRET.getBytes());
	}
	public String extractUsername(String token) {
		return extractAllClaims(token).getSubject();
	}
	public boolean isTokenValid(String token,UserDetails userDetails) {
		final String username=extractUsername(token);
		return username.equals(userDetails.getUsername())&&!isTokenExpired(token);
	}
	private boolean isTokenExpired(String token) {
		return extractAllClaims(token).getExpiration().before(new Date());
	}
	private Claims extractAllClaims(String token) {
		return Jwts.parserBuilder()
				.setSigningKey(getSignKey())
				.build()
				.parseClaimsJws(token)
				.getBody();
	}
}
