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
	@org.springframework.beans.factory.annotation.Value("${jwt.secret}")
	private String secret;
	private Key getSignKey() {
		return Keys.hmacShaKeyFor(secret.getBytes());
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