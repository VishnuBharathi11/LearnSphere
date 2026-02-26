package com.learnsphere.discussion.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ReportReplyRequest {
    @NotBlank
    @Size(max = 400)
    private String reason;
}
