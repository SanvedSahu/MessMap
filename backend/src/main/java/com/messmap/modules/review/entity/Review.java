package com.messmap.modules.review.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.messmap.common.entity.BaseEntity;
import com.messmap.modules.mess.entity.Mess;
import com.messmap.modules.user.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * Review and rating given by a student to a mess.
 */
@Entity
@Table(
        name = "reviews",
        indexes = {
                @Index(name = "idx_reviews_mess_id", columnList = "mess_id"),
                @Index(name = "idx_reviews_user_id", columnList = "user_id"),
                @Index(name = "idx_reviews_status", columnList = "status")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "User is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User user;

    @NotNull(message = "Mess is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "mess_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Mess mess;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    @Column(name = "rating", nullable = false)
    private Integer rating;

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    @Min(value = 1, message = "Food quality score must be between 1 and 5")
    @Max(value = 5, message = "Food quality score must be between 1 and 5")
    @Column(name = "food_quality_score")
    private Integer foodQualityScore;

    @Min(value = 1, message = "Hygiene score must be between 1 and 5")
    @Max(value = 5, message = "Hygiene score must be between 1 and 5")
    @Column(name = "hygiene_score")
    private Integer hygieneScore;

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "status", nullable = false, length = 30)
    private ReviewStatus status = ReviewStatus.PUBLISHED;
}
