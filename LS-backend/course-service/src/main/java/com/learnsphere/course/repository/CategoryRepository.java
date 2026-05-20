package com.learnsphere.course.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import com.learnsphere.course.entity.Category;

@Repository
public interface CategoryRepository extends MongoRepository<Category,String>{
	boolean existsByNameIgnoreCase(String name);
	List<Category> findByActiveTrue();
}
