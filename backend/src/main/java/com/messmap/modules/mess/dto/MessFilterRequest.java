package com.messmap.modules.mess.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Filter parameters for searching and discovering approved messes.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessFilterRequest {

    /**
     * Search keyword matching mess name, area, or address.
     */
    private String search;

    /**
     * Dietary preference: VEG, NON_VEG, or BOTH (also supports PURE_VEG, VEG_AND_NON_VEG, JAIN_FRIENDLY).
     */
    private String foodType;

    /**
     * Locality matching mess area or address.
     */
    private String locality;

    /**
     * City name (case-insensitive).
     */
    private String city;

    /**
     * Minimum price filter.
     */
    private BigDecimal minPrice;

    /**
     * Maximum price filter.
     */
    private BigDecimal maxPrice;
}
