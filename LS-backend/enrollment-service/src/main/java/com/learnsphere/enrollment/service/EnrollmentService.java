package com.learnsphere.enrollment.service;

import com.learnsphere.enrollment.dto.CreateOrderRequest;
import com.learnsphere.enrollment.dto.EnrollmentResponse;
import com.learnsphere.enrollment.dto.VerifyPaymentRequest;

public interface EnrollmentService {
	String createOrder(CreateOrderRequest request);
	EnrollmentResponse verifyPayment(VerifyPaymentRequest request);
}
