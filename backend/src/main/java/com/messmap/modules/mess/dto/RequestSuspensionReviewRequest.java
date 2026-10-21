package com.messmap.modules.mess.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Payload submitted by an owner to request administrative review of a suspended mess listing.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestSuspensionReviewRequest {

    private Long messId;

    @Size(max = 1000, message = "Explanation must not exceed 1000 characters")
    private String explanation;
}
