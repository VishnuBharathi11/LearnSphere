package com.learnsphere.enrollment.service;

import java.util.List;

import com.learnsphere.enrollment.dto.CreateOrderRequest;
import com.learnsphere.enrollment.dto.EnrollmentResponse;
import com.learnsphere.enrollment.dto.FreeEnrollRequest;
import com.learnsphere.enrollment.dto.VerifyPaymentRequest;
import com.learnsphere.enrollment.entity.Enrollment;

public interface EnrollmentService {
	String createOrder(CreateOrderRequest request);
	EnrollmentResponse verifyPayment(VerifyPaymentRequest request);
	EnrollmentResponse enrollFree(FreeEnrollRequest request);
	boolean isEnrolled(String userId,String courseId);
	List<Enrollment> getByCourseId(String courseId);
	List<Enrollment> getByCourseIds(List<String> courseIds);
	List<Enrollment> getByUserId(String userId);
}
