package com.messmap.modules.review.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request payload for updating an existing student mess review and rating.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateReviewRequest {

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private Integer rating;

    @Size(max = 2000, message = "Comment must not exceed 2000 characters")
    private String comment;

    @Min(value = 1, message = "Food quality score must be between 1 and 5")
    @Max(value = 5, message = "Food quality score must be between 1 and 5")
    private Integer foodQualityScore;

    @Min(value = 1, message = "Hygiene score must be between 1 and 5")
    @Max(value = 5, message = "Hygiene score must be between 1 and 5")
    private Integer hygieneScore;
}
