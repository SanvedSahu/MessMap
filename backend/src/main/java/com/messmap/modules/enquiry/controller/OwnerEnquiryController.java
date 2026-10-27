package com.messmap.modules.enquiry.controller;

import com.messmap.common.dto.ApiResponse;
import com.messmap.modules.enquiry.dto.EnquiryResponse;
import com.messmap.modules.enquiry.dto.ReplyEnquiryRequest;
import com.messmap.modules.enquiry.entity.EnquiryStatus;
import com.messmap.modules.enquiry.service.EnquiryService;
import com.messmap.modules.user.entity.Role;
import com.messmap.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for Mess Owners to view and respond to student customer enquiries.
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@PreAuthorize("hasRole('MESS_OWNER') or hasRole('ADMIN')")
public class OwnerEnquiryController {

    private final EnquiryService enquiryService;

    /**
     * Retrieve customer enquiries for the owner's mess.
     * Routes: GET /api/owner/mess/enquiries, GET /api/v1/owner/mess/enquiries,
     *         GET /api/owner/enquiries, GET /api/v1/owner/enquiries
     */
    @GetMapping({
            "/api/owner/mess/enquiries",
            "/api/v1/owner/mess/enquiries",
            "/api/owner/enquiries",
            "/api/v1/owner/enquiries"
    })
    public ResponseEntity<ApiResponse<List<EnquiryResponse>>> getOwnerEnquiries(
            @RequestParam(value = "messId", required = false) Long queryMessId,
            @RequestParam(value = "status", required = false) EnquiryStatus status,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        boolean isAdmin = userPrincipal.getRole() == Role.ROLE_ADMIN;
        log.info("GET owner mess enquiries: ownerId={}, queryMessId={}, status={}, isAdmin={}",
                userPrincipal.getId(), queryMessId, status, isAdmin);

        List<EnquiryResponse> response = enquiryService.getOwnerEnquiries(userPrincipal.getId(), queryMessId, status, isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Enquiries retrieved successfully", response));
    }

    /**
     * Retrieve customer enquiries for a specific mess by numeric ID.
     * Routes: GET /api/owner/mess/{id:[0-9]+}/enquiries, GET /api/v1/owner/mess/{id:[0-9]+}/enquiries,
     *         GET /api/owner/messes/{id:[0-9]+}/enquiries, GET /api/v1/owner/messes/{id:[0-9]+}/enquiries
     */
    @GetMapping({
            "/api/owner/mess/{id:[0-9]+}/enquiries",
            "/api/v1/owner/mess/{id:[0-9]+}/enquiries",
            "/api/owner/messes/{id:[0-9]+}/enquiries",
            "/api/v1/owner/messes/{id:[0-9]+}/enquiries"
    })
    public ResponseEntity<ApiResponse<List<EnquiryResponse>>> getOwnerEnquiriesForMess(
            @PathVariable("id") Long messId,
            @RequestParam(value = "status", required = false) EnquiryStatus status,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        boolean isAdmin = userPrincipal.getRole() == Role.ROLE_ADMIN;
        log.info("GET owner mess enquiries for mess id {}: ownerId={}, status={}, isAdmin={}",
                messId, userPrincipal.getId(), status, isAdmin);

        List<EnquiryResponse> response = enquiryService.getOwnerEnquiries(userPrincipal.getId(), messId, status, isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Enquiries retrieved successfully", response));
    }

    /**
     * Reply to or resolve a customer enquiry.
     * Routes: PUT /api/owner/mess/enquiries/{id:[0-9]+}/reply, PUT /api/v1/owner/mess/enquiries/{id:[0-9]+}/reply,
     *         PUT /api/owner/enquiries/{id:[0-9]+}/reply, PUT /api/v1/owner/enquiries/{id:[0-9]+}/reply
     */
    @PutMapping({
            "/api/owner/mess/enquiries/{id:[0-9]+}/reply",
            "/api/v1/owner/mess/enquiries/{id:[0-9]+}/reply",
            "/api/owner/enquiries/{id:[0-9]+}/reply",
            "/api/v1/owner/enquiries/{id:[0-9]+}/reply"
    })
    public ResponseEntity<ApiResponse<EnquiryResponse>> replyEnquiry(
            @PathVariable("id") Long enquiryId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ReplyEnquiryRequest request
    ) {
        boolean isAdmin = userPrincipal.getRole() == Role.ROLE_ADMIN;
        log.info("PUT owner mess enquiry reply: ownerId={}, enquiryId={}, isAdmin={}",
                userPrincipal.getId(), enquiryId, isAdmin);

        EnquiryResponse response = enquiryService.replyEnquiry(userPrincipal.getId(), enquiryId, request, isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Enquiry replied successfully", response));
    }
}
