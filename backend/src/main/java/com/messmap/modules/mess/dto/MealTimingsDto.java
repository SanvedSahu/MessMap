package com.messmap.modules.mess.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data transfer object representing breakfast, lunch, and dinner operating windows.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MealTimingsDto {

    private String breakfast;
    private String lunch;
    private String dinner;
}
