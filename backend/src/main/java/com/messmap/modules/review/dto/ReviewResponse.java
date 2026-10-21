package com.messmap.modules.review.dto;

import com.messmap.modules.review.entity.ReviewStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Data transfer object representing a mess review and rating response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {

    private Long id;
    private Long messId;
    private String messName;
    private Long userId;
    private String userName;
    private String userAvatar;
    private String userCollege;
    private Integer rating;
    private String comment;
    private Integer foodQualityScore;
    private Integer hygieneScore;
    private ReviewStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
