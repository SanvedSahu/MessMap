package com.messmap.modules.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Payload for administrative mess removal with mandatory justification.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RemoveMessRequest {

    @NotBlank(message = "Removal reason is required and cannot be blank")
    @Size(max = 500, message = "Removal reason must not exceed 500 characters")
    private String reason;
}
