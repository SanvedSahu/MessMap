package com.messmap.modules.review.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Data transfer object encapsulating all reviews for a mess alongside aggregate rating metrics.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessReviewsResponse {

    private Long messId;
    private String messName;
    private Double averageRating;
    private Long totalReviews;
    private List<ReviewResponse> reviews;
}
