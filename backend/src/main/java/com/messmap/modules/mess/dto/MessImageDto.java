package com.messmap.modules.mess.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data transfer object representing mess showcase and gallery photographs.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessImageDto {

    private Long id;
    private String imageUrl;
    private Boolean isPrimary;
    private String caption;
}
