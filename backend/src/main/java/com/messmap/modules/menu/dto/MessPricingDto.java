package com.messmap.modules.menu.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.messmap.modules.mess.entity.Mess;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Data transfer object representing mess meal pricing and monthly subscriptions.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MessPricingDto {

    private Long messId;
    private String messName;
    private BigDecimal breakfastPrice;
    private BigDecimal lunchPrice;
    private BigDecimal dinnerPrice;
    private BigDecimal dailyPrice;
    private BigDecimal monthlyPrice;
    private BigDecimal monthlyPassPrice;

    public static MessPricingDto fromMess(Mess mess) {
        if (mess == null) return null;
        return MessPricingDto.builder()
                .messId(mess.getId())
                .messName(mess.getName())
                .breakfastPrice(mess.getBreakfastPrice())
                .lunchPrice(mess.getLunchPrice())
                .dinnerPrice(mess.getDinnerPrice())
                .dailyPrice(mess.getDailyPrice())
                .monthlyPrice(mess.getMonthlyPrice())
                .monthlyPassPrice(mess.getMonthlyPrice())
                .build();
    }
}
