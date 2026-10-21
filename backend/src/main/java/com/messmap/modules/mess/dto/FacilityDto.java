package com.messmap.modules.mess.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data transfer object representing mess amenities and facilities.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FacilityDto {

    private Long id;
    private String name;
    private String icon;
}
