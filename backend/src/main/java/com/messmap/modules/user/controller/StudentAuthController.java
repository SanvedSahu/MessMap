package com.messmap.modules.user.controller;

import com.messmap.common.dto.ApiResponse;
import com.messmap.modules.user.dto.AuthResponse;
import com.messmap.modules.user.dto.StudentLoginRequest;
import com.messmap.modules.user.dto.StudentRegisterRequest;
import com.messmap.modules.user.service.StudentAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller providing student registration and authentication endpoints.
 * Supports both /api/auth/student/... and /api/v1/auth/student/... route variants.
 */
@Slf4j
@RestController
@RequiredArgsConstructor
public class StudentAuthController {

    private final StudentAuthService studentAuthService;

    /**
     * Register a new Student account.
     * Accessible via POST /api/auth/student/register and POST /api/v1/auth/student/register.
     */
    @PostMapping({"/api/auth/student/register", "/api/v1/auth/student/register"})
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody StudentRegisterRequest request
    ) {
        log.info("Received student registration request for email: {}", request.getEmail());
        AuthResponse response = studentAuthService.register(request);
        return new ResponseEntity<>(
                ApiResponse.success("Student registered successfully", response),
                HttpStatus.CREATED
        );
    }

    /**
     * Authenticate student credentials and return a signed JWT.
     * Accessible via POST /api/auth/student/login and POST /api/v1/auth/student/login.
     */
    @PostMapping({"/api/auth/student/login", "/api/v1/auth/student/login"})
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody StudentLoginRequest request
    ) {
        log.info("Received student login request for email: {}", request.getEmail());
        AuthResponse response = studentAuthService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }
}
