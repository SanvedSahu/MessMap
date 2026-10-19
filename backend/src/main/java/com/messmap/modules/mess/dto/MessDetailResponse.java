package com.messmap.modules.mess.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.messmap.modules.mess.entity.FoodType;
import com.messmap.modules.mess.entity.OperatingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Detailed profile of an approved mess listing, including amenities, timings, images, and active menus.
 * Sensitive owner credentials and internal administrative fields are strictly excluded.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MessDetailResponse {

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
    private BigDecimal breakfastPrice;
    private BigDecimal lunchPrice;
    private BigDecimal dinnerPrice;
    private String status;
    private OperatingStatus operatingStatus;
    private String openingTime;
    private String closingTime;
    private MealTimingsDto mealTimings;
    private String heroImage;
    private Integer capacity;
    private String ownerName;
    private List<FacilityDto> facilities;
    private List<MessImageDto> images;
    private List<String> gallery;
    private List<MenuItemDto> menuItems;
    private Double rating;
    private Integer reviewCount;
}
