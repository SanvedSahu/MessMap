package com.messmap.modules.mess.dto;

import com.messmap.modules.menu.entity.MealType;
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
public class MenuItemDto {

    private Long id;
    private String name;
    private String description;
    private MealType mealType;
    private BigDecimal price;
    private Boolean isAvailable;
    private String dayOfWeek;
}
