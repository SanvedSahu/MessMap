package com.messmap.modules.admin.controller;

import com.messmap.common.dto.ApiResponse;
import com.messmap.common.dto.PagedResponse;
import com.messmap.modules.admin.dto.AdminUserResponse;
import com.messmap.modules.admin.dto.UpdateUserStatusRequest;
import com.messmap.modules.admin.service.AdminUserService;
import com.messmap.modules.user.entity.Role;
import com.messmap.modules.user.entity.UserStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller providing administrative user directory management and account access control.
 * Strictly restricted to authenticated users with ROLE_ADMIN authority.
 */
@Slf4j
@RestController
@RequestMapping({"/api/admin/users", "/api/v1/admin/users"})
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    /**
     * Lists platform users with pagination and filtering by role and status.
     * Accessible via GET /api/admin/users?role=ROLE_STUDENT&status=ACTIVE&page=0&size=10
     *
     * @param role Optional Role filter
     * @param status Optional UserStatus filter
     * @param page Page index (0-based, default 0)
     * @param size Page size (default 10)
     * @param sortBy Field to sort by (default 'createdAt')
     * @param direction Sort direction ('asc' or 'desc', default 'desc')
     * @return Standardized ApiResponse containing PagedResponse of AdminUserResponse DTOs
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<AdminUserResponse>>> getUsers(
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        log.info("Processing admin request for user directory - Role: {}, Status: {}, Page: {}, Size: {}",
                role, status, page, size);

        Sort.Direction sortDirection = direction.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), Sort.by(sortDirection, sortBy));

        PagedResponse<AdminUserResponse> users = adminUserService.getUsers(role, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Users directory retrieved successfully", users));
    }

    /**
     * Retrieves detailed profile and metadata for a specific user account.
     * Accessible via GET /api/admin/users/{id}
     *
     * @param id User primary key
     * @return Standardized ApiResponse containing safe AdminUserResponse
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminUserResponse>> getUserById(@PathVariable Long id) {
        log.info("Processing admin request for user profile ID: {}", id);
        AdminUserResponse user = adminUserService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success("User profile retrieved successfully", user));
    }

    /**
     * Updates an account's operational status (e.g. ACTIVE, SUSPENDED, PENDING_VERIFICATION).
     * Accessible via PUT /api/admin/users/{id}/status
     *
     * @param id User primary key
     * @param request Validated payload containing new status and optional note
     * @return Standardized ApiResponse containing updated AdminUserResponse
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AdminUserResponse>> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserStatusRequest request) {

        log.info("Processing admin request to update user ID: {} status to: {}", id, request.getStatus());
        AdminUserResponse updatedUser = adminUserService.updateUserStatus(id, request.getStatus(), request.getReason());
        return ResponseEntity.ok(ApiResponse.success("User status updated successfully", updatedUser));
    }
}
