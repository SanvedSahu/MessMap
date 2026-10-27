package com.messmap.modules.enquiry.entity;

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
 * Customer enquiry submitted by a student for a specific mess.
 */
@Entity
@Table(
        name = "enquiries",
        indexes = {
                @Index(name = "idx_enquiries_mess_id", columnList = "mess_id"),
                @Index(name = "idx_enquiries_user_id", columnList = "user_id"),
                @Index(name = "idx_enquiries_status", columnList = "status"),
                @Index(name = "idx_enquiries_created_at", columnList = "created_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enquiry extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Associated mess is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mess_id", nullable = false)
    private Mess mess;

    @NotNull(message = "Student user is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User student;

    @NotBlank(message = "Student name is required")
    @Size(max = 100)
    @Column(name = "student_name", nullable = false, length = 100)
    private String studentName;

    @Size(max = 150)
    @Column(name = "student_email", length = 150)
    private String studentEmail;

    @Size(max = 20)
    @Column(name = "student_phone", length = 20)
    private String studentPhone;

    @Size(max = 150)
    @Column(name = "student_college", length = 150)
    private String studentCollege;

    @NotBlank(message = "Category is required")
    @Size(max = 50)
    @Column(name = "category", nullable = false, length = 50)
    private String category;

    @Size(max = 50)
    @Column(name = "plan_type", length = 50)
    private String planType;

    @NotBlank(message = "Message is required")
    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "status", nullable = false, length = 30)
    private EnquiryStatus status = EnquiryStatus.NEW;

    @Column(name = "reply_notes", columnDefinition = "TEXT")
    private String replyNotes;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
}
