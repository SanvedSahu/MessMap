package com.messmap.modules.enquiry.controller;

import com.messmap.common.dto.ApiResponse;
import com.messmap.modules.enquiry.dto.CreateEnquiryRequest;
import com.messmap.modules.enquiry.dto.EnquiryResponse;
import com.messmap.modules.enquiry.service.EnquiryService;
import com.messmap.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for student enquiry submissions and history retrieval.
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
public class StudentEnquiryController {

    private final EnquiryService enquiryService;

    /**
     * Submit an enquiry about a mess.
     * Routes: POST /api/student/enquiries, POST /api/v1/student/enquiries,
     *         POST /api/student/enquiry, POST /api/v1/student/enquiry
     */
    @PostMapping({
            "/api/student/enquiries",
            "/api/v1/student/enquiries",
            "/api/student/enquiry",
            "/api/v1/student/enquiry"
    })
    public ResponseEntity<ApiResponse<EnquiryResponse>> createEnquiry(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateEnquiryRequest request
    ) {
        log.info("POST /api/student/enquiries: studentId={}, messId={}, category='{}'",
                userPrincipal.getId(), request.getMessId(), request.getCategory());

        EnquiryResponse response = enquiryService.createEnquiry(userPrincipal.getId(), request);
        return new ResponseEntity<>(
                ApiResponse.success("Enquiry submitted successfully. The mess owner will respond shortly.", response),
                HttpStatus.CREATED
        );
    }

    /**
     * Retrieve all enquiries submitted by the authenticated student.
     * Routes: GET /api/student/enquiries, GET /api/v1/student/enquiries,
     *         GET /api/student/enquiry, GET /api/v1/student/enquiry
     */
    @GetMapping({
            "/api/student/enquiries",
            "/api/v1/student/enquiries",
            "/api/student/enquiry",
            "/api/v1/student/enquiry"
    })
    public ResponseEntity<ApiResponse<List<EnquiryResponse>>> getStudentEnquiries(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        log.info("GET /api/student/enquiries: studentId={}", userPrincipal.getId());
        List<EnquiryResponse> response = enquiryService.getStudentEnquiries(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Student enquiries retrieved successfully", response));
    }
}
