package com.messmap.modules.admin.dto;

import com.messmap.modules.user.entity.UserStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request payload for administrative user account status updates.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserStatusRequest {

    @NotNull(message = "Status is required")
    private UserStatus status;

    @Size(max = 255, message = "Reason note must not exceed 255 characters")
    private String reason;
}
