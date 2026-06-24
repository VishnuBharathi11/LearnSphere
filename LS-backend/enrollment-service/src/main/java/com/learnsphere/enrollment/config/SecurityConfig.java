package com.learnsphere.enrollment.config;
import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import com.learnsphere.enrollment.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
@Configuration
@RequiredArgsConstructor
public class SecurityConfig {
	private final JwtAuthFilter jwtAuthFilter;
	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http ) throws Exception{
		http.csrf(csrf->csrf.disable())
		.authorizeHttpRequests(auth->auth
<<<<<<< HEAD
				.requestMatchers("/error", "/health").permitAll()
=======
				.requestMatchers("/error", "/api/enrollments/actuator/**").permitAll()
>>>>>>> developer
		.anyRequest().authenticated())
		.sessionManagement(session->session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
		http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
		return http.build();
	}
}