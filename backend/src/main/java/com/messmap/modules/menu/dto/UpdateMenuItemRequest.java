package com.messmap.modules.menu.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.messmap.modules.menu.entity.MealType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Request payload for updating an existing menu dish.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class UpdateMenuItemRequest {

    @Size(max = 20, message = "Day of week must not exceed 20 characters")
    private String dayOfWeek;

    private MealType mealType;

    @JsonAlias({"name"})
    @Size(max = 150, message = "Dish name must not exceed 150 characters")
    private String dishName;

    @Size(max = 150, message = "Item name must not exceed 150 characters")
    private String name;

    @Size(max = 255, message = "Description must not exceed 255 characters")
    private String description;

    @DecimalMin(value = "0.0", message = "Price cannot be negative")
    private BigDecimal price;

    private Boolean isAvailable;

    private Boolean isSpecial;

    public String getEffectiveDishName() {
        if (dishName != null && !dishName.isBlank()) {
            return dishName.trim();
        }
        if (name != null && !name.isBlank()) {
            return name.trim();
        }
        return null;
    }
}
