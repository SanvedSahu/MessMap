package com.messmap.modules.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Authentication response payload returning the signed JWT and student details.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;

    @Builder.Default
    private String tokenType = "Bearer";

    private long expiresIn;

    private StudentProfileResponse user;

    public static AuthResponse of(String token, long expiresIn, StudentProfileResponse user) {
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(expiresIn)
                .user(user)
                .build();
    }
}
