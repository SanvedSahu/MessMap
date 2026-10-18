package com.messmap.modules.user.controller;

import com.messmap.common.dto.ApiResponse;
import com.messmap.modules.user.dto.AuthResponse;
import com.messmap.modules.user.dto.LoginRequest;
import com.messmap.modules.user.dto.OwnerRegistrationRequest;
import com.messmap.modules.user.dto.UserResponse;
import com.messmap.modules.user.service.AuthService;
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
 * REST controller for user authentication and Mess Owner registration.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Register a new Mess Owner account.
     * Enforces server-controlled ROLE_MESS_OWNER role assignment.
     */
    @PostMapping("/register/owner")
    public ResponseEntity<ApiResponse<AuthResponse>> registerOwner(
            @Valid @RequestBody OwnerRegistrationRequest request
    ) {
        log.info("Received mess owner registration request for email: {}", request.getEmail());
        AuthResponse response = authService.registerOwner(request);
        return new ResponseEntity<>(
                ApiResponse.success("Mess owner registered successfully", response),
                HttpStatus.CREATED
        );
    }

    /**
     * Alias route for owner registration.
     */
    @PostMapping("/owner/register")
    public ResponseEntity<ApiResponse<AuthResponse>> registerOwnerAlias(
            @Valid @RequestBody OwnerRegistrationRequest request
    ) {
        return registerOwner(request);
    }

    /**
     * Authenticate user/owner with credentials and issue a JWT.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request
    ) {
        log.info("Received login request for email: {}", request.getEmail());
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    /**
     * Alias route for owner login.
     */
    @PostMapping("/owner/login")
    public ResponseEntity<ApiResponse<AuthResponse>> loginOwnerAlias(
            @Valid @RequestBody LoginRequest request
    ) {
        return login(request);
    }

    /**
     * Retrieve currently authenticated user's account details.
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        UserResponse response = authService.getUserById(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", response));
    }
}
