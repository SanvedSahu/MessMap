package com.messmap.modules.notification.service;

import org.springframework.security.access.AccessDeniedException;
import com.messmap.common.exception.ResourceNotFoundException;
import com.messmap.modules.favorite.entity.Favorite;
import com.messmap.modules.favorite.repository.FavoriteRepository;
import com.messmap.modules.mess.entity.Mess;
import com.messmap.modules.mess.entity.MessStatus;
import com.messmap.modules.mess.entity.OperatingStatus;
import com.messmap.modules.notification.dto.NotificationResponse;
import com.messmap.modules.notification.entity.Notification;
import com.messmap.modules.notification.entity.NotificationType;
import com.messmap.modules.notification.repository.NotificationRepository;
import com.messmap.modules.user.entity.Role;
import com.messmap.modules.user.entity.User;
import com.messmap.modules.user.entity.UserStatus;
import com.messmap.modules.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FavoriteRepository favoriteRepository;

    @InjectMocks
    private NotificationService notificationService;

    private User student1;
    private User student2;
    private Mess mess;

    @BeforeEach
    void setUp() {
        student1 = User.builder()
                .id(101L)
                .name("Rahul Patil")
                .email("rahul.patil@coep.ac.in")
                .role(Role.ROLE_STUDENT)
                .status(UserStatus.ACTIVE)
                .build();

        student2 = User.builder()
                .id(102L)
                .name("Ananya Joshi")
                .email("ananya.joshi@pict.ac.in")
                .role(Role.ROLE_STUDENT)
                .status(UserStatus.ACTIVE)
                .build();

        mess = Mess.builder()
                .id(1L)
                .name("Annapurna Pure Veg Mess")
                .status(MessStatus.APPROVED)
                .operatingStatus(OperatingStatus.OPEN)
                .build();
    }

    @Test
    @DisplayName("createMessOpenedNotifications should create notifications for bookmarked and active students")
    void testCreateMessOpenedNotifications_Success() {
        Favorite favorite = Favorite.builder()
                .id(1L)
                .user(student1)
                .mess(mess)
                .build();

        when(favoriteRepository.findByMessId(1L)).thenReturn(List.of(favorite));
        when(userRepository.findByRoleAndStatus(Role.ROLE_STUDENT, UserStatus.ACTIVE))
                .thenReturn(List.of(student1, student2));
        when(notificationRepository.existsByRecipientIdAndMessIdAndCreatedAtAfter(any(), eq(1L), any()))
                .thenReturn(false);
        when(notificationRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

        List<Notification> created = notificationService.createMessOpenedNotifications(mess);

        assertThat(created).hasSize(2);
        assertThat(created.get(0).getTitle()).contains("Annapurna Pure Veg Mess");
        assertThat(created.get(0).getType()).isEqualTo(NotificationType.MESS_OPENED);
        assertThat(created.get(0).isRead()).isFalse();

        verify(notificationRepository, times(1)).saveAll(any());
    }

    @Test
    @DisplayName("createMessOpenedNotifications should deduplicate if student was notified within the last hour")
    void testCreateMessOpenedNotifications_Deduplication() {
        when(favoriteRepository.findByMessId(1L)).thenReturn(Collections.emptyList());
        when(userRepository.findByRoleAndStatus(Role.ROLE_STUDENT, UserStatus.ACTIVE))
                .thenReturn(List.of(student1));
        when(notificationRepository.existsByRecipientIdAndMessIdAndCreatedAtAfter(eq(101L), eq(1L), any()))
                .thenReturn(true);

        List<Notification> created = notificationService.createMessOpenedNotifications(mess);

        assertThat(created).isEmpty();
        verify(notificationRepository, never()).saveAll(any());
    }

    @Test
    @DisplayName("getStudentNotifications should return responses sorted newest first")
    void testGetStudentNotifications() {
        Notification n1 = Notification.builder()
                .id(1L)
                .recipient(student1)
                .mess(mess)
                .title("Annapurna is Open")
                .message("Serving lunch now")
                .type(NotificationType.MESS_OPENED)
                .isRead(false)
                .build();
        n1.setCreatedAt(LocalDateTime.now());

        when(notificationRepository.findByRecipientIdOrderByCreatedAtDesc(101L)).thenReturn(List.of(n1));

        List<NotificationResponse> result = notificationService.getStudentNotifications(101L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Annapurna is Open");
        assertThat(result.get(0).getMessName()).isEqualTo("Annapurna Pure Veg Mess");
        assertThat(result.get(0).isRead()).isFalse();
    }

    @Test
    @DisplayName("getUnreadCount should return unread notification count for student")
    void testGetUnreadCount() {
        when(notificationRepository.countByRecipientIdAndIsReadFalse(101L)).thenReturn(3L);

        long count = notificationService.getUnreadCount(101L);

        assertThat(count).isEqualTo(3L);
        verify(notificationRepository).countByRecipientIdAndIsReadFalse(101L);
    }

    @Test
    @DisplayName("markAsRead should succeed when student owns the notification")
    void testMarkAsRead_Success() {
        Notification n = Notification.builder()
                .id(10L)
                .recipient(student1)
                .mess(mess)
                .title("Mess Open")
                .isRead(false)
                .build();

        when(notificationRepository.findById(10L)).thenReturn(Optional.of(n));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> i.getArgument(0));

        NotificationResponse response = notificationService.markAsRead(101L, 10L);

        assertThat(response.isRead()).isTrue();
        verify(notificationRepository).save(n);
    }

    @Test
    @DisplayName("markAsRead should throw AccessDeniedException when student attempts to access another's notification")
    void testMarkAsRead_AccessDenied() {
        Notification n = Notification.builder()
                .id(10L)
                .recipient(student2) // Owned by student 102
                .mess(mess)
                .title("Mess Open")
                .isRead(false)
                .build();

        when(notificationRepository.findById(10L)).thenReturn(Optional.of(n));

        assertThatThrownBy(() -> notificationService.markAsRead(101L, 10L)) // Requested by student 101
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("not authorized");

        verify(notificationRepository, never()).save(any());
    }

    @Test
    @DisplayName("markAsRead should throw ResourceNotFoundException when notification ID does not exist")
    void testMarkAsRead_NotFound() {
        when(notificationRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> notificationService.markAsRead(101L, 999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("not found");
    }

    @Test
    @DisplayName("markAllAsRead should call repository method to update all unread notifications")
    void testMarkAllAsRead() {
        when(notificationRepository.markAllAsReadForRecipient(eq(101L), any())).thenReturn(4);

        int updatedCount = notificationService.markAllAsRead(101L);

        assertThat(updatedCount).isEqualTo(4);
        verify(notificationRepository).markAllAsReadForRecipient(eq(101L), any());
    }
}
