package com.learnsphere.enrollment.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class CourseClient {

	private final RestTemplate restTemplate=new RestTemplate();
	@Value("${course.service.base-url:http://localhost:9091}")
	private String courseServiceBaseUrl;
	 
	static class CourseResponse{
		private Double price;
		public Double getPrice() {
			return price;
		}
		public void setPrice(Double price) {
			this.price = price;
		}
		
	}
	public Integer getCoursePrice(String courseId) {
		 String url=courseServiceBaseUrl+"/api/courses/"+courseId;
		 CourseResponse response=restTemplate.getForObject(url,CourseResponse.class);
		 if (response == null || response.getPrice() == null) {
			 throw new RuntimeException("Course price not found");
		 }
		 return (int)Math.round(response.getPrice());
	 }
}
