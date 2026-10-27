package com.messmap.modules.menu.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.messmap.modules.mess.dto.MenuItemDto;
import lombok.*;

import java.util.List;
import java.util.Map;

/**
 * Data transfer object representing the saved menu for a specific mess and day.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyMealResponse {

    private Long messId;
    private String messName;
    private String dayOfWeek;
    private String breakfast;
    private String lunch;
    private String dinner;
    private List<MenuItemDto> breakfastItems;
    private List<MenuItemDto> lunchItems;
    private List<MenuItemDto> dinnerItems;
    private Map<String, List<MenuItemDto>> meals;
}
