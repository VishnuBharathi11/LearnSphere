package com.learnsphere.certificate.dto;

import com.learnsphere.certificate.entity.TemplateFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TemplateRequest {
    @NotBlank
    private String code;

    @NotBlank
    private String name;

    @NotBlank
    private String componentKey;

    @NotNull
    private TemplateFormat format;

    @NotBlank
    private String theme;

    private boolean active = true;
    private boolean defaultTemplate;
    private String designConfigJson;
}
