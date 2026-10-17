package com.messmap.modules.user.controller;

import com.messmap.common.dto.ApiResponse;
import com.messmap.modules.user.dto.StudentProfileResponse;
import com.messmap.modules.user.dto.StudentProfileUpdateRequest;
import com.messmap.modules.user.service.StudentProfileService;
import com.messmap.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for authenticated student profile management.
 * Supports both /api/student/profile and /api/v1/student/profile route variants.
 */
@Slf4j
@RestController
@RequiredArgsConstructor
public class StudentProfileController {

    private final StudentProfileService studentProfileService;

    /**
     * Retrieve authenticated student's profile information.
     * Accessible via GET /api/student/profile and GET /api/v1/student/profile.
     */
    @GetMapping({"/api/student/profile", "/api/v1/student/profile"})
    @PreAuthorize("hasAnyAuthority('ROLE_STUDENT', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<StudentProfileResponse>> getProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        log.info("Fetching profile for authenticated student userId: {}", userPrincipal.getId());
        StudentProfileResponse response = studentProfileService.getProfile(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Student profile retrieved successfully", response));
    }

    /**
     * Update authenticated student's profile details.
     * Accessible via PUT /api/student/profile and PUT /api/v1/student/profile.
     */
    @PutMapping({"/api/student/profile", "/api/v1/student/profile"})
    @PreAuthorize("hasAnyAuthority('ROLE_STUDENT', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<StudentProfileResponse>> updateProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody StudentProfileUpdateRequest request
    ) {
        log.info("Updating profile for authenticated student userId: {}", userPrincipal.getId());
        StudentProfileResponse response = studentProfileService.updateProfile(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Student profile updated successfully", response));
    }
}
