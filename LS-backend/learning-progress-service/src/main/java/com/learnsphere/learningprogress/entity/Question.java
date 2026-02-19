package com.learnsphere.learningprogress.entity;

import lombok.Data;

@Data
public class Question {

    private String questionId;
    private String questionText;

    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;

    private String correctAnswer;
}
