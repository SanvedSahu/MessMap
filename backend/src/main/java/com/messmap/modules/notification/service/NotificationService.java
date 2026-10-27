package com.messmap.modules.notification.service;

import org.springframework.security.access.AccessDeniedException;
import com.messmap.common.exception.ResourceNotFoundException;
import com.messmap.modules.favorite.entity.Favorite;
import com.messmap.modules.favorite.repository.FavoriteRepository;
import com.messmap.modules.mess.entity.Mess;
import com.messmap.modules.notification.dto.NotificationResponse;
import com.messmap.modules.notification.entity.Notification;
import com.messmap.modules.notification.entity.NotificationType;
import com.messmap.modules.notification.repository.NotificationRepository;
import com.messmap.modules.user.entity.Role;
import com.messmap.modules.user.entity.User;
import com.messmap.modules.user.entity.UserStatus;
import com.messmap.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Service managing student in-app notifications for mess status changes and announcements.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final FavoriteRepository favoriteRepository;

    /**
     * Triggered when an approved mess transitions from CLOSED to OPEN.
     * Generates persistent in-app notifications for eligible active students.
     * Includes deduplication to avoid spamming if the owner rapidly toggles state.
     */
    @Transactional
    public List<Notification> createMessOpenedNotifications(Mess mess) {
        if (mess == null || mess.getId() == null) {
            return Collections.emptyList();
        }

        log.info("Generating mess-opened notifications for mess id={}, name='{}'", mess.getId(), mess.getName());

        // Target: 1. Students who favorited this mess, and 2. All active students
        List<Favorite> favorites = favoriteRepository.findByMessId(mess.getId());
        List<User> allActiveStudents = userRepository.findByRoleAndStatus(Role.ROLE_STUDENT, UserStatus.ACTIVE);

        Map<Long, User> targetStudents = new LinkedHashMap<>();

        // Add students who explicitly bookmarked this mess
        for (Favorite fav : favorites) {
            User student = fav.getUser();
            if (student != null && student.getStatus() == UserStatus.ACTIVE) {
                targetStudents.put(student.getId(), student);
            }
        }

        // Add other active students
        for (User student : allActiveStudents) {
            targetStudents.putIfAbsent(student.getId(), student);
        }

        LocalDateTime dedupWindow = LocalDateTime.now().minusHours(1);
        List<Notification> createdList = new ArrayList<>();

        String title = mess.getName() + " is Now Open!";
        String message = mess.getName() + " has opened and is now serving food. Check today's fresh menu!";

        for (User student : targetStudents.values()) {
            // Deduplicate: do not create another notification if already notified for this mess in the last hour
            boolean alreadyNotified = notificationRepository.existsByRecipientIdAndMessIdAndCreatedAtAfter(
                    student.getId(),
                    mess.getId(),
                    dedupWindow
            );

            if (!alreadyNotified) {
                Notification notif = Notification.builder()
                        .recipient(student)
                        .mess(mess)
                        .title(title)
                        .message(message)
                        .type(NotificationType.MESS_OPENED)
                        .isRead(false)
                        .build();

                createdList.add(notif);
            }
        }

        if (!createdList.isEmpty()) {
            List<Notification> saved = notificationRepository.saveAll(createdList);
            log.info("Created {} in-app notifications for mess id={}", saved.size(), mess.getId());
            return saved;
        }

        log.info("No new notifications created for mess id={} (already notified or no active recipients)", mess.getId());
        return Collections.emptyList();
    }

    /**
     * Retrieve notifications for an authenticated student, sorted newest first.
     */
    @Transactional(readOnly = true)
    public List<NotificationResponse> getStudentNotifications(Long studentId) {
        List<Notification> list = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(studentId);
        return list.stream()
                .map(NotificationResponse::fromEntity)
                .toList();
    }

    /**
     * Count unread notifications for a student.
     */
    @Transactional(readOnly = true)
    public long getUnreadCount(Long studentId) {
        return notificationRepository.countByRecipientIdAndIsReadFalse(studentId);
    }

    /**
     * Mark a single notification as read, ensuring student owns it.
     */
    @Transactional
    public NotificationResponse markAsRead(Long studentId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        if (!notification.getRecipient().getId().equals(studentId)) {
            throw new AccessDeniedException("You are not authorized to view or update another student's notifications.");
        }

        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
            notification = notificationRepository.save(notification);
        }

        return NotificationResponse.fromEntity(notification);
    }

    /**
     * Mark all unread notifications as read for a student.
     */
    @Transactional
    public int markAllAsRead(Long studentId) {
        return notificationRepository.markAllAsReadForRecipient(studentId, LocalDateTime.now());
    }
}
