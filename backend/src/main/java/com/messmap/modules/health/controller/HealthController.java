package com.messmap.modules.health.controller;

import com.messmap.common.dto.ApiResponse;
import com.messmap.modules.health.dto.HealthResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

/**
 * Health check controller for container orchestration, CI, and client diagnostics.
 */
@RestController
@RequestMapping("/api/v1/health")
@RequiredArgsConstructor
public class HealthController {

    private final Environment environment;

    @GetMapping
    public ResponseEntity<ApiResponse<HealthResponse>> getHealth() {
        String[] activeProfiles = environment.getActiveProfiles();
        String currentEnv = activeProfiles.length > 0 ? String.join(",", activeProfiles) : "default";

        HealthResponse health = HealthResponse.builder()
                .status("UP")
                .service("MessMap Backend API")
                .version("1.0.0")
                .environment(currentEnv)
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.ok(ApiResponse.success("MessMap backend service is operational", health));
    }
}
