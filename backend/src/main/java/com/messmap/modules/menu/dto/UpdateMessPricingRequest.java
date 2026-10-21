package com.messmap.modules.menu.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Request payload for updating mess meal and monthly-pass pricing.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class UpdateMessPricingRequest {

    private Long messId;

    @DecimalMin(value = "0.0", message = "Breakfast price cannot be negative")
    private BigDecimal breakfastPrice;

    @DecimalMin(value = "0.0", message = "Lunch price cannot be negative")
    private BigDecimal lunchPrice;

    @DecimalMin(value = "0.0", message = "Dinner price cannot be negative")
    private BigDecimal dinnerPrice;

    @DecimalMin(value = "0.0", message = "Daily price cannot be negative")
    private BigDecimal dailyPrice;

    @DecimalMin(value = "0.0", message = "Monthly price cannot be negative")
    private BigDecimal monthlyPrice;

    @DecimalMin(value = "0.0", message = "Monthly pass price cannot be negative")
    private BigDecimal monthlyPassPrice;

    public BigDecimal getEffectiveMonthlyPrice() {
        if (monthlyPrice != null) {
            return monthlyPrice;
        }
        return monthlyPassPrice;
    }
}
