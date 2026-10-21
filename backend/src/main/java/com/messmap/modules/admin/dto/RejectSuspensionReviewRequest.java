package com.messmap.modules.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Payload for administrator rejection of a suspension review request.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RejectSuspensionReviewRequest {

    @NotBlank(message = "Rejection feedback reason is required and cannot be blank")
    @Size(max = 500, message = "Rejection feedback must not exceed 500 characters")
    private String reason;
}
