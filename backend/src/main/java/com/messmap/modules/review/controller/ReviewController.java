package com.messmap.modules.review.controller;

import com.messmap.common.dto.ApiResponse;
import com.messmap.modules.review.dto.CreateReviewRequest;
import com.messmap.modules.review.dto.MessReviewsResponse;
import com.messmap.modules.review.dto.ReviewResponse;
import com.messmap.modules.review.dto.UpdateReviewRequest;
import com.messmap.modules.review.service.ReviewService;
import com.messmap.modules.user.entity.Role;
import com.messmap.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for mess reviews and ratings submission, retrieval, updates, and deletion.
 * Supports both standard (/api/messes/...) and versioned (/api/v1/messes/...) routes.
 */
@Slf4j
@RestController
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    /**
     * Retrieve all reviews and ratings for a given mess, including aggregate metrics.
     * Accessible publicly via GET /api/messes/{messId}/reviews and GET /api/v1/messes/{messId}/reviews.
     *
     * @param messId Mess primary key
     * @return Standardized ApiResponse wrapping MessReviewsResponse
     */
    @GetMapping({"/api/messes/{messId}/reviews", "/api/v1/messes/{messId}/reviews"})
    public ResponseEntity<ApiResponse<MessReviewsResponse>> getMessReviews(
            @PathVariable("messId") Long messId
    ) {
        log.info("GET /api/messes/{}/reviews", messId);
        MessReviewsResponse response = reviewService.getMessReviews(messId);
        return ResponseEntity.ok(ApiResponse.success("Reviews retrieved successfully", response));
    }

    /**
     * Submit a new rating and optional review for an approved mess.
     * Accessible via POST /api/messes/{messId}/reviews and POST /api/v1/messes/{messId}/reviews.
     * Requires authentication as a student (or admin).
     *
     * @param messId        Mess primary key
     * @param userPrincipal Authenticated user principal
     * @param request       Review creation payload
     * @return Standardized ApiResponse with ReviewResponse and HTTP 201 Created
     */
    @PostMapping({"/api/messes/{messId}/reviews", "/api/v1/messes/{messId}/reviews"})
    @PreAuthorize("hasAnyAuthority('ROLE_STUDENT', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<ReviewResponse>> submitReview(
            @PathVariable("messId") Long messId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateReviewRequest request
    ) {
        log.info("POST /api/messes/{}/reviews by student userId={}", messId, userPrincipal.getId());
        ReviewResponse response = reviewService.submitReview(messId, userPrincipal.getId(), request);
        return new ResponseEntity<>(ApiResponse.success("Review submitted successfully", response), HttpStatus.CREATED);
    }

    /**
     * Update an existing review authored by the current student.
     * Accessible via PUT /api/messes/{messId}/reviews/{reviewId} and PUT /api/v1/messes/{messId}/reviews/{reviewId}.
     * Requires authentication; students may only edit reviews they themselves authored.
     *
     * @param messId        Mess primary key
     * @param reviewId      Review primary key
     * @param userPrincipal Authenticated user principal
     * @param request       Review update payload
     * @return Standardized ApiResponse with updated ReviewResponse
     */
    @PutMapping({"/api/messes/{messId}/reviews/{reviewId}", "/api/v1/messes/{messId}/reviews/{reviewId}"})
    @PreAuthorize("hasAnyAuthority('ROLE_STUDENT', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<ReviewResponse>> updateReview(
            @PathVariable("messId") Long messId,
            @PathVariable("reviewId") Long reviewId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody UpdateReviewRequest request
    ) {
        log.info("PUT /api/messes/{}/reviews/{} by student userId={}", messId, reviewId, userPrincipal.getId());
        boolean isAdmin = userPrincipal.getRole() == Role.ROLE_ADMIN;
        ReviewResponse response = reviewService.updateReview(messId, reviewId, userPrincipal.getId(), isAdmin, request);
        return ResponseEntity.ok(ApiResponse.success("Review updated successfully", response));
    }

    /**
     * Delete an existing review authored by the current student.
     * Accessible via DELETE /api/messes/{messId}/reviews/{reviewId} and DELETE /api/v1/messes/{messId}/reviews/{reviewId}.
     * Requires authentication; students may only delete reviews they themselves authored.
     *
     * @param messId        Mess primary key
     * @param reviewId      Review primary key
     * @param userPrincipal Authenticated user principal
     * @return Standardized ApiResponse confirming deletion
     */
    @DeleteMapping({"/api/messes/{messId}/reviews/{reviewId}", "/api/v1/messes/{messId}/reviews/{reviewId}"})
    @PreAuthorize("hasAnyAuthority('ROLE_STUDENT', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteReview(
            @PathVariable("messId") Long messId,
            @PathVariable("reviewId") Long reviewId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        log.info("DELETE /api/messes/{}/reviews/{} by student userId={}", messId, reviewId, userPrincipal.getId());
        boolean isAdmin = userPrincipal.getRole() == Role.ROLE_ADMIN;
        reviewService.deleteReview(messId, reviewId, userPrincipal.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.message("Review deleted successfully"));
    }
}
