package com.messmap.modules.user.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.messmap.modules.mess.entity.FoodType;
import com.messmap.modules.mess.entity.Mess;
import com.messmap.modules.mess.entity.MessStatus;
import com.messmap.modules.mess.entity.OperatingStatus;
import com.messmap.modules.user.entity.Role;
import com.messmap.modules.user.entity.User;
import com.messmap.modules.user.entity.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

/**
 * Detailed owner profile response, optionally including summarized owned messes.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OwnerProfileResponse {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private Role role;
    private UserStatus status;
    private String college;
    private String hostel;
    private String avatarUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Builder.Default
    private List<OwnerMessSummary> messes = Collections.emptyList();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class OwnerMessSummary {
        private Long id;
        private String name;
        private String description;
        private String address;
        private String area;
        private String city;
        private FoodType foodType;
        private BigDecimal monthlyPrice;
        private BigDecimal dailyPrice;
        private MessStatus status;
        private OperatingStatus operatingStatus;
        private String openingTime;
        private String closingTime;
        private String breakfastTiming;
        private String lunchTiming;
        private String dinnerTiming;
        private String heroImage;

        public static OwnerMessSummary fromEntity(Mess mess) {
            if (mess == null) return null;
            return OwnerMessSummary.builder()
                    .id(mess.getId())
                    .name(mess.getName())
                    .description(mess.getDescription())
                    .address(mess.getAddress())
                    .area(mess.getArea())
                    .city(mess.getCity())
                    .foodType(mess.getFoodType())
                    .monthlyPrice(mess.getMonthlyPrice())
                    .dailyPrice(mess.getDailyPrice())
                    .status(mess.getStatus())
                    .operatingStatus(mess.getOperatingStatus())
                    .openingTime(mess.getOpeningTime())
                    .closingTime(mess.getClosingTime())
                    .breakfastTiming(mess.getBreakfastTiming())
                    .lunchTiming(mess.getLunchTiming())
                    .dinnerTiming(mess.getDinnerTiming())
                    .heroImage(mess.getHeroImage())
                    .build();
        }
    }

    public static OwnerProfileResponse fromUser(User user) {
        return fromUserAndMesses(user, Collections.emptyList());
    }

    public static OwnerProfileResponse fromUserAndMesses(User user, List<Mess> messes) {
        if (user == null) {
            return null;
        }

        List<OwnerMessSummary> messSummaries = (messes == null || messes.isEmpty())
                ? Collections.emptyList()
                : messes.stream().map(OwnerMessSummary::fromEntity).toList();

        return OwnerProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .status(user.getStatus())
                .college(user.getCollege())
                .hostel(user.getHostel())
                .avatarUrl(user.getAvatarUrl())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .messes(messSummaries)
                .build();
    }
}
