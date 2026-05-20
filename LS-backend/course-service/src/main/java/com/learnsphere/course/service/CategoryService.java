package com.learnsphere.course.service;

import java.util.List;
import com.learnsphere.course.entity.Category;

public interface CategoryService {
	Category createCategory(Category category);
	List<Category> getAllCategories();
	Category updateCategory(String id,Category category);
	Category getCategoryById(String id);
	void deleteCategory(String id);
	List<Category> getActive();
}
