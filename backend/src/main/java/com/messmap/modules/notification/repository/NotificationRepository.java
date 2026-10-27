package com.messmap.modules.notification.repository;

import com.messmap.modules.notification.entity.Notification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for notifications.
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @EntityGraph(attributePaths = {"mess", "recipient"})
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);

    long countByRecipientIdAndIsReadFalse(Long recipientId);

    @EntityGraph(attributePaths = {"mess", "recipient"})
    Optional<Notification> findByIdAndRecipientId(Long id, Long recipientId);

    boolean existsByRecipientIdAndMessIdAndCreatedAtAfter(Long recipientId, Long messId, LocalDateTime after);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.recipient.id = :recipientId AND n.isRead = false")
    int markAllAsReadForRecipient(@Param("recipientId") Long recipientId, @Param("readAt") LocalDateTime readAt);
}
