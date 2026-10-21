package com.messmap.modules.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request payload for administrative mess rejection.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RejectMessRequest {

    @NotBlank(message = "Rejection reason is required")
    @Size(max = 255, message = "Rejection reason must not exceed 255 characters")
    private String reason;
}
