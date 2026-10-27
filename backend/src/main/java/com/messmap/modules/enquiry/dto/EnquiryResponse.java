package com.messmap.modules.enquiry.dto;

import com.messmap.modules.enquiry.entity.Enquiry;
import com.messmap.modules.enquiry.entity.EnquiryStatus;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Standardized API response for customer enquiry records.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnquiryResponse {

    private Long id;
    private Long messId;
    private String messName;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String studentPhone;
    private String studentCollege;
    private String category;
    private String planType;
    private String message;
    private EnquiryStatus status;
    private String replyNotes;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;

    public static EnquiryResponse fromEntity(Enquiry entity) {
        if (entity == null) return null;
        return EnquiryResponse.builder()
                .id(entity.getId())
                .messId(entity.getMess() != null ? entity.getMess().getId() : null)
                .messName(entity.getMess() != null ? entity.getMess().getName() : null)
                .studentId(entity.getStudent() != null ? entity.getStudent().getId() : null)
                .studentName(entity.getStudentName())
                .studentEmail(entity.getStudentEmail())
                .studentPhone(entity.getStudentPhone())
                .studentCollege(entity.getStudentCollege())
                .category(entity.getCategory())
                .planType(entity.getPlanType())
                .message(entity.getMessage())
                .status(entity.getStatus())
                .replyNotes(entity.getReplyNotes())
                .createdAt(entity.getCreatedAt())
                .resolvedAt(entity.getResolvedAt())
                .build();
    }
}
