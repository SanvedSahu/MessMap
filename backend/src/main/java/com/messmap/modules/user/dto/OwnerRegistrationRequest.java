package com.messmap.modules.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request payload for Mess Owner registration.
 * Role assignment is strictly server-controlled to prevent privilege escalation.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerRegistrationRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 150, message = "Email must not exceed 150 characters")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
    private String password;

    @Size(max = 20, message = "Phone must not exceed 20 characters")
    private String phone;

    @Size(max = 150, message = "College must not exceed 150 characters")
    private String college;

    @Size(max = 100, message = "Hostel must not exceed 100 characters")
    private String hostel;

    @Size(max = 255, message = "Avatar URL must not exceed 255 characters")
    private String avatarUrl;
}
