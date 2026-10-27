package com.messmap.modules.notification.dto;

import com.messmap.modules.notification.entity.Notification;
import com.messmap.modules.notification.entity.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for student in-app notifications.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {

    private Long id;
    private Long messId;
    private String messName;
    private String messHeroImage;
    private String messArea;
    private String title;
    private String message;
    private NotificationType type;
    private boolean isRead;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;

    public static NotificationResponse fromEntity(Notification notification) {
        String messName = notification.getMess() != null ? notification.getMess().getName() : null;
        Long messId = notification.getMess() != null ? notification.getMess().getId() : null;
        String heroImage = notification.getMess() != null ? notification.getMess().getHeroImage() : null;
        String area = notification.getMess() != null ? notification.getMess().getArea() : null;

        return NotificationResponse.builder()
                .id(notification.getId())
                .messId(messId)
                .messName(messName)
                .messHeroImage(heroImage)
                .messArea(area)
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .isRead(notification.isRead())
                .readAt(notification.getReadAt())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
