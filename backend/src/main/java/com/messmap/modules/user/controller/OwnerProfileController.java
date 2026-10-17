package com.messmap.modules.user.controller;

import com.messmap.common.dto.ApiResponse;
import com.messmap.modules.user.dto.ChangePasswordRequest;
import com.messmap.modules.user.dto.OwnerProfileResponse;
import com.messmap.modules.user.dto.OwnerProfileUpdateRequest;
import com.messmap.modules.user.entity.Role;
import com.messmap.modules.user.service.OwnerProfileService;
import com.messmap.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for authenticated Mess Owner profile management and password operations.
 * Enforces role-based access control and strict cross-user ownership authorization.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/owner/profile")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ROLE_MESS_OWNER') or hasRole('ROLE_ADMIN')")
public class OwnerProfileController {

    private final OwnerProfileService ownerProfileService;

    /**
     * Retrieve the currently authenticated mess owner's profile.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<OwnerProfileResponse>> getProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        log.info("Fetching owner profile for authenticated user id={}", userPrincipal.getId());
        OwnerProfileResponse response = ownerProfileService.getAuthenticatedOwnerProfile(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Owner profile retrieved successfully", response));
    }

    /**
     * Update the currently authenticated mess owner's profile.
     */
    @PutMapping
    public ResponseEntity<ApiResponse<OwnerProfileResponse>> updateProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody OwnerProfileUpdateRequest request
    ) {
        log.info("Updating owner profile for authenticated user id={}", userPrincipal.getId());
        OwnerProfileResponse response = ownerProfileService.updateAuthenticatedOwnerProfile(
                userPrincipal.getId(),
                request
        );
        return ResponseEntity.ok(ApiResponse.success("Owner profile updated successfully", response));
    }

    /**
     * Retrieve owner profile by target user ID.
     * Enforces server-side authorization: Owners cannot access other users' profiles.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OwnerProfileResponse>> getProfileById(
            @PathVariable("id") Long targetUserId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        boolean isAdmin = userPrincipal.getRole() == Role.ROLE_ADMIN;
        OwnerProfileResponse response = ownerProfileService.getOwnerProfileById(
                userPrincipal.getId(),
                targetUserId,
                isAdmin
        );
        return ResponseEntity.ok(ApiResponse.success("Owner profile retrieved successfully", response));
    }

    /**
     * Update owner profile by target user ID.
     * Enforces server-side authorization: Owners cannot modify other users' profiles.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<OwnerProfileResponse>> updateProfileById(
            @PathVariable("id") Long targetUserId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody OwnerProfileUpdateRequest request
    ) {
        boolean isAdmin = userPrincipal.getRole() == Role.ROLE_ADMIN;
        OwnerProfileResponse response = ownerProfileService.updateOwnerProfileById(
                userPrincipal.getId(),
                targetUserId,
                isAdmin,
                request
        );
        return ResponseEntity.ok(ApiResponse.success("Owner profile updated successfully", response));
    }

    /**
     * Change password for the authenticated mess owner.
     */
    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        ownerProfileService.changePassword(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.message("Password changed successfully"));
    }
}
