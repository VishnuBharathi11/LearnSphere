package com.learnsphere.discussion.dto.request;

import java.util.Map;

import org.springframework.security.core.Authentication;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthenticatedActor {
    private String actorId;
    private String actorEmail;
    private String role;

    public static AuthenticatedActor from(Authentication authentication, String headerUserId) {
        String email = authentication != null ? String.valueOf(authentication.getName()) : "anonymous";
        String roleValue = "LEARNER";

        if (authentication != null && authentication.getDetails() instanceof Map<?, ?> details) {
            Object claimRole = details.get("role");
            if (claimRole != null) {
                roleValue = String.valueOf(claimRole).toUpperCase();
            }
        }

        String actorId = headerUserId != null && !headerUserId.isBlank() ? headerUserId.trim() : email;

        return AuthenticatedActor.builder().actorId(actorId).actorEmail(email).role(roleValue).build();
    }
}
