package com.messmap.modules.favorite.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.messmap.modules.mess.dto.FacilityDto;
import com.messmap.modules.mess.dto.MessSummaryResponse;
import com.messmap.modules.mess.entity.FoodType;
import com.messmap.modules.mess.entity.OperatingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Data transfer object representing a bookmarked favorite mess entry.
 * Provides favorite metadata and mess summary attributes for student card views.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FavoriteResponse {

    private Long favoriteId;
    private LocalDateTime favoritedAt;

    // Mess summary fields
    private Long id;
    private Long messId;
    private String name;
    private String messName;
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
    private String status;
    private OperatingStatus operatingStatus;
    private String openingTime;
    private String closingTime;
    private String heroImage;
    private Integer capacity;
    private List<FacilityDto> facilities;
    private List<String> gallery;
    private Double rating;
    private Integer reviewCount;

    // Nested mess representation
    private MessSummaryResponse mess;
}
