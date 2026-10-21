package com.messmap.modules.user.service;

import com.messmap.common.exception.BadRequestException;
import com.messmap.common.exception.ResourceNotFoundException;
import com.messmap.modules.mess.entity.Mess;
import com.messmap.modules.mess.repository.MessRepository;
import com.messmap.modules.user.dto.ChangePasswordRequest;
import com.messmap.modules.user.dto.OwnerProfileResponse;
import com.messmap.modules.user.dto.OwnerProfileUpdateRequest;
import com.messmap.modules.user.entity.Role;
import com.messmap.modules.user.entity.User;
import com.messmap.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service managing Mess Owner profile retrieval, updates, and server-side authorization enforcement.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OwnerProfileService {

    private final UserRepository userRepository;
    private final MessRepository messRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Retrieve authenticated owner's profile along with their registered messes.
     */
    @Transactional(readOnly = true)
    public OwnerProfileResponse getAuthenticatedOwnerProfile(Long authenticatedUserId) {
        User user = findUserByIdOrThrow(authenticatedUserId);
        List<Mess> messes = messRepository.findByOwnerId(authenticatedUserId);
        return OwnerProfileResponse.fromUserAndMesses(user, messes);
    }

    /**
     * Retrieve owner profile by target user ID with strict server-side authorization check.
     * Prevents owners from viewing other owners' or students' profiles.
     */
    @Transactional(readOnly = true)
    public OwnerProfileResponse getOwnerProfileById(Long authenticatedUserId, Long targetUserId, boolean isAdmin) {
        enforceOwnerOwnership(authenticatedUserId, targetUserId, isAdmin, "view");

        User user = findUserByIdOrThrow(targetUserId);
        List<Mess> messes = messRepository.findByOwnerId(targetUserId);
        return OwnerProfileResponse.fromUserAndMesses(user, messes);
    }

    /**
     * Update authenticated owner's profile.
     */
    @Transactional
    public OwnerProfileResponse updateAuthenticatedOwnerProfile(
            Long authenticatedUserId,
            OwnerProfileUpdateRequest request
    ) {
        User user = findUserByIdOrThrow(authenticatedUserId);

        applyProfileUpdates(user, request);
        User savedUser = userRepository.save(user);
        log.info("Updated owner profile for user id={}", savedUser.getId());

        List<Mess> messes = messRepository.findByOwnerId(authenticatedUserId);
        return OwnerProfileResponse.fromUserAndMesses(savedUser, messes);
    }

    /**
     * Update owner profile by target user ID with strict server-side authorization check.
     * Prevents owners from modifying other users' profiles.
     */
    @Transactional
    public OwnerProfileResponse updateOwnerProfileById(
            Long authenticatedUserId,
            Long targetUserId,
            boolean isAdmin,
            OwnerProfileUpdateRequest request
    ) {
        enforceOwnerOwnership(authenticatedUserId, targetUserId, isAdmin, "modify");

        User user = findUserByIdOrThrow(targetUserId);
        applyProfileUpdates(user, request);
        User savedUser = userRepository.save(user);
        log.info("Updated profile for user id={} by actor id={}", savedUser.getId(), authenticatedUserId);

        List<Mess> messes = messRepository.findByOwnerId(targetUserId);
        return OwnerProfileResponse.fromUserAndMesses(savedUser, messes);
    }

    /**
     * Change owner password with current password verification.
     */
    @Transactional
    public void changePassword(Long authenticatedUserId, ChangePasswordRequest request) {
        User user = findUserByIdOrThrow(authenticatedUserId);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password does not match.");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New password and confirmation password do not match.");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new BadRequestException("New password must be different from current password.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password successfully changed for owner id={}", authenticatedUserId);
    }

    /**
     * Server-side authorization check ensuring an owner can only access/modify their own profile.
     */
    private void enforceOwnerOwnership(Long authenticatedUserId, Long targetUserId, boolean isAdmin, String action) {
        if (!isAdmin && !authenticatedUserId.equals(targetUserId)) {
            log.warn("Unauthorized profile {} attempt: actor id={} attempted on target id={}",
                    action, authenticatedUserId, targetUserId);
            throw new AccessDeniedException("Access denied: You are not authorized to " + action + " another user's profile.");
        }
    }

    private void applyProfileUpdates(User user, OwnerProfileUpdateRequest request) {
        user.setName(request.getName().trim());
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }
        if (request.getCollege() != null) {
            user.setCollege(request.getCollege().trim());
        }
        if (request.getHostel() != null) {
            user.setHostel(request.getHostel().trim());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl().trim());
        }
        // Note: Role, Email, and Status are intentionally not modified here to prevent unauthorized elevation
    }

    private User findUserByIdOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }
}
