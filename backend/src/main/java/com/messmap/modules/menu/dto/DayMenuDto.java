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
 * Data transfer object representing menu dishes for a specific day of the week, grouped by meal type.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DayMenuDto {

    private String dayOfWeek;
    private Map<String, List<MenuItemDto>> meals;
}
