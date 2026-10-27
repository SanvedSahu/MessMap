package com.messmap.modules.notification.controller;

import com.messmap.common.dto.ApiResponse;
import com.messmap.modules.notification.dto.NotificationResponse;
import com.messmap.modules.notification.entity.NotificationType;
import com.messmap.modules.notification.service.NotificationService;
import com.messmap.modules.user.entity.Role;
import com.messmap.modules.user.entity.UserStatus;
import com.messmap.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentNotificationControllerTest {

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private StudentNotificationController controller;

    private UserPrincipal studentPrincipal;

    @BeforeEach
    void setUp() {
        studentPrincipal = UserPrincipal.builder()
                .id(101L)
                .name("Rahul Patil")
                .email("rahul.patil@coep.ac.in")
                .role(Role.ROLE_STUDENT)
                .status(UserStatus.ACTIVE)
                .authorities(Collections.emptyList())
                .build();
    }

    @Test
    @DisplayName("getNotifications should return 200 and list of student notifications")
    void testGetNotifications() {
        NotificationResponse res = NotificationResponse.builder()
                .id(1L)
                .messId(10L)
                .messName("Annapurna Mess")
                .title("Annapurna is Open")
                .message("Serving lunch now")
                .type(NotificationType.MESS_OPENED)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        when(notificationService.getStudentNotifications(101L)).thenReturn(List.of(res));

        ResponseEntity<ApiResponse<List<NotificationResponse>>> response = controller.getNotifications(studentPrincipal);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isTrue();
        assertThat(response.getBody().getData()).hasSize(1);
        assertThat(response.getBody().getData().get(0).getTitle()).isEqualTo("Annapurna is Open");
        verify(notificationService).getStudentNotifications(101L);
    }

    @Test
    @DisplayName("getUnreadCount should return 200 and unread count map")
    void testGetUnreadCount() {
        when(notificationService.getUnreadCount(101L)).thenReturn(5L);

        ResponseEntity<ApiResponse<Map<String, Long>>> response = controller.getUnreadCount(studentPrincipal);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData().get("count")).isEqualTo(5L);
        verify(notificationService).getUnreadCount(101L);
    }

    @Test
    @DisplayName("markAsRead should return 200 and marked notification response")
    void testMarkAsRead() {
        NotificationResponse res = NotificationResponse.builder()
                .id(2L)
                .messId(10L)
                .isRead(true)
                .build();

        when(notificationService.markAsRead(101L, 2L)).thenReturn(res);

        ResponseEntity<ApiResponse<NotificationResponse>> response = controller.markAsRead(2L, studentPrincipal);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData().isRead()).isTrue();
        verify(notificationService).markAsRead(101L, 2L);
    }

    @Test
    @DisplayName("markAllAsRead should return 200 and count of marked notifications")
    void testMarkAllAsRead() {
        when(notificationService.markAllAsRead(101L)).thenReturn(3);

        ResponseEntity<ApiResponse<Map<String, Integer>>> response = controller.markAllAsRead(studentPrincipal);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData().get("markedCount")).isEqualTo(3);
        verify(notificationService).markAllAsRead(101L);
    }
}
