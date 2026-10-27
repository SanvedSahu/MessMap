package com.messmap.modules.mess.controller;

import com.messmap.common.dto.ApiResponse;
import com.messmap.modules.mess.dto.*;
import com.messmap.modules.mess.service.OwnerMessService;
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

import java.util.List;

/**
 * REST controller for authenticated Mess Owner listing profile creation, operating timings,
 * and amenities management.
 * Enforces role-based access control and strict server-side ownership authorization.
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@PreAuthorize("hasRole('MESS_OWNER') or hasRole('ADMIN')")
public class OwnerMessController {

    private final OwnerMessService ownerMessService;

    /**
     * Create a new mess listing profile associated with the authenticated mess owner.
     * Routes: POST /api/owner/mess, POST /api/owner/messes, POST /api/v1/owner/messes, POST /api/v1/owner/mess
     */
    @PostMapping({"/api/owner/mess", "/api/owner/messes", "/api/v1/owner/messes", "/api/v1/owner/mess"})
    public ResponseEntity<ApiResponse<MessOwnerResponse>> createMess(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateMessRequest request
    ) {
        log.info("POST /api/owner/mess: owner id={}, name='{}'", userPrincipal.getId(), request.getName());
        MessOwnerResponse response = ownerMessService.createMess(userPrincipal.getId(), request);
        return new ResponseEntity<>(
                ApiResponse.success("Mess profile created successfully", response),
                HttpStatus.CREATED
        );
    }

    /**
     * Retrieve the authenticated owner's primary mess profile.
     * Routes: GET /api/owner/mess, GET /api/v1/owner/mess
     */
    @GetMapping({"/api/owner/mess", "/api/v1/owner/mess"})
    public ResponseEntity<ApiResponse<MessOwnerResponse>> getOwnerMess(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        log.info("GET /api/owner/mess: owner id={}", userPrincipal.getId());
        MessOwnerResponse response = ownerMessService.getAuthenticatedOwnerMess(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Mess profile retrieved successfully", response));
    }

    /**
     * Retrieve all messes owned by the authenticated owner.
     * Routes: GET /api/owner/messes, GET /api/v1/owner/messes
     */
    @GetMapping({"/api/owner/messes", "/api/v1/owner/messes"})
    public ResponseEntity<ApiResponse<List<MessOwnerResponse>>> getOwnerMesses(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        log.info("GET /api/owner/messes: owner id={}", userPrincipal.getId());
        List<MessOwnerResponse> responses = ownerMessService.getAuthenticatedOwnerMesses(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Owner messes retrieved successfully", responses));
    }

    /**
     * Retrieve a specific mess profile by ID with ownership authorization.
     * Routes: GET /api/owner/mess/{id}, GET /api/owner/messes/{id}, GET /api/v1/owner/messes/{id}, GET /api/v1/owner/mess/{id}
     */
    @GetMapping({"/api/owner/mess/{id:[0-9]+}", "/api/owner/messes/{id:[0-9]+}", "/api/v1/owner/messes/{id:[0-9]+}", "/api/v1/owner/mess/{id:[0-9]+}"})
    public ResponseEntity<ApiResponse<MessOwnerResponse>> getMessById(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        boolean isAdmin = userPrincipal.getRole() == Role.ROLE_ADMIN;
        log.info("GET /api/owner/mess/{}: requester id={}, isAdmin={}", id, userPrincipal.getId(), isAdmin);
        MessOwnerResponse response = ownerMessService.getOwnerMessById(userPrincipal.getId(), id, isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Mess profile retrieved successfully", response));
    }

    /**
     * Update general profile attributes of the authenticated owner's primary mess.
     * Routes: PUT /api/owner/mess/profile, PUT /api/v1/owner/mess/profile, PUT /api/owner/mess, PUT /api/v1/owner/mess
     */
    @PutMapping({"/api/owner/mess/profile", "/api/v1/owner/mess/profile", "/api/owner/mess", "/api/v1/owner/mess"})
    public ResponseEntity<ApiResponse<MessOwnerResponse>> updateOwnerMessProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody UpdateMessProfileRequest request
    ) {
        boolean isAdmin = userPrincipal.getRole() == Role.ROLE_ADMIN;
        log.info("PUT /api/owner/mess/profile: requester id={}", userPrincipal.getId());
        MessOwnerResponse response = ownerMessService.updateMessProfile(userPrincipal.getId(), null, isAdmin, request);
        return ResponseEntity.ok(ApiResponse.success("Mess profile updated successfully", response));
    }

    /**
     * Update general profile attributes of a specific mess by ID.
     * Routes: PUT /api/owner/mess/{id}, PUT /api/owner/messes/{id}, PUT /api/v1/owner/messes/{id}, PUT /api/v1/owner/mess/{id}
     */
    @PutMapping({"/api/owner/mess/{id:[0-9]+}", "/api/owner/messes/{id:[0-9]+}", "/api/v1/owner/messes/{id:[0-9]+}", "/api/v1/owner/mess/{id:[0-9]+}"})
    public ResponseEntity<ApiResponse<MessOwnerResponse>> updateMessById(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody UpdateMessProfileRequest request
    ) {
        boolean isAdmin = userPrincipal.getRole() == Role.ROLE_ADMIN;
        log.info("PUT /api/owner/mess/{}: requester id={}, isAdmin={}", id, userPrincipal.getId(), isAdmin);
        MessOwnerResponse response = ownerMessService.updateMessProfile(userPrincipal.getId(), id, isAdmin, request);
        return ResponseEntity.ok(ApiResponse.success("Mess profile updated successfully", response));
    }

    /**
     * Update operating timings for the authenticated owner's primary mess.
     * Routes: PUT /api/owner/mess/timings, PUT /api/v1/owner/mess/timings, PUT /api/owner/messes/timings
     */
    @PutMapping({"/api/owner/mess/timings", "/api/v1/owner/mess/timings", "/api/owner/messes/timings"})
    public ResponseEntity<ApiResponse<MessOwnerResponse>> updateTimings(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody UpdateMessTimingsRequest request
    ) {
        boolean isAdmin = userPrincipal.getRole() == Role.ROLE_ADMIN;
        log.info("PUT /api/owner/mess/timings: requester id={}", userPrincipal.getId());
        MessOwnerResponse response = ownerMessService.updateMessTimings(userPrincipal.getId(), null, isAdmin, request);
        return ResponseEntity.ok(ApiResponse.success("Operating timings updated successfully", response));
    }

    /**
     * Update operating timings for a specific mess by ID.
     * Routes: PUT /api/owner/mess/{id}/timings, PUT /api/owner/messes/{id}/timings, PUT /api/v1/owner/messes/{id}/timings, PUT /api/v1/owner/mess/{id}/timings
     */
    @PutMapping({"/api/owner/mess/{id}/timings", "/api/owner/messes/{id}/timings", "/api/v1/owner/messes/{id}/timings", "/api/v1/owner/mess/{id}/timings"})
    public ResponseEntity<ApiResponse<MessOwnerResponse>> updateTimingsById(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody UpdateMessTimingsRequest request
    ) {
        boolean isAdmin = userPrincipal.getRole() == Role.ROLE_ADMIN;
        log.info("PUT /api/owner/mess/{}/timings: requester id={}, isAdmin={}", id, userPrincipal.getId(), isAdmin);
        MessOwnerResponse response = ownerMessService.updateMessTimings(userPrincipal.getId(), id, isAdmin, request);
        return ResponseEntity.ok(ApiResponse.success("Operating timings updated successfully", response));
    }

    /**
     * Update amenities and highlights for the authenticated owner's primary mess.
     * Routes: PUT /api/owner/mess/amenities, PUT /api/v1/owner/mess/amenities, PUT /api/owner/messes/amenities, PUT /api/owner/mess/facilities, PUT /api/v1/owner/mess/facilities
     */
    @PutMapping({"/api/owner/mess/amenities", "/api/v1/owner/mess/amenities", "/api/owner/messes/amenities", "/api/owner/mess/facilities", "/api/v1/owner/mess/facilities"})
    public ResponseEntity<ApiResponse<MessOwnerResponse>> updateAmenities(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody UpdateMessAmenitiesRequest request
    ) {
        boolean isAdmin = userPrincipal.getRole() == Role.ROLE_ADMIN;
        log.info("PUT /api/owner/mess/amenities: requester id={}", userPrincipal.getId());
        MessOwnerResponse response = ownerMessService.updateMessAmenities(userPrincipal.getId(), null, isAdmin, request);
        return ResponseEntity.ok(ApiResponse.success("Amenities updated successfully", response));
    }

    /**
     * Update amenities and highlights for a specific mess by ID.
     * Routes: PUT /api/owner/mess/{id}/amenities, PUT /api/owner/messes/{id}/amenities, PUT /api/v1/owner/messes/{id}/amenities, PUT /api/v1/owner/mess/{id}/amenities, PUT /api/owner/mess/{id}/facilities, PUT /api/v1/owner/messes/{id}/facilities
     */
    @PutMapping({"/api/owner/mess/{id}/amenities", "/api/owner/messes/{id}/amenities", "/api/v1/owner/messes/{id}/amenities", "/api/v1/owner/mess/{id}/amenities", "/api/owner/mess/{id}/facilities", "/api/v1/owner/messes/{id}/facilities"})
    public ResponseEntity<ApiResponse<MessOwnerResponse>> updateAmenitiesById(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody UpdateMessAmenitiesRequest request
    ) {
        boolean isAdmin = userPrincipal.getRole() == Role.ROLE_ADMIN;
        log.info("PUT /api/owner/mess/{}/amenities: requester id={}, isAdmin={}", id, userPrincipal.getId(), isAdmin);
        MessOwnerResponse response = ownerMessService.updateMessAmenities(userPrincipal.getId(), id, isAdmin, request);
        return ResponseEntity.ok(ApiResponse.success("Amenities updated successfully", response));
    }

    /**
     * Submit authenticated owner's mess listing for admin verification.
     * Routes: POST /api/owner/mess/submit-verification, POST /api/v1/owner/mess/submit-verification,
     *         POST /api/owner/messes/submit-verification, POST /api/v1/owner/messes/submit-verification
     */
    @PostMapping({"/api/owner/mess/submit-verification", "/api/v1/owner/mess/submit-verification", "/api/owner/messes/submit-verification", "/api/v1/owner/messes/submit-verification"})
    public ResponseEntity<ApiResponse<MessVerificationStatusResponse>> submitVerification(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody(required = false) SubmitVerificationRequest request
    ) {
        boolean isAdmin = userPrincipal.getRole() == Role.ROLE_ADMIN;
        Long targetMessId = request != null ? request.getMessId() : null;
        log.info("POST /api/owner/mess/submit-verification: requester id={}, targetMessId={}, isAdmin={}",
                userPrincipal.getId(), targetMessId, isAdmin);
        MessVerificationStatusResponse response = ownerMessService.submitListingForVerification(userPrincipal.getId(), targetMessId, isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Mess listing submitted for verification successfully", response));
    }

    /**
     * Submit specific mess listing for admin verification by ID.
     * Routes: POST /api/owner/mess/{id}/submit-verification, POST /api/v1/owner/mess/{id}/submit-verification,
     *         POST /api/owner/messes/{id}/submit-verification, POST /api/v1/owner/messes/{id}/submit-verification
     */
    @PostMapping({"/api/owner/mess/{id}/submit-verification", "/api/v1/owner/mess/{id}/submit-verification", "/api/owner/messes/{id}/submit-verification", "/api/v1/owner/messes/{id}/submit-verification"})
    public ResponseEntity<ApiResponse<MessVerificationStatusResponse>> submitVerificationById(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        boolean isAdmin = userPrincipal.getRole() == Role.ROLE_ADMIN;
        log.info("POST /api/owner/mess/{}/submit-verification: requester id={}, isAdmin={}", id, userPrincipal.getId(), isAdmin);
        MessVerificationStatusResponse response = ownerMessService.submitListingForVerification(userPrincipal.getId(), id, isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Mess listing submitted for verification successfully", response));
    }

    /**
     * Retrieve verification lifecycle status, rejection remarks, and submission readiness for primary mess.
     * Routes: GET /api/owner/mess/verification-status, GET /api/v1/owner/mess/verification-status,
     *         GET /api/owner/messes/verification-status, GET /api/v1/owner/messes/verification-status
     */
    @GetMapping({"/api/owner/mess/verification-status", "/api/v1/owner/mess/verification-status", "/api/owner/messes/verification-status", "/api/v1/owner/messes/verification-status"})
    public ResponseEntity<ApiResponse<MessVerificationStatusResponse>> getVerificationStatus(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        boolean isAdmin = userPrincipal.getRole() == Role.ROLE_ADMIN;
        log.info("GET /api/owner/mess/verification-status: requester id={}, isAdmin={}", userPrincipal.getId(), isAdmin);
        MessVerificationStatusResponse response = ownerMessService.getVerificationStatus(userPrincipal.getId(), null, isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Mess verification status retrieved successfully", response));
    }

    /**
     * Retrieve verification lifecycle status, rejection remarks, and submission readiness for specific mess by ID.
     * Routes: GET /api/owner/mess/{id}/verification-status, GET /api/v1/owner/mess/{id}/verification-status,
     *         GET /api/owner/messes/{id}/verification-status, GET /api/v1/owner/messes/{id}/verification-status
     */
    @GetMapping({"/api/owner/mess/{id}/verification-status", "/api/v1/owner/mess/{id}/verification-status", "/api/owner/messes/{id}/verification-status", "/api/v1/owner/messes/{id}/verification-status"})
    public ResponseEntity<ApiResponse<MessVerificationStatusResponse>> getVerificationStatusById(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        boolean isAdmin = userPrincipal.getRole() == Role.ROLE_ADMIN;
        log.info("GET /api/owner/mess/{}/verification-status: requester id={}, isAdmin={}", id, userPrincipal.getId(), isAdmin);
        MessVerificationStatusResponse response = ownerMessService.getVerificationStatus(userPrincipal.getId(), id, isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Mess verification status retrieved successfully", response));
    }

    /**
     * Submits an owner request for administrative review of a suspended mess listing.
     * Routes: POST /api/owner/mess/suspension-review, POST /api/v1/owner/mess/suspension-review,
     *         POST /api/owner/messes/suspension-review, POST /api/v1/owner/messes/suspension-review
     */
    @PostMapping({"/api/owner/mess/suspension-review", "/api/v1/owner/mess/suspension-review", "/api/owner/messes/suspension-review", "/api/v1/owner/messes/suspension-review"})
    public ResponseEntity<ApiResponse<SuspensionReviewResponse>> requestSuspensionReview(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody(required = false) RequestSuspensionReviewRequest request
    ) {
        boolean isAdmin = userPrincipal.getRole() == Role.ROLE_ADMIN;
        log.info("POST /api/owner/mess/suspension-review: owner id={}, isAdmin={}", userPrincipal.getId(), isAdmin);
        SuspensionReviewResponse response = ownerMessService.requestSuspensionReview(userPrincipal.getId(), request, isAdmin);
        return new ResponseEntity<>(
                ApiResponse.success("Suspension review request submitted successfully", response),
                HttpStatus.CREATED
        );
    }

    /**
     * Submits an owner request for administrative review of a suspended mess listing by ID.
     * Routes: POST /api/owner/mess/{id}/suspension-review, POST /api/v1/owner/mess/{id}/suspension-review,
     *         POST /api/owner/messes/{id}/suspension-review, POST /api/v1/owner/messes/{id}/suspension-review
     */
    @PostMapping({"/api/owner/mess/{id}/suspension-review", "/api/v1/owner/mess/{id}/suspension-review", "/api/owner/messes/{id}/suspension-review", "/api/v1/owner/messes/{id}/suspension-review"})
    public ResponseEntity<ApiResponse<SuspensionReviewResponse>> requestSuspensionReviewById(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody(required = false) RequestSuspensionReviewRequest request
    ) {
        boolean isAdmin = userPrincipal.getRole() == Role.ROLE_ADMIN;
        RequestSuspensionReviewRequest effectiveRequest = (request != null) ? request : new RequestSuspensionReviewRequest();
        effectiveRequest.setMessId(id);
        log.info("POST /api/owner/mess/{}/suspension-review: owner id={}, isAdmin={}", id, userPrincipal.getId(), isAdmin);
        SuspensionReviewResponse response = ownerMessService.requestSuspensionReview(userPrincipal.getId(), effectiveRequest, isAdmin);
        return new ResponseEntity<>(
                ApiResponse.success("Suspension review request submitted successfully", response),
                HttpStatus.CREATED
        );
    }

    /**
     * Retrieves suspension review requests submitted for the authenticated owner's primary mess.
     * Routes: GET /api/owner/mess/suspension-reviews, GET /api/v1/owner/mess/suspension-reviews,
     *         GET /api/owner/mess/suspension-review, GET /api/v1/owner/mess/suspension-review
     */
    @GetMapping({"/api/owner/mess/suspension-reviews", "/api/v1/owner/mess/suspension-reviews", "/api/owner/mess/suspension-review", "/api/v1/owner/mess/suspension-review"})
    public ResponseEntity<ApiResponse<List<SuspensionReviewResponse>>> getSuspensionReviews(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        boolean isAdmin = userPrincipal.getRole() == Role.ROLE_ADMIN;
        log.info("GET /api/owner/mess/suspension-reviews: owner id={}, isAdmin={}", userPrincipal.getId(), isAdmin);
        List<SuspensionReviewResponse> responses = ownerMessService.getOwnerSuspensionReviews(userPrincipal.getId(), null, isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Suspension review requests retrieved successfully", responses));
    }

    /**
     * Retrieves suspension review requests submitted for a specific mess by ID.
     * Routes: GET /api/owner/mess/{id}/suspension-reviews, GET /api/v1/owner/mess/{id}/suspension-reviews,
     *         GET /api/owner/mess/{id}/suspension-review, GET /api/v1/owner/mess/{id}/suspension-review
     */
    @GetMapping({"/api/owner/mess/{id}/suspension-reviews", "/api/v1/owner/mess/{id}/suspension-reviews", "/api/owner/mess/{id}/suspension-review", "/api/v1/owner/mess/{id}/suspension-review"})
    public ResponseEntity<ApiResponse<List<SuspensionReviewResponse>>> getSuspensionReviewsById(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        boolean isAdmin = userPrincipal.getRole() == Role.ROLE_ADMIN;
        log.info("GET /api/owner/mess/{}/suspension-reviews: owner id={}, isAdmin={}", id, userPrincipal.getId(), isAdmin);
        List<SuspensionReviewResponse> responses = ownerMessService.getOwnerSuspensionReviews(userPrincipal.getId(), id, isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Suspension review requests retrieved successfully", responses));
    }
}
