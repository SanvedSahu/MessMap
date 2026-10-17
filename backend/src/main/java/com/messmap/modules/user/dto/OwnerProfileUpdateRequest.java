package com.messmap.modules.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request payload for updating owner account profile.
 * Email and Role are intentionally omitted/immutable to prevent unauthorized tampering.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerProfileUpdateRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @Size(max = 20, message = "Phone must not exceed 20 characters")
    private String phone;

    @Size(max = 150, message = "College must not exceed 150 characters")
    private String college;

    @Size(max = 100, message = "Hostel must not exceed 100 characters")
    private String hostel;

    @Size(max = 255, message = "Avatar URL must not exceed 255 characters")
    private String avatarUrl;
}
