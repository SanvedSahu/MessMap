package com.messmap.modules.user.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Authentication response payload containing JWT token and authenticated user details.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {

    private String token;

    @Builder.Default
    private String tokenType = "Bearer";

    private long expiresIn;

    private UserResponse user;
}
