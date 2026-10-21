package com.messmap.modules.review.service;

import com.messmap.common.exception.BadRequestException;
import com.messmap.common.exception.ResourceNotFoundException;
import com.messmap.modules.mess.entity.Mess;
import com.messmap.modules.mess.entity.MessStatus;
import com.messmap.modules.mess.repository.MessRepository;
import com.messmap.modules.review.dto.CreateReviewRequest;
import com.messmap.modules.review.dto.MessReviewsResponse;
import com.messmap.modules.review.dto.ReviewResponse;
import com.messmap.modules.review.dto.UpdateReviewRequest;
import com.messmap.modules.review.entity.Review;
import com.messmap.modules.review.entity.ReviewStatus;
import com.messmap.modules.review.repository.ReviewRepository;
import com.messmap.modules.user.entity.User;
import com.messmap.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * Service orchestrating mess review submission, retrieval, updates, and deletion with ownership enforcement.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final MessRepository messRepository;
    private final UserRepository userRepository;

    /**
     * Retrieve all published reviews and ratings for a given mess along with aggregate statistics.
     * Handles messes with zero reviews gracefully.
     *
     * @param messId Mess primary key
     * @return MessReviewsResponse containing aggregate rating, count, and review list
     */
    @Transactional(readOnly = true)
    public MessReviewsResponse getMessReviews(Long messId) {
        log.info("Fetching reviews for messId={}", messId);

        Mess mess = messRepository.findById(messId)
                .orElseThrow(() -> new ResourceNotFoundException("Mess not found with id: " + messId));

        List<Review> reviews = reviewRepository.findByMessIdAndStatusOrderByCreatedAtDesc(messId, ReviewStatus.PUBLISHED);

        Double avgRating = reviewRepository.findAverageRatingByMessId(messId).orElse(null);
        double formattedAverage = 0.0;
        if (avgRating != null) {
            formattedAverage = BigDecimal.valueOf(avgRating)
                    .setScale(1, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        long totalReviews = reviewRepository.countByMessIdAndStatus(messId, ReviewStatus.PUBLISHED);

        List<ReviewResponse> reviewResponses = reviews.stream()
                .map(this::mapToResponse)
                .toList();

        return MessReviewsResponse.builder()
                .messId(mess.getId())
                .messName(mess.getName())
                .averageRating(formattedAverage)
                .totalReviews(totalReviews)
                .reviews(reviewResponses)
                .build();
    }

    /**
     * Submit a new rating and optional review for an approved mess.
     * Rejects attempts to review unapproved messes with HTTP 400 Bad Request.
     *
     * @param messId  Mess primary key
     * @param userId  Authenticated student user ID
     * @param request Rating and review payload
     * @return Created ReviewResponse
     */
    @Transactional
    public ReviewResponse submitReview(Long messId, Long userId, CreateReviewRequest request) {
        log.info("Submitting review for messId={} by userId={}", messId, userId);

        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new BadRequestException("Rating must be between 1 and 5");
        }

        if (request.getFoodQualityScore() != null && (request.getFoodQualityScore() < 1 || request.getFoodQualityScore() > 5)) {
            throw new BadRequestException("Food quality score must be between 1 and 5");
        }

        if (request.getHygieneScore() != null && (request.getHygieneScore() < 1 || request.getHygieneScore() > 5)) {
            throw new BadRequestException("Hygiene score must be between 1 and 5");
        }

        Mess mess = messRepository.findById(messId)
                .orElseThrow(() -> new ResourceNotFoundException("Mess not found with id: " + messId));

        if (mess.getStatus() != MessStatus.APPROVED) {
            log.warn("Attempt to review unapproved messId={} with status={}", messId, mess.getStatus());
            throw new BadRequestException("Cannot submit review: Mess is not approved. Current status: " + mess.getStatus());
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Review review = Review.builder()
                .user(user)
                .mess(mess)
                .rating(request.getRating())
                .comment(request.getComment() != null ? request.getComment().trim() : null)
                .foodQualityScore(request.getFoodQualityScore())
                .hygieneScore(request.getHygieneScore())
                .status(ReviewStatus.PUBLISHED)
                .build();

        Review saved = reviewRepository.save(review);
        log.info("Successfully created review id={} for messId={} by userId={}", saved.getId(), messId, userId);

        return mapToResponse(saved);
    }

    /**
     * Update an existing review authored by the authenticated student.
     * Strictly verifies ownership using the authenticated principal.
     *
     * @param messId                Mess primary key
     * @param reviewId              Review primary key
     * @param authenticatedUserId   Authenticated student user ID
     * @param isAdmin               Whether the caller holds ROLE_ADMIN
     * @param request               Update payload
     * @return Updated ReviewResponse
     */
    @Transactional
    public ReviewResponse updateReview(Long messId, Long reviewId, Long authenticatedUserId, boolean isAdmin, UpdateReviewRequest request) {
        log.info("Updating review id={} for messId={} by authenticatedUserId={}", reviewId, messId, authenticatedUserId);

        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new BadRequestException("Rating must be between 1 and 5");
        }

        if (request.getFoodQualityScore() != null && (request.getFoodQualityScore() < 1 || request.getFoodQualityScore() > 5)) {
            throw new BadRequestException("Food quality score must be between 1 and 5");
        }

        if (request.getHygieneScore() != null && (request.getHygieneScore() < 1 || request.getHygieneScore() > 5)) {
            throw new BadRequestException("Hygiene score must be between 1 and 5");
        }

        messRepository.findById(messId)
                .orElseThrow(() -> new ResourceNotFoundException("Mess not found with id: " + messId));

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));

        if (!review.getMess().getId().equals(messId)) {
            throw new BadRequestException("Review with id " + reviewId + " does not belong to mess with id " + messId);
        }

        enforceReviewOwnership(authenticatedUserId, review.getUser().getId(), isAdmin, "update");

        review.setRating(request.getRating());
        review.setComment(request.getComment() != null ? request.getComment().trim() : null);
        review.setFoodQualityScore(request.getFoodQualityScore());
        review.setHygieneScore(request.getHygieneScore());

        Review updated = reviewRepository.save(review);
        log.info("Successfully updated review id={} for messId={} by authenticatedUserId={}", updated.getId(), messId, authenticatedUserId);

        return mapToResponse(updated);
    }

    /**
     * Delete an existing review authored by the authenticated student.
     * Strictly verifies ownership using the authenticated principal.
     *
     * @param messId              Mess primary key
     * @param reviewId            Review primary key
     * @param authenticatedUserId Authenticated student user ID
     * @param isAdmin             Whether the caller holds ROLE_ADMIN
     */
    @Transactional
    public void deleteReview(Long messId, Long reviewId, Long authenticatedUserId, boolean isAdmin) {
        log.info("Deleting review id={} for messId={} by authenticatedUserId={}", reviewId, messId, authenticatedUserId);

        messRepository.findById(messId)
                .orElseThrow(() -> new ResourceNotFoundException("Mess not found with id: " + messId));

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));

        if (!review.getMess().getId().equals(messId)) {
            throw new BadRequestException("Review with id " + reviewId + " does not belong to mess with id " + messId);
        }

        enforceReviewOwnership(authenticatedUserId, review.getUser().getId(), isAdmin, "delete");

        reviewRepository.delete(review);
        log.info("Successfully deleted review id={} for messId={} by authenticatedUserId={}", reviewId, messId, authenticatedUserId);
    }

    /**
     * Enforces that only the author of the review (or an admin) can modify or delete it.
     */
    private void enforceReviewOwnership(Long authenticatedUserId, Long reviewAuthorId, boolean isAdmin, String action) {
        if (!isAdmin && !authenticatedUserId.equals(reviewAuthorId)) {
            log.warn("Unauthorized attempt to {} review: authenticated user {} attempted on author {}",
                    action, authenticatedUserId, reviewAuthorId);
            throw new AccessDeniedException("Access denied: You are not authorized to " + action + " another student's review.");
        }
    }

    /**
     * Maps Review entity to ReviewResponse DTO.
     */
    private ReviewResponse mapToResponse(Review review) {
        User user = review.getUser();
        Mess mess = review.getMess();

        return ReviewResponse.builder()
                .id(review.getId())
                .messId(mess != null ? mess.getId() : null)
                .messName(mess != null ? mess.getName() : null)
                .userId(user != null ? user.getId() : null)
                .userName(user != null ? user.getName() : null)
                .userAvatar(user != null ? user.getAvatarUrl() : null)
                .userCollege(user != null ? user.getCollege() : null)
                .rating(review.getRating())
                .comment(review.getComment())
                .foodQualityScore(review.getFoodQualityScore())
                .hygieneScore(review.getHygieneScore())
                .status(review.getStatus())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
