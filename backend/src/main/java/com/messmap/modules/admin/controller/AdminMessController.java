package com.messmap.modules.admin.controller;

import com.messmap.common.dto.ApiResponse;
import com.messmap.modules.admin.dto.AdminMessResponse;
import com.messmap.modules.admin.dto.RejectMessRequest;
import com.messmap.modules.admin.dto.SuspendMessRequest;
import com.messmap.modules.admin.service.AdminMessVerificationService;
import com.messmap.modules.mess.entity.MessStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller managing mess verification, approval, rejection, and suspension.
 * Strictly restricted to authenticated administrators with ROLE_ADMIN authority.
 */
@Slf4j
@RestController
@RequestMapping({"/api/admin/messes", "/api/v1/admin/messes"})
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminMessController {

    private final AdminMessVerificationService adminMessVerificationService;

    /**
     * Retrieves all messes awaiting administrative verification.
     * Accessible via GET /api/admin/messes/pending and GET /api/v1/admin/messes/pending.
     *
     * @return Standardized ApiResponse containing list of pending AdminMessResponse DTOs
     */
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<AdminMessResponse>>> getPendingMesses() {
        log.info("Processing admin request for pending messes");
        List<AdminMessResponse> pendingMesses = adminMessVerificationService.getPendingMesses();
        return ResponseEntity.ok(ApiResponse.success("Pending messes retrieved successfully", pendingMesses));
    }

    /**
     * Retrieves all messes, with optional status filtering.
     * Accessible via GET /api/admin/messes?status=PENDING
     *
     * @param status Optional filter by MessStatus enum
     * @return Standardized ApiResponse containing list of AdminMessResponse DTOs
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminMessResponse>>> getAllMesses(
            @RequestParam(required = false) MessStatus status) {
        log.info("Processing admin request for messes with filter: {}", status);
        List<AdminMessResponse> messes = adminMessVerificationService.getAllMesses(status);
        return ResponseEntity.ok(ApiResponse.success("Messes retrieved successfully", messes));
    }

    /**
     * Retrieves details of a specific mess by ID for inspection.
     * Accessible via GET /api/admin/messes/{id}
     *
     * @param id Mess primary key
     * @return Standardized ApiResponse containing AdminMessResponse
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminMessResponse>> getMessById(@PathVariable Long id) {
        log.info("Processing admin request for mess details ID: {}", id);
        AdminMessResponse mess = adminMessVerificationService.getMessById(id);
        return ResponseEntity.ok(ApiResponse.success("Mess details retrieved successfully", mess));
    }

    /**
     * Approves a mess listing, making it discoverable for students.
     * Accessible via POST /api/admin/messes/{id}/approve
     *
     * @param id Mess primary key
     * @return Standardized ApiResponse containing approved AdminMessResponse
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<AdminMessResponse>> approveMess(@PathVariable Long id) {
        log.info("Processing admin approval for mess ID: {}", id);
        AdminMessResponse approvedMess = adminMessVerificationService.approveMess(id);
        return ResponseEntity.ok(ApiResponse.success("Mess approved successfully", approvedMess));
    }

    /**
     * Rejects a submitted mess listing with required rejection feedback.
     * Accessible via POST /api/admin/messes/{id}/reject
     *
     * @param id Mess primary key
     * @param request Validated rejection payload containing reason
     * @return Standardized ApiResponse containing rejected AdminMessResponse
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<AdminMessResponse>> rejectMess(
            @PathVariable Long id,
            @Valid @RequestBody RejectMessRequest request) {
        log.info("Processing admin rejection for mess ID: {}", id);
        AdminMessResponse rejectedMess = adminMessVerificationService.rejectMess(id, request.getReason());
        return ResponseEntity.ok(ApiResponse.success("Mess rejected successfully", rejectedMess));
    }

    /**
     * Suspends an active mess listing due to non-compliance or reported violations.
     * Accessible via POST /api/admin/messes/{id}/suspend
     *
     * @param id Mess primary key
     * @param request Optional payload with suspension reason
     * @return Standardized ApiResponse containing suspended AdminMessResponse
     */
    @PostMapping("/{id}/suspend")
    public ResponseEntity<ApiResponse<AdminMessResponse>> suspendMess(
            @PathVariable Long id,
            @RequestBody(required = false) SuspendMessRequest request) {
        String reason = (request != null) ? request.getReason() : null;
        log.info("Processing admin suspension for mess ID: {}", id);
        AdminMessResponse suspendedMess = adminMessVerificationService.suspendMess(id, reason);
        return ResponseEntity.ok(ApiResponse.success("Mess suspended successfully", suspendedMess));
    }

    /**
     * Unsuspends a previously suspended mess, restoring it to approved status.
     * Accessible via POST /api/admin/messes/{id}/unsuspend
     *
     * @param id Mess primary key
     * @return Standardized ApiResponse containing unsuspended AdminMessResponse
     */
    @PostMapping("/{id}/unsuspend")
    public ResponseEntity<ApiResponse<AdminMessResponse>> unsuspendMess(@PathVariable Long id) {
        log.info("Processing admin unsuspension for mess ID: {}", id);
        AdminMessResponse unsuspendedMess = adminMessVerificationService.unsuspendMess(id);
        return ResponseEntity.ok(ApiResponse.success("Mess unsuspended successfully", unsuspendedMess));
    }

    /**
     * Permanently removes a mess listing from student discovery with mandatory reason.
     * Accessible via POST /api/admin/messes/{id}/remove and DELETE /api/admin/messes/{id}.
     *
     * @param id Mess primary key
     * @param request Payload containing mandatory removal reason
     * @return Standardized ApiResponse containing removed AdminMessResponse
     */
    @PostMapping("/{id}/remove")
    public ResponseEntity<ApiResponse<AdminMessResponse>> removeMess(
            @PathVariable Long id,
            @Valid @RequestBody com.messmap.modules.admin.dto.RemoveMessRequest request) {
        log.info("Processing admin removal for mess ID: {}", id);
        AdminMessResponse removedMess = adminMessVerificationService.removeMess(id, request.getReason());
        return ResponseEntity.ok(ApiResponse.success("Mess removed successfully", removedMess));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminMessResponse>> deleteMess(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) com.messmap.modules.admin.dto.RemoveMessRequest request,
            @RequestParam(required = false) String reason) {
        String effectiveReason = (request != null && request.getReason() != null) ? request.getReason() : reason;
        log.info("Processing admin DELETE removal for mess ID: {}", id);
        AdminMessResponse removedMess = adminMessVerificationService.removeMess(id, effectiveReason);
        return ResponseEntity.ok(ApiResponse.success("Mess removed successfully", removedMess));
    }

    /**
     * Retrieves suspension review requests awaiting administrative decision.
     * Accessible via GET /api/admin/messes/suspension-reviews.
     *
     * @param status Optional filter by SuspensionReviewStatus
     * @return Standardized ApiResponse containing list of review requests
     */
    @GetMapping("/suspension-reviews")
    public ResponseEntity<ApiResponse<List<com.messmap.modules.mess.dto.SuspensionReviewResponse>>> getSuspensionReviews(
            @RequestParam(required = false) com.messmap.modules.mess.entity.SuspensionReviewStatus status) {
        log.info("Processing admin request for suspension reviews with status filter: {}", status);
        List<com.messmap.modules.mess.dto.SuspensionReviewResponse> reviews = adminMessVerificationService.getSuspensionReviews(status);
        return ResponseEntity.ok(ApiResponse.success("Suspension review requests retrieved successfully", reviews));
    }

    /**
     * Approves an owner's suspension review request and restores mess to APPROVED status.
     * Accessible via POST /api/admin/messes/suspension-reviews/{id}/approve.
     *
     * @param id Review request primary key
     * @return Standardized ApiResponse containing updated review details
     */
    @PostMapping("/suspension-reviews/{id}/approve")
    public ResponseEntity<ApiResponse<com.messmap.modules.mess.dto.SuspensionReviewResponse>> approveSuspensionReview(
            @PathVariable Long id) {
        log.info("Processing admin approval for suspension review ID: {}", id);
        com.messmap.modules.mess.dto.SuspensionReviewResponse review = adminMessVerificationService.approveSuspensionReview(id);
        return ResponseEntity.ok(ApiResponse.success("Suspension review request approved successfully", review));
    }

    /**
     * Rejects an owner's suspension review request with mandatory explanation.
     * Accessible via POST /api/admin/messes/suspension-reviews/{id}/reject.
     *
     * @param id Review request primary key
     * @param request Payload containing mandatory rejection explanation
     * @return Standardized ApiResponse containing updated review details
     */
    @PostMapping("/suspension-reviews/{id}/reject")
    public ResponseEntity<ApiResponse<com.messmap.modules.mess.dto.SuspensionReviewResponse>> rejectSuspensionReview(
            @PathVariable Long id,
            @Valid @RequestBody com.messmap.modules.admin.dto.RejectSuspensionReviewRequest request) {
        log.info("Processing admin rejection for suspension review ID: {}", id);
        com.messmap.modules.mess.dto.SuspensionReviewResponse review = adminMessVerificationService.rejectSuspensionReview(id, request.getReason());
        return ResponseEntity.ok(ApiResponse.success("Suspension review request rejected", review));
    }
}
