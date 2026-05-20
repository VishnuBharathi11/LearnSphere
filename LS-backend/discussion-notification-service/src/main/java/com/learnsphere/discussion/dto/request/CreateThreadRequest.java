package com.learnsphere.discussion.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateThreadRequest {
    @NotBlank
    @Size(max = 180)
    private String title;

    @NotBlank
    @Size(max = 5000)
    private String content;

    private String authorName;
}
