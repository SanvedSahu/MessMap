package com.messmap.modules.notification.controller;

import com.messmap.common.dto.ApiResponse;
import com.messmap.modules.notification.dto.NotificationResponse;
import com.messmap.modules.notification.service.NotificationService;
import com.messmap.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for authenticated student in-app notifications.
 * Supports both /api/student/notifications and /api/v1/student/notifications.
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_STUDENT', 'ROLE_ADMIN')")
public class StudentNotificationController {

    private final NotificationService notificationService;

    /**
     * Retrieve all in-app notifications for the authenticated student.
     */
    @GetMapping({"/api/student/notifications", "/api/v1/student/notifications"})
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        log.info("Student userId={} fetching notifications", userPrincipal.getId());
        List<NotificationResponse> list = notificationService.getStudentNotifications(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved successfully", list));
    }

    /**
     * Get count of unread notifications for notification bell badge.
     */
    @GetMapping({"/api/student/notifications/unread-count", "/api/v1/student/notifications/unread-count"})
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        long count = notificationService.getUnreadCount(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Unread count retrieved", Map.of("count", count)));
    }

    /**
     * Mark a specific notification as read.
     */
    @PutMapping({"/api/student/notifications/{id}/read", "/api/v1/student/notifications/{id}/read"})
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        log.info("Student userId={} marking notification id={} as read", userPrincipal.getId(), id);
        NotificationResponse updated = notificationService.markAsRead(userPrincipal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", updated));
    }

    /**
     * Mark all unread notifications as read.
     */
    @PutMapping({"/api/student/notifications/read-all", "/api/v1/student/notifications/read-all"})
    public ResponseEntity<ApiResponse<Map<String, Integer>>> markAllAsRead(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        log.info("Student userId={} marking all notifications as read", userPrincipal.getId());
        int updatedCount = notificationService.markAllAsRead(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", Map.of("markedCount", updatedCount)));
    }
}
