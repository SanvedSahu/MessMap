package com.messmap.modules.menu.dto;

import com.messmap.modules.menu.entity.MealType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

/**
 * Payload for updating or creating dishes for a specific day and meal type.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateDailyMealRequest {

    private Long messId;

    @NotBlank(message = "Day of week is required")
    private String dayOfWeek;

    @NotNull(message = "Meal type is required")
    private MealType mealType;

    @NotBlank(message = "Dishes cannot be blank")
    private String dishes;

    private String description;

    private BigDecimal price;

    private Boolean isAvailable;

    private Boolean isSpecial;
}
