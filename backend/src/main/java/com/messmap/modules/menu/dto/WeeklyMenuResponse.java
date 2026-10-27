package com.messmap.modules.menu.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.util.List;
import java.util.Map;

/**
 * Data transfer object representing the 7-day weekly menu for a specific mess.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class WeeklyMenuResponse {

    private Long messId;
    private String messName;
    private List<DailyMealResponse> weeklySchedule;
    private Map<String, DailyMealResponse> scheduleByDay;
}
