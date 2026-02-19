package com.learnsphere.enrollment.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.razorpay.RazorpayClient;

import lombok.Getter;

@Configuration
@Getter
public class RazorpayConfig {
	@Value("${razorpay.key}")
	private String key;
	@Value("${razorpay.secret}")
	private String secret;
	@Bean
	public RazorpayClient razorpayClient() throws Exception{
		return new RazorpayClient(key, secret);
	}
	
}
