package com.messmap.modules.mess.dto;

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
import java.util.Collections;
import java.util.List;

/**
 * Standardized response DTO representing a mess profile for the owning mess owner.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MessOwnerResponse {

    private Long id;
    private Long ownerId;
    private String ownerName;
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
    private String breakfastTiming;
    private String lunchTiming;
    private String dinnerTiming;
    private MealTimingsDto mealTimings;
    private List<FacilityDto> facilities;
    private List<String> amenities;
    private String heroImage;
    private Integer capacity;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static MessOwnerResponse fromEntity(Mess mess) {
        if (mess == null) return null;

        List<FacilityDto> facilityDtos = mess.getFacilities() != null
                ? mess.getFacilities().stream()
                .map(f -> FacilityDto.builder()
                        .id(f.getId())
                        .name(f.getName())
                        .icon(f.getIcon())
                        .build())
                .toList()
                : Collections.emptyList();

        List<String> amenityNames = mess.getFacilities() != null
                ? mess.getFacilities().stream()
                .map(f -> f.getName())
                .toList()
                : Collections.emptyList();

        MealTimingsDto mealTimings = MealTimingsDto.builder()
                .breakfast(mess.getBreakfastTiming() != null ? mess.getBreakfastTiming() : (mess.getOpeningTime() != null ? mess.getOpeningTime() : "07:30 AM – 10:00 AM"))
                .lunch(mess.getLunchTiming() != null ? mess.getLunchTiming() : "12:15 PM – 03:00 PM")
                .dinner(mess.getDinnerTiming() != null ? mess.getDinnerTiming() : (mess.getClosingTime() != null ? ("07:30 PM – " + mess.getClosingTime()) : "07:30 PM – 10:15 PM"))
                .build();

        return MessOwnerResponse.builder()
                .id(mess.getId())
                .ownerId(mess.getOwner() != null ? mess.getOwner().getId() : null)
                .ownerName(mess.getOwner() != null ? mess.getOwner().getName() : null)
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
                .breakfastTiming(mess.getBreakfastTiming())
                .lunchTiming(mess.getLunchTiming())
                .dinnerTiming(mess.getDinnerTiming())
                .mealTimings(mealTimings)
                .facilities(facilityDtos)
                .amenities(amenityNames)
                .heroImage(mess.getHeroImage())
                .capacity(mess.getCapacity())
                .rejectionReason(mess.getRejectionReason())
                .createdAt(mess.getCreatedAt())
                .updatedAt(mess.getUpdatedAt())
                .build();
    }
}
