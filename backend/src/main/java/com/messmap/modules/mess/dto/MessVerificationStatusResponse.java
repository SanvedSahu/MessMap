package com.messmap.modules.mess.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.messmap.modules.mess.entity.Mess;
import com.messmap.modules.mess.entity.MessStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

/**
 * Standardized response DTO representing the verification lifecycle status of a mess listing.
 * Surfaces current status, admin rejection reasons/remarks, and profile completeness readiness.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MessVerificationStatusResponse {

    private Long messId;
    private String messName;
    private MessStatus status;
    private String rejectionReason;
    private String adminRemarks;
    private boolean canSubmit;
    private List<String> missingFields;
    private LocalDateTime updatedAt;
    private LocalDateTime createdAt;

    public static MessVerificationStatusResponse fromEntity(Mess mess, List<String> missingFields) {
        if (mess == null) return null;

        List<String> effectiveMissing = missingFields != null ? missingFields : Collections.emptyList();
        boolean eligibleStatus = mess.getStatus() == MessStatus.DRAFT || mess.getStatus() == MessStatus.REJECTED;
        boolean canSubmit = eligibleStatus && effectiveMissing.isEmpty();

        return MessVerificationStatusResponse.builder()
                .messId(mess.getId())
                .messName(mess.getName())
                .status(mess.getStatus())
                .rejectionReason(mess.getRejectionReason())
                .adminRemarks(mess.getRejectionReason())
                .canSubmit(canSubmit)
                .missingFields(effectiveMissing)
                .updatedAt(mess.getUpdatedAt())
                .createdAt(mess.getCreatedAt())
                .build();
    }
}
