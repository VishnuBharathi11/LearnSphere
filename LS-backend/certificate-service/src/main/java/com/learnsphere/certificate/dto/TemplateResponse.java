package com.learnsphere.certificate.dto;

import com.learnsphere.certificate.entity.TemplateFormat;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TemplateResponse {
    private String id;
    private String code;
    private String name;
    private String componentKey;
    private TemplateFormat format;
    private String theme;
    private boolean active;
    private boolean defaultTemplate;
    private String designConfigJson;
}
