package com.messmap.modules.admin.service;

import com.messmap.common.exception.BadRequestException;
import com.messmap.common.exception.ResourceNotFoundException;
import com.messmap.modules.admin.dto.AdminMessResponse;
import com.messmap.modules.mess.entity.Mess;
import com.messmap.modules.mess.entity.MessStatus;
import com.messmap.modules.mess.entity.OperatingStatus;
import com.messmap.modules.mess.repository.MessRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service managing the mess moderation lifecycle: verification, approval, rejection, and suspension.
 * Strictly enforces finite state transitions and audit logging.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminMessVerificationService {

    private final MessRepository messRepository;
    private final com.messmap.modules.mess.repository.SuspensionReviewRequestRepository suspensionReviewRequestRepository;
    private final com.messmap.modules.user.repository.UserRepository userRepository;

    /**
     * Retrieves all messes currently in PENDING verification status.
     *
     * @return List of AdminMessResponse DTOs
     */
    @Transactional(readOnly = true)
    public List<AdminMessResponse> getPendingMesses() {
        log.info("Fetching all messes with PENDING verification status");
        return messRepository.findByStatus(MessStatus.PENDING).stream()
                .map(AdminMessResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves all messes, optionally filtered by status.
     *
     * @param status Optional MessStatus filter
     * @return List of AdminMessResponse DTOs
     */
    @Transactional(readOnly = true)
    public List<AdminMessResponse> getAllMesses(MessStatus status) {
        log.info("Fetching messes with status filter: {}", status != null ? status : "ALL");
        List<Mess> messes = (status != null)
                ? messRepository.findByStatus(status)
                : messRepository.findAll();

        return messes.stream()
                .map(AdminMessResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a single mess by ID for administrative inspection.
     *
     * @param id Mess primary key
     * @return AdminMessResponse DTO
     */
    @Transactional(readOnly = true)
    public AdminMessResponse getMessById(Long id) {
        log.info("Fetching mess details for admin review, id: {}", id);
        Mess mess = messRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mess not found with id: " + id));
        return AdminMessResponse.fromEntity(mess);
    }

    /**
     * Approves a submitted mess listing.
     * Enforces finite state rule: Only PENDING (or UNDER_REVIEW) messes can be approved.
     *
     * @param id Mess primary key
     * @return Updated AdminMessResponse DTO
     */
    @Transactional
    public AdminMessResponse approveMess(Long id) {
        String adminUser = getCurrentAdminIdentifier();
        log.info("Admin [{}] attempting to approve mess ID: {}", adminUser, id);

        Mess mess = messRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mess not found with id: " + id));

        if (mess.getStatus() == MessStatus.APPROVED) {
            throw new BadRequestException("Mess is already approved");
        }

        if (mess.getStatus() != MessStatus.PENDING && mess.getStatus() != MessStatus.UNDER_REVIEW) {
            throw new BadRequestException("Only pending messes can be approved. Current status: " + mess.getStatus());
        }

        mess.setStatus(MessStatus.APPROVED);
        mess.setRejectionReason(null);
        Mess savedMess = messRepository.save(mess);

        log.info("AUDIT: Admin [{}] successfully approved mess [{}] (ID: {}). Listing is now publicly discoverable.",
                adminUser, savedMess.getName(), savedMess.getId());

        return AdminMessResponse.fromEntity(savedMess);
    }

    /**
     * Rejects a submitted mess listing with required reason notes.
     * Enforces finite state rule: Only PENDING (or UNDER_REVIEW) messes can be rejected.
     *
     * @param id Mess primary key
     * @param reason Rejection explanation feedback
     * @return Updated AdminMessResponse DTO
     */
    @Transactional
    public AdminMessResponse rejectMess(Long id, String reason) {
        String adminUser = getCurrentAdminIdentifier();
        log.info("Admin [{}] attempting to reject mess ID: {}", adminUser, id);

        if (reason == null || reason.trim().isEmpty()) {
            throw new BadRequestException("Rejection reason is required");
        }

        Mess mess = messRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mess not found with id: " + id));

        if (mess.getStatus() == MessStatus.REJECTED) {
            throw new BadRequestException("Mess is already rejected");
        }

        if (mess.getStatus() != MessStatus.PENDING && mess.getStatus() != MessStatus.UNDER_REVIEW) {
            throw new BadRequestException("Only pending messes can be rejected. Current status: " + mess.getStatus());
        }

        mess.setStatus(MessStatus.REJECTED);
        mess.setRejectionReason(reason.trim());
        Mess savedMess = messRepository.save(mess);

        log.info("AUDIT: Admin [{}] rejected mess [{}] (ID: {}). Reason: {}",
                adminUser, savedMess.getName(), savedMess.getId(), reason.trim());

        return AdminMessResponse.fromEntity(savedMess);
    }

    /**
     * Suspends an active/approved mess listing due to non-compliance or violations.
     * Enforces finite state rule: Only APPROVED messes can be suspended.
     *
     * @param id Mess primary key
     * @param reason Optional violation explanation
     * @return Updated AdminMessResponse DTO
     */
    @Transactional
    public AdminMessResponse suspendMess(Long id, String reason) {
        String adminUser = getCurrentAdminIdentifier();
        log.info("Admin [{}] attempting to suspend mess ID: {}", adminUser, id);

        Mess mess = messRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mess not found with id: " + id));

        if (mess.getStatus() == MessStatus.SUSPENDED) {
            throw new BadRequestException("Mess is already suspended");
        }

        if (mess.getStatus() != MessStatus.APPROVED) {
            throw new BadRequestException("Only approved messes can be suspended. Current status: " + mess.getStatus());
        }

        mess.setStatus(MessStatus.SUSPENDED);
        mess.setOperatingStatus(OperatingStatus.CLOSED);
        if (reason != null && !reason.trim().isEmpty()) {
            mess.setRejectionReason(reason.trim());
        }
        Mess savedMess = messRepository.save(mess);

        log.info("AUDIT: Admin [{}] suspended mess [{}] (ID: {}). Violation note: {}. Excluded from student discovery.",
                adminUser, savedMess.getName(), savedMess.getId(), reason != null ? reason.trim() : "None provided");

        return AdminMessResponse.fromEntity(savedMess);
    }

    /**
     * Unsuspends a previously suspended mess, restoring it to APPROVED status.
     * Enforces finite state rule: Only SUSPENDED messes can be unsuspended.
     *
     * @param id Mess primary key
     * @return Updated AdminMessResponse DTO
     */
    @Transactional
    public AdminMessResponse unsuspendMess(Long id) {
        String adminUser = getCurrentAdminIdentifier();
        log.info("Admin [{}] attempting to unsuspend mess ID: {}", adminUser, id);

        Mess mess = messRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mess not found with id: " + id));

        if (mess.getStatus() != MessStatus.SUSPENDED) {
            throw new BadRequestException("Only suspended messes can be unsuspended. Current status: " + mess.getStatus());
        }

        mess.setStatus(MessStatus.APPROVED);
        mess.setOperatingStatus(OperatingStatus.OPEN);
        mess.setRejectionReason(null);
        Mess savedMess = messRepository.save(mess);

        log.info("AUDIT: Admin [{}] unsuspended mess [{}] (ID: {}). Restored to APPROVED status.",
                adminUser, savedMess.getName(), savedMess.getId());

        return AdminMessResponse.fromEntity(savedMess);
    }

    /**
     * Permanently removes a mess listing by administrative action with a mandatory reason.
     * Transitions status to REMOVED, closes operating status, and excludes from public discovery.
     * Prevents future reactivation by owner.
     *
     * @param id Mess primary key
     * @param reason Mandatory reason for removal
     * @return Updated AdminMessResponse DTO
     */
    @Transactional
    public AdminMessResponse removeMess(Long id, String reason) {
        String adminUser = getCurrentAdminIdentifier();
        log.info("Admin [{}] attempting to remove mess ID: {}", adminUser, id);

        if (reason == null || reason.trim().isEmpty()) {
            throw new BadRequestException("Removal reason is required and cannot be blank");
        }

        Mess mess = messRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mess not found with id: " + id));

        if (mess.getStatus() == MessStatus.REMOVED) {
            throw new BadRequestException("Mess is already removed");
        }

        mess.setStatus(MessStatus.REMOVED);
        mess.setOperatingStatus(com.messmap.modules.mess.entity.OperatingStatus.CLOSED);
        mess.setRemovalReason(reason.trim());
        Mess savedMess = messRepository.save(mess);

        // If there were any pending suspension reviews, mark them rejected/cancelled
        List<com.messmap.modules.mess.entity.SuspensionReviewRequest> pendingReviews =
                suspensionReviewRequestRepository.findByMessIdOrderByCreatedAtDesc(mess.getId());
        for (var rev : pendingReviews) {
            if (rev.getStatus() == com.messmap.modules.mess.entity.SuspensionReviewStatus.PENDING) {
                rev.setStatus(com.messmap.modules.mess.entity.SuspensionReviewStatus.REJECTED);
                rev.setAdminNotes("Mess was removed by administrator: " + reason.trim());
                rev.setReviewedAt(java.time.LocalDateTime.now());
                getCurrentAdminUser().ifPresent(rev::setReviewedBy);
                suspensionReviewRequestRepository.save(rev);
            }
        }

        log.info("AUDIT: Admin [{}] successfully removed mess [{}] (ID: {}). Reason: {}",
                adminUser, savedMess.getName(), savedMess.getId(), reason.trim());

        return AdminMessResponse.fromEntity(savedMess);
    }

    /**
     * Retrieves suspension review requests, optionally filtered by status.
     *
     * @param status Optional filter by review status
     * @return List of review responses
     */
    @Transactional(readOnly = true)
    public List<com.messmap.modules.mess.dto.SuspensionReviewResponse> getSuspensionReviews(
            com.messmap.modules.mess.entity.SuspensionReviewStatus status) {
        log.info("Fetching suspension review requests with filter: {}", status != null ? status : "ALL");
        List<com.messmap.modules.mess.entity.SuspensionReviewRequest> requests = (status != null)
                ? suspensionReviewRequestRepository.findAllByStatusWithDetails(status)
                : suspensionReviewRequestRepository.findAllWithDetails();

        return requests.stream()
                .map(com.messmap.modules.mess.dto.SuspensionReviewResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Approves an owner's suspension review request and lifts the administrative suspension.
     * Transitions mess status to APPROVED. Rejects if mess has been REMOVED.
     *
     * @param requestId Review request primary key
     * @return Updated review response
     */
    @Transactional
    public com.messmap.modules.mess.dto.SuspensionReviewResponse approveSuspensionReview(Long requestId) {
        String adminIdentifier = getCurrentAdminIdentifier();
        log.info("Admin [{}] attempting to approve suspension review request ID: {}", adminIdentifier, requestId);

        com.messmap.modules.mess.entity.SuspensionReviewRequest request = suspensionReviewRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Suspension review request not found with id: " + requestId));

        Mess mess = request.getMess();
        if (mess.getStatus() == MessStatus.REMOVED) {
            throw new BadRequestException("Cannot approve suspension review: The mess has been removed by an administrator.");
        }

        if (request.getStatus() != com.messmap.modules.mess.entity.SuspensionReviewStatus.PENDING) {
            throw new BadRequestException("Only pending suspension reviews can be approved. Current status: " + request.getStatus());
        }

        // Lift suspension to APPROVED
        mess.setStatus(MessStatus.APPROVED);
        mess.setOperatingStatus(OperatingStatus.OPEN);
        mess.setRejectionReason(null);
        messRepository.save(mess);

        request.setStatus(com.messmap.modules.mess.entity.SuspensionReviewStatus.APPROVED);
        request.setReviewedAt(java.time.LocalDateTime.now());
        getCurrentAdminUser().ifPresent(request::setReviewedBy);
        com.messmap.modules.mess.entity.SuspensionReviewRequest saved = suspensionReviewRequestRepository.save(request);

        log.info("AUDIT: Admin [{}] approved suspension review id={} for mess [{}] (ID: {}). Restored to APPROVED.",
                adminIdentifier, requestId, mess.getName(), mess.getId());

        return com.messmap.modules.mess.dto.SuspensionReviewResponse.fromEntity(saved);
    }

    /**
     * Rejects an owner's suspension review request with mandatory explanation reason.
     * Keeps the mess SUSPENDED.
     *
     * @param requestId Review request primary key
     * @param reason Mandatory reason for rejection
     * @return Updated review response
     */
    @Transactional
    public com.messmap.modules.mess.dto.SuspensionReviewResponse rejectSuspensionReview(Long requestId, String reason) {
        String adminIdentifier = getCurrentAdminIdentifier();
        log.info("Admin [{}] attempting to reject suspension review request ID: {}", adminIdentifier, requestId);

        if (reason == null || reason.trim().isEmpty()) {
            throw new BadRequestException("Rejection reason is required and cannot be blank");
        }

        com.messmap.modules.mess.entity.SuspensionReviewRequest request = suspensionReviewRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Suspension review request not found with id: " + requestId));

        if (request.getStatus() != com.messmap.modules.mess.entity.SuspensionReviewStatus.PENDING) {
            throw new BadRequestException("Only pending suspension reviews can be rejected. Current status: " + request.getStatus());
        }

        request.setStatus(com.messmap.modules.mess.entity.SuspensionReviewStatus.REJECTED);
        request.setAdminNotes(reason.trim());
        request.setReviewedAt(java.time.LocalDateTime.now());
        getCurrentAdminUser().ifPresent(request::setReviewedBy);
        com.messmap.modules.mess.entity.SuspensionReviewRequest saved = suspensionReviewRequestRepository.save(request);

        log.info("AUDIT: Admin [{}] rejected suspension review id={} for mess [{}] (ID: {}). Reason: {}",
                adminIdentifier, requestId, request.getMess().getName(), request.getMess().getId(), reason.trim());

        return com.messmap.modules.mess.dto.SuspensionReviewResponse.fromEntity(saved);
    }

    private String getCurrentAdminIdentifier() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            return auth.getName();
        }
        return "UNKNOWN_ADMIN";
    }

    private java.util.Optional<com.messmap.modules.user.entity.User> getCurrentAdminUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            return userRepository.findByEmail(auth.getName());
        }
        return java.util.Optional.empty();
    }
}
