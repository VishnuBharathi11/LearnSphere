package com.learnsphere.learningprogress.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.learnsphere.learningprogress.entity.Quiz;

@Repository
public interface QuizRepository
        extends MongoRepository<Quiz, String> {
}
