package com.messmap.modules.enquiry.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * Payload for student submitting an enquiry about a mess.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateEnquiryRequest {

    @NotNull(message = "Mess ID is required")
    private Long messId;

    @NotBlank(message = "Enquiry category is required")
    @Size(max = 50, message = "Category must not exceed 50 characters")
    private String category;

    @Size(max = 50, message = "Plan preference must not exceed 50 characters")
    private String planType;

    @NotBlank(message = "Message or question is required")
    @Size(max = 2000, message = "Message must not exceed 2000 characters")
    private String message;

    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String studentName;

    @Size(max = 20, message = "Phone must not exceed 20 characters")
    private String studentPhone;

    @Size(max = 150, message = "College must not exceed 150 characters")
    private String studentCollege;
}
