package com.messmap.modules.menu.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.messmap.modules.mess.dto.MenuItemDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Standardized response DTO representing an owner's complete menu catalog,
 * organized by day of week and meal type, alongside current meal and pass pricing.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OwnerMenuResponse {

    private Long messId;
    private String messName;
    private MessPricingDto pricing;
    private Map<String, Map<String, List<MenuItemDto>>> groupedMenu;
    private List<DayMenuDto> weeklyMenu;
    private List<MenuItemDto> items;
}
