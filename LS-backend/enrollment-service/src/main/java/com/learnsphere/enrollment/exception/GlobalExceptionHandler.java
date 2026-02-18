package com.learnsphere.enrollment.exception;

import java.util.Map;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptionHandler {
	@ExceptionHandler(RuntimeException.class)
	public ResponseEntity<?> handleRuntime(RuntimeException ex){
		return ResponseEntity
				.status(HttpStatus.BAD_REQUEST)
				.body(Map.of("error",ex.getMessage()));
	}

}
