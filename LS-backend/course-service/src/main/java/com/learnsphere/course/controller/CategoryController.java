package com.learnsphere.course.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.learnsphere.course.entity.Category;
import com.learnsphere.course.service.CategoryService;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
	private final CategoryService categoryService;
	public CategoryController (CategoryService categoryService) {
		this.categoryService=categoryService;
	}
	@PostMapping
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<Category> create(@RequestBody Category category){
		return ResponseEntity.ok(categoryService.createCategory(category));
	}
	@GetMapping
	public ResponseEntity<List<Category>> getAll(){
		return ResponseEntity.ok(categoryService.getAllCategories());
	}
	@GetMapping("/{id}")
	public ResponseEntity<Category> getById(@PathVariable String id){
		return ResponseEntity.ok(categoryService.getCategoryById(id));
	}
	@DeleteMapping("/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<Void> delete(@PathVariable String id){
		categoryService.deleteCategory(id);
		return ResponseEntity.noContent().build();
	}
}
