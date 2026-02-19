package com.learnsphere.learningprogress.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "quiz")
public class Quiz {

    @Id
    private String id;

    private String courseId;
    private String title;

    private int totalMarks;
    private int passMarks;

    private List<Question> questions;
}
