package com.learnsphere.enrollment.security;

import java.io.IOException;
import java.util.Collections;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter{
	private final JwtService jwtService;
	@Override
	protected void doFilterInternal(HttpServletRequest request
			,HttpServletResponse response,FilterChain filterChain) 
	throws ServletException,IOException{
		String authHeader=request.getHeader("Authorization");
		if (authHeader==null||!authHeader.startsWith("Bearer ")){
			filterChain.doFilter(request, response);
			return;
		}
		
		String token=authHeader.substring(7);
		try {
			String username=jwtService.extractUsername(token);
			if (username!=null&&SecurityContextHolder.getContext().getAuthentication()==null) {
				UsernamePasswordAuthenticationToken authenticationToken=
						new UsernamePasswordAuthenticationToken(username, null,Collections.emptyList());
				authenticationToken.setDetails(
						new WebAuthenticationDetailsSource().buildDetails(request));
				SecurityContextHolder.getContext().setAuthentication(authenticationToken);
			}
		} catch (Exception e) {
			SecurityContextHolder.clearContext();
		}
		filterChain.doFilter(request, response);
	}
}
