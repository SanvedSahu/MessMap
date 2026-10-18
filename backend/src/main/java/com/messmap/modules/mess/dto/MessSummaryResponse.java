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
 * Summary representation of an approved mess for listing and search discovery.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MessSummaryResponse {

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
}
