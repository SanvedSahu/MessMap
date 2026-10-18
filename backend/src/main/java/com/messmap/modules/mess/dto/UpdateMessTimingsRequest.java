package com.messmap.modules.mess.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request payload for updating operating timings for Breakfast, Lunch, and Dinner.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class UpdateMessTimingsRequest {

    @Size(max = 50, message = "Breakfast timing must not exceed 50 characters")
    private String breakfastTiming;

    @Size(max = 50, message = "Breakfast timing must not exceed 50 characters")
    private String breakfast;

    @Size(max = 50, message = "Lunch timing must not exceed 50 characters")
    private String lunchTiming;

    @Size(max = 50, message = "Lunch timing must not exceed 50 characters")
    private String lunch;

    @Size(max = 50, message = "Dinner timing must not exceed 50 characters")
    private String dinnerTiming;

    @Size(max = 50, message = "Dinner timing must not exceed 50 characters")
    private String dinner;

    @Size(max = 20, message = "Opening time must not exceed 20 characters")
    private String openingTime;

    @Size(max = 20, message = "Closing time must not exceed 20 characters")
    private String closingTime;

    @Size(max = 100, message = "Days active must not exceed 100 characters")
    private String daysActive;

    public String getEffectiveBreakfast() {
        if (breakfastTiming != null && !breakfastTiming.trim().isEmpty()) {
            return breakfastTiming.trim();
        }
        if (breakfast != null && !breakfast.trim().isEmpty()) {
            return breakfast.trim();
        }
        return null;
    }

    public String getEffectiveLunch() {
        if (lunchTiming != null && !lunchTiming.trim().isEmpty()) {
            return lunchTiming.trim();
        }
        if (lunch != null && !lunch.trim().isEmpty()) {
            return lunch.trim();
        }
        return null;
    }

    public String getEffectiveDinner() {
        if (dinnerTiming != null && !dinnerTiming.trim().isEmpty()) {
            return dinnerTiming.trim();
        }
        if (dinner != null && !dinner.trim().isEmpty()) {
            return dinner.trim();
        }
        return null;
    }
}
