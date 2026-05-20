package com.learnsphere.course.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;

import com.learnsphere.course.entity.CourseContent;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class LessonFieldCleanupInitializer implements ApplicationRunner {

    private final MongoTemplate mongoTemplate;

    @Override
    public void run(ApplicationArguments args) {
        Update update = new Update()
                .unset("heading")
                .unset("subheadings");
        mongoTemplate.updateMulti(new Query(), update, CourseContent.class);
    }
}
