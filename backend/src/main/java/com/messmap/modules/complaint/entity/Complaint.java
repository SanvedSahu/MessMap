package com.messmap.modules.complaint.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.messmap.common.entity.BaseEntity;
import com.messmap.modules.mess.entity.Mess;
import com.messmap.modules.user.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Complaint entity representing student grievances regarding mess services.
 * Maintains an auditable grievance record without cascading deletion.
 */
@Entity
@Table(
        name = "complaints",
        indexes = {
                @Index(name = "idx_complaints_ticket_number", columnList = "ticket_number"),
                @Index(name = "idx_complaints_mess_id", columnList = "mess_id"),
                @Index(name = "idx_complaints_user_id", columnList = "user_id"),
                @Index(name = "idx_complaints_status", columnList = "status"),
                @Index(name = "idx_complaints_category", columnList = "category"),
                @Index(name = "idx_complaints_severity", columnList = "severity")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Complaint extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Ticket number is required")
    @Size(max = 50, message = "Ticket number must not exceed 50 characters")
    @Column(name = "ticket_number", nullable = false, unique = true, length = 50)
    private String ticketNumber;

    @NotNull(message = "Mess is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "mess_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Mess mess;

    @NotNull(message = "User is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User user;

    @NotBlank(message = "Subject is required")
    @Size(max = 255, message = "Subject must not exceed 255 characters")
    @Column(name = "subject", nullable = false, length = 255)
    private String subject;

    @NotNull(message = "Category is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 50)
    private ComplaintCategory category;

    @NotBlank(message = "Description is required")
    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @NotNull(message = "Severity is required")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "severity", nullable = false, length = 30)
    private ComplaintSeverity severity = ComplaintSeverity.MEDIUM;

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "status", nullable = false, length = 30)
    private ComplaintStatus status = ComplaintStatus.OPEN;

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
}
