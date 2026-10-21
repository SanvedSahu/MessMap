package com.messmap.modules.admin.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request payload for administrative mess suspension.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SuspendMessRequest {

    @Size(max = 255, message = "Suspension reason must not exceed 255 characters")
    private String reason;
}
