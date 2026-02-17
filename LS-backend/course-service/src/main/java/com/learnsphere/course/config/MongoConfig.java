package com.learnsphere.course.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@EnableMongoRepositories(basePackages="com.learnsphere.course.repository")
public class MongoConfig {

}
