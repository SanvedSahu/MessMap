package com.messmap.modules.admin.service;

import com.messmap.common.exception.BadRequestException;
import com.messmap.common.exception.ResourceNotFoundException;
import com.messmap.modules.admin.dto.AdminMessResponse;
import com.messmap.modules.mess.entity.Mess;
import com.messmap.modules.mess.entity.MessStatus;
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
        mess.setRejectionReason(null);
        Mess savedMess = messRepository.save(mess);

        log.info("AUDIT: Admin [{}] unsuspended mess [{}] (ID: {}). Restored to APPROVED status.",
                adminUser, savedMess.getName(), savedMess.getId());

        return AdminMessResponse.fromEntity(savedMess);
    }

    private String getCurrentAdminIdentifier() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            return auth.getName();
        }
        return "UNKNOWN_ADMIN";
    }
}
