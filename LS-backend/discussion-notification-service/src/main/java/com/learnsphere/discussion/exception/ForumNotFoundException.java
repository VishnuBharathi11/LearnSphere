package com.learnsphere.discussion.exception;

public class ForumNotFoundException extends RuntimeException {
    public ForumNotFoundException(String message) {
        super(message);
    }
}
