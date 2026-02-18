package com.learnsphere.course.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
	@ExceptionHandler(ResourseNotFoundException.class)
	public ResponseEntity<?> handleNotFound(ResourseNotFoundException ex){
		Map<String, Object> response=new HashMap<>();
		response.put("status", 404);
		response.put("error", ex.getMessage());
		return new ResponseEntity<>(response,HttpStatus.NOT_FOUND);
	}
	@ExceptionHandler(BadRequestException.class)
	public ResponseEntity<?> handleNotFound(BadRequestException ex){
		Map<String, Object> response=new HashMap<>();
		response.put("status", 400);
		response.put("error", ex.getMessage());
		return new ResponseEntity<>(response,HttpStatus.BAD_REQUEST);
	}
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex){
		Map<String, String> errors=new HashMap<>();
		ex.getBindingResult().getFieldErrors().forEach(err->errors.put(err.getField(),err.getDefaultMessage()));
		return new ResponseEntity<>(errors,HttpStatus.BAD_REQUEST);
	}
	@ExceptionHandler(Exception.class)
	public ResponseEntity<?> handleNotFound(Exception ex){
		Map<String, Object> response=new HashMap<>();
		response.put("status", 500);
		response.put("error", "Internal Server Error");
		return new ResponseEntity<>(response,HttpStatus.INTERNAL_SERVER_ERROR);
	}

}
