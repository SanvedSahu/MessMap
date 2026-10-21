package com.messmap.modules.mess.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.messmap.modules.mess.entity.SuspensionReviewRequest;
import com.messmap.modules.mess.entity.SuspensionReviewStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Standardized DTO representing a mess suspension review request for owners and administrators.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SuspensionReviewResponse {

    private Long id;
    private Long messId;
    private String messName;
    private Long ownerId;
    private String ownerName;
    private String ownerEmail;
    private String ownerPhone;
    private String explanation;
    private SuspensionReviewStatus status;
    private String adminNotes;
    private Long reviewedByUserId;
    private String reviewedByAdminName;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static SuspensionReviewResponse fromEntity(SuspensionReviewRequest req) {
        if (req == null) return null;
        return SuspensionReviewResponse.builder()
                .id(req.getId())
                .messId(req.getMess() != null ? req.getMess().getId() : null)
                .messName(req.getMess() != null ? req.getMess().getName() : null)
                .ownerId(req.getOwner() != null ? req.getOwner().getId() : null)
                .ownerName(req.getOwner() != null ? req.getOwner().getName() : null)
                .ownerEmail(req.getOwner() != null ? req.getOwner().getEmail() : null)
                .ownerPhone(req.getOwner() != null ? req.getOwner().getPhone() : null)
                .explanation(req.getExplanation())
                .status(req.getStatus())
                .adminNotes(req.getAdminNotes())
                .reviewedByUserId(req.getReviewedBy() != null ? req.getReviewedBy().getId() : null)
                .reviewedByAdminName(req.getReviewedBy() != null ? req.getReviewedBy().getName() : null)
                .reviewedAt(req.getReviewedAt())
                .createdAt(req.getCreatedAt())
                .updatedAt(req.getUpdatedAt())
                .build();
    }
}
