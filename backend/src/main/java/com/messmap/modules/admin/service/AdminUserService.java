package com.messmap.modules.admin.service;

import com.messmap.common.dto.PagedResponse;
import com.messmap.common.exception.BadRequestException;
import com.messmap.common.exception.ResourceNotFoundException;
import com.messmap.modules.admin.dto.AdminUserResponse;
import com.messmap.modules.user.entity.Role;
import com.messmap.modules.user.entity.User;
import com.messmap.modules.user.entity.UserStatus;
import com.messmap.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service managing administrative user directory operations and role/status access control.
 * Strictly enforces self-protection rules and audit logging.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;

    /**
     * Retrieves paginated user records with optional role and status filters.
     *
     * @param role Optional Role filter
     * @param status Optional UserStatus filter
     * @param pageable Pagination and sorting specifications
     * @return PagedResponse containing safe AdminUserResponse items
     */
    @Transactional(readOnly = true)
    public PagedResponse<AdminUserResponse> getUsers(Role role, UserStatus status, Pageable pageable) {
        log.info("Fetching users directory - Role: {}, Status: {}, Page: {}, Size: {}",
                role != null ? role : "ALL",
                status != null ? status : "ALL",
                pageable.getPageNumber(),
                pageable.getPageSize());

        Page<User> usersPage;
        if (role != null && status != null) {
            usersPage = userRepository.findByRoleAndStatus(role, status, pageable);
        } else if (role != null) {
            usersPage = userRepository.findByRole(role, pageable);
        } else if (status != null) {
            usersPage = userRepository.findByStatus(status, pageable);
        } else {
            usersPage = userRepository.findAll(pageable);
        }

        Page<AdminUserResponse> responsePage = usersPage.map(AdminUserResponse::fromEntity);
        return PagedResponse.of(responsePage);
    }

    /**
     * Retrieves a detailed user record by primary key.
     *
     * @param id User primary key
     * @return Safe AdminUserResponse DTO
     */
    @Transactional(readOnly = true)
    public AdminUserResponse getUserById(Long id) {
        log.info("Fetching user details for admin inspection, id: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return AdminUserResponse.fromEntity(user);
    }

    /**
     * Updates an account's active/suspended/pending status.
     * Enforces protection preventing administrators from disabling their own account
     * or disabling the last remaining admin on the platform.
     *
     * @param id User primary key
     * @param newStatus New UserStatus to assign
     * @param reason Optional administrative note
     * @return Updated AdminUserResponse DTO
     */
    @Transactional
    public AdminUserResponse updateUserStatus(Long id, UserStatus newStatus, String reason) {
        String currentAdminEmail = getCurrentAdminIdentifier();
        log.info("Admin [{}] attempting to update status of user ID: {} to {}", currentAdminEmail, id, newStatus);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        // Protection: Admin cannot deactivate their own root administrator account
        if (user.getEmail().equalsIgnoreCase(currentAdminEmail) && newStatus != UserStatus.ACTIVE) {
            throw new BadRequestException("Administrators cannot deactivate or suspend their own account");
        }

        // Protection: Cannot deactivate the last remaining administrator
        if (user.getRole() == Role.ROLE_ADMIN && newStatus != UserStatus.ACTIVE) {
            long totalAdmins = userRepository.countByRole(Role.ROLE_ADMIN);
            if (totalAdmins <= 1) {
                throw new BadRequestException("Cannot deactivate the only administrator account on the platform");
            }
        }

        user.setStatus(newStatus);
        User savedUser = userRepository.save(user);

        log.info("AUDIT: Admin [{}] updated user [{}] (ID: {}, Role: {}) status to [{}]. Reason: {}",
                currentAdminEmail, savedUser.getEmail(), savedUser.getId(), savedUser.getRole(),
                newStatus, reason != null ? reason.trim() : "None provided");

        return AdminUserResponse.fromEntity(savedUser);
    }

    private String getCurrentAdminIdentifier() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            return auth.getName();
        }
        return "UNKNOWN_ADMIN";
    }
}
