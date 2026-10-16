package com.messmap.modules.menu.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.messmap.common.entity.BaseEntity;
import com.messmap.modules.mess.entity.Mess;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;

/**
 * Dish or menu item offered by a mess.
 */
@Entity
@Table(
        name = "menu_items",
        indexes = {
                @Index(name = "idx_menu_items_mess_id", columnList = "mess_id"),
                @Index(name = "idx_menu_items_meal_type", columnList = "meal_type"),
                @Index(name = "idx_menu_items_available", columnList = "is_available")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuItem extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Mess is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "mess_id", nullable = false)
    @JsonIgnore
    private Mess mess;

    @NotBlank(message = "Item name is required")
    @Size(max = 150, message = "Item name must not exceed 150 characters")
    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Size(max = 255, message = "Description must not exceed 255 characters")
    @Column(name = "description", length = 255)
    private String description;

    @NotNull(message = "Meal type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "meal_type", nullable = false, length = 30)
    private MealType mealType;

    @Column(name = "price", precision = 8, scale = 2)
    private BigDecimal price;

    @Builder.Default
    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable = true;

    @Size(max = 20, message = "Day of week must not exceed 20 characters")
    @Column(name = "day_of_week", length = 20)
    private String dayOfWeek;
}
