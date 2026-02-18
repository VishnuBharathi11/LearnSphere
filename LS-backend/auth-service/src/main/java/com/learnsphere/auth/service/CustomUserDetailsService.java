package com.learnsphere.auth.service;

import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import com.learnsphere.auth.entity.User;
import com.learnsphere.auth.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService{
	private final UserRepository userRepository;
	@Override
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException{
		User user=userRepository.findByEmail(email)
				.orElseThrow(()->new UsernameNotFoundException("User not found"+email));
		return org.springframework.security.core.userdetails.User
				.builder()
				.username(user.getEmail())
				.password(user.getPassword())
				.roles(user.getRole())
				.build();
				
	}
}
