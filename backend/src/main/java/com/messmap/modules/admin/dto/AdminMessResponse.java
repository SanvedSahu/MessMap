package com.messmap.modules.admin.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.messmap.modules.mess.entity.FoodType;
import com.messmap.modules.mess.entity.Mess;
import com.messmap.modules.mess.entity.MessStatus;
import com.messmap.modules.mess.entity.OperatingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Standard administrative DTO representing mess listings.
 * Safely exposes mess details and owner contact metadata while omitting credentials.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AdminMessResponse {

    private Long id;
    private String name;
    private String description;
    private String phone;
    private String email;
    private String address;
    private String area;
    private String city;
    private String state;
    private String pincode;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private FoodType foodType;
    private BigDecimal dailyPrice;
    private BigDecimal monthlyPrice;
    private MessStatus status;
    private OperatingStatus operatingStatus;
    private String openingTime;
    private String closingTime;
    private String rejectionReason;
    private String removalReason;
    private String heroImage;
    private Integer capacity;

    private Long ownerId;
    private String ownerName;
    private String ownerEmail;
    private String ownerPhone;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AdminMessResponse fromEntity(Mess mess) {
        if (mess == null) {
            return null;
        }

        AdminMessResponseBuilder builder = AdminMessResponse.builder()
                .id(mess.getId())
                .name(mess.getName())
                .description(mess.getDescription())
                .phone(mess.getPhone())
                .email(mess.getEmail())
                .address(mess.getAddress())
                .area(mess.getArea())
                .city(mess.getCity())
                .state(mess.getState())
                .pincode(mess.getPincode())
                .latitude(mess.getLatitude())
                .longitude(mess.getLongitude())
                .foodType(mess.getFoodType())
                .dailyPrice(mess.getDailyPrice())
                .monthlyPrice(mess.getMonthlyPrice())
                .status(mess.getStatus())
                .operatingStatus(mess.getOperatingStatus())
                .openingTime(mess.getOpeningTime())
                .closingTime(mess.getClosingTime())
                .rejectionReason(mess.getRejectionReason())
                .removalReason(mess.getRemovalReason())
                .heroImage(mess.getHeroImage())
                .capacity(mess.getCapacity())
                .createdAt(mess.getCreatedAt())
                .updatedAt(mess.getUpdatedAt());

        if (mess.getOwner() != null) {
            builder.ownerId(mess.getOwner().getId())
                    .ownerName(mess.getOwner().getName())
                    .ownerEmail(mess.getOwner().getEmail())
                    .ownerPhone(mess.getOwner().getPhone());
        }

        return builder.build();
    }
}
