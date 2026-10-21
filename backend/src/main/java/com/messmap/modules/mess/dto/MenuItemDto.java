package com.messmap.modules.mess.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.messmap.modules.menu.entity.MealType;
import com.messmap.modules.menu.entity.MenuItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Data transfer object representing active menu offerings and daily dishes.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MenuItemDto {

    private Long id;
    private String name;
    private String dishName;
    private String description;
    private MealType mealType;
    private BigDecimal price;
    private Boolean isAvailable;
    private String dayOfWeek;
    private Boolean isSpecial;

    public static MenuItemDto fromEntity(MenuItem item) {
        if (item == null) return null;
        return MenuItemDto.builder()
                .id(item.getId())
                .name(item.getName())
                .dishName(item.getName())
                .description(item.getDescription())
                .mealType(item.getMealType())
                .price(item.getPrice())
                .isAvailable(item.getIsAvailable())
                .dayOfWeek(item.getDayOfWeek())
                .isSpecial(item.getIsSpecial() != null ? item.getIsSpecial() : false)
                .build();
    }
}
