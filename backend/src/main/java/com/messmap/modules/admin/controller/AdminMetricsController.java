package com.messmap.modules.admin.controller;

import com.messmap.common.dto.ApiResponse;
import com.messmap.modules.admin.dto.AdminDashboardMetricsResponse;
import com.messmap.modules.admin.service.AdminMetricsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller providing administrative summary and analytics metrics.
 * Strictly restricted to authenticated users with ROLE_ADMIN.
 */
@Slf4j
@RestController
@RequestMapping({"/api/admin", "/api/v1/admin"})
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminMetricsController {

    private final AdminMetricsService adminMetricsService;

    /**
     * Retrieves high-level platform metrics to power the admin dashboard overview cards.
     * Accessible via both /api/admin/metrics and /api/admin/dashboard/summary (as well as v1 prefixed variants).
     *
     * @return Standardized ApiResponse containing AdminDashboardMetricsResponse
     */
    @GetMapping({"/metrics", "/dashboard/summary"})
    public ResponseEntity<ApiResponse<AdminDashboardMetricsResponse>> getMetrics() {
        log.info("Processing admin request for dashboard metrics");
        AdminDashboardMetricsResponse metrics = adminMetricsService.getDashboardMetrics();
        return ResponseEntity.ok(ApiResponse.success("Admin dashboard metrics retrieved successfully", metrics));
    }
}
