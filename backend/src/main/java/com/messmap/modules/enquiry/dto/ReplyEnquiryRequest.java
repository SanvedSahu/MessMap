package com.messmap.modules.enquiry.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * Payload for owner marking an enquiry as answered / adding response notes.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReplyEnquiryRequest {

    @NotBlank(message = "Reply notes are required")
    @Size(max = 2000, message = "Reply notes must not exceed 2000 characters")
    private String replyNotes;
}
