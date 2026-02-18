package com.learnsphere.enrollment.client;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class CourseClient {

	private final RestTemplate restTemplate=new RestTemplate();
	 
	static class CourseResponse{
		private Integer price;
		public Integer getPrice() {
			return price;
		}
		public void setPrice(Integer price) {
			this.price = price;
		}
		
	}
	public Integer getCoursePrice(String courseId) {
		 String url="https://localhost:9091/api/course/"+courseId;
		 CourseResponse response=restTemplate.getForObject(url,CourseResponse.class);
		 return response.getPrice();
	 }
}
