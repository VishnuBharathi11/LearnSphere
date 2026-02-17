package com.learnsphere.course.service.impl;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;

import com.learnsphere.course.entity.Category;
import com.learnsphere.course.exception.BadRequestException;
import com.learnsphere.course.repository.CategoryRepository;
import com.learnsphere.course.service.CategoryService;

@Service
public class CategoryServiceImpl implements CategoryService{
	private final CategoryRepository categoryRepository;
	public CategoryServiceImpl(CategoryRepository categoryRepository) {
		this.categoryRepository=categoryRepository;
	}
	@Override
	public Category createCategory(Category category) {
		if(categoryRepository.existsByNameIgnoreCase(category.getName())) {
			throw new RuntimeException("Category already exists"+category.getName());
		}
		category.setCreatedAt(Instant.now());
		category.setActive(true);
		return categoryRepository.save(category);
	}

	@Override
	public List<Category> getAllCategories() {
		return categoryRepository.findAll();
	}
	@Override
	public Category getCategoryById(String id) {
		return categoryRepository.findById(id)
				.orElseThrow(()->new RuntimeException("Category not found with id:"+id));
	}
	@Override
	public Category updateCategory(String id, Category category) {
		Category existing=getCategoryById(id);
		if(!existing.getName().equalsIgnoreCase(category.getName())&&
				categoryRepository.existsByNameIgnoreCase(category.getName())) {
			 throw new BadRequestException("Another category already uses name: " + category.getName());
		}
		existing.setName(category.getName());
        existing.setDescription(category.getDescription());
		return categoryRepository.save(existing);
	}

	@Override
	public void deleteCategory(String id) {
		Category existing=getCategoryById(id);
		if (!existing.isActive()) {
			throw new BadRequestException("Category already inactive");
		}
		existing.setActive(false);
		categoryRepository.save(existing);
	}
	
	@Override
	public List<Category> getActive(){
		return categoryRepository.findByActiveTrue();
	}

}
