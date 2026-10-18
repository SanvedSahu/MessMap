package com.messmap.modules.mess.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.messmap.common.entity.BaseEntity;
import com.messmap.modules.user.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Core Mess listing entity representing campus messes and tiffin services.
 */
@Entity
@Table(
        name = "messes",
        indexes = {
                @Index(name = "idx_messes_owner_id", columnList = "owner_id"),
                @Index(name = "idx_messes_status", columnList = "status"),
                @Index(name = "idx_messes_city", columnList = "city"),
                @Index(name = "idx_messes_area", columnList = "area"),
                @Index(name = "idx_messes_food_type", columnList = "food_type")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Mess extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Owner is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User owner;

    @NotBlank(message = "Mess name is required")
    @Size(max = 150, message = "Mess name must not exceed 150 characters")
    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Size(max = 20, message = "Phone must not exceed 20 characters")
    @Column(name = "phone", length = 20)
    private String phone;

    @Size(max = 150, message = "Email must not exceed 150 characters")
    @Column(name = "email", length = 150)
    private String email;

    @NotBlank(message = "Address is required")
    @Size(max = 255, message = "Address must not exceed 255 characters")
    @Column(name = "address", nullable = false, length = 255)
    private String address;

    @Size(max = 100, message = "Area must not exceed 100 characters")
    @Column(name = "area", length = 100)
    private String area;

    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City must not exceed 100 characters")
    @Column(name = "city", nullable = false, length = 100)
    private String city;

    @Size(max = 100, message = "State must not exceed 100 characters")
    @Column(name = "state", length = 100)
    private String state;

    @Size(max = 20, message = "Pincode must not exceed 20 characters")
    @Column(name = "pincode", length = 20)
    private String pincode;

    @DecimalMin(value = "-90.0", message = "Latitude must be >= -90.0")
    @DecimalMax(value = "90.0", message = "Latitude must be <= 90.0")
    @Column(name = "latitude", precision = 10, scale = 7)
    private BigDecimal latitude;

    @DecimalMin(value = "-180.0", message = "Longitude must be >= -180.0")
    @DecimalMax(value = "180.0", message = "Longitude must be <= 180.0")
    @Column(name = "longitude", precision = 10, scale = 7)
    private BigDecimal longitude;

    @NotNull(message = "Food type is required")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "food_type", nullable = false, length = 50)
    private FoodType foodType = FoodType.VEG_AND_NON_VEG;

    @Column(name = "daily_price", precision = 8, scale = 2)
    private BigDecimal dailyPrice;

    @Column(name = "monthly_price", precision = 8, scale = 2)
    private BigDecimal monthlyPrice;

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "status", nullable = false, length = 30)
    private MessStatus status = MessStatus.PENDING;

    @NotNull(message = "Operating status is required")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "operating_status", nullable = false, length = 30)
    private OperatingStatus operatingStatus = OperatingStatus.OPEN;

    @Size(max = 20, message = "Opening time must not exceed 20 characters")
    @Column(name = "opening_time", length = 20)
    private String openingTime;

    @Size(max = 20, message = "Closing time must not exceed 20 characters")
    @Column(name = "closing_time", length = 20)
    private String closingTime;

    @Size(max = 50, message = "Breakfast timing must not exceed 50 characters")
    @Column(name = "breakfast_timing", length = 50)
    private String breakfastTiming;

    @Size(max = 50, message = "Lunch timing must not exceed 50 characters")
    @Column(name = "lunch_timing", length = 50)
    private String lunchTiming;

    @Size(max = 50, message = "Dinner timing must not exceed 50 characters")
    @Column(name = "dinner_timing", length = 50)
    private String dinnerTiming;

    @Size(max = 255, message = "Rejection reason must not exceed 255 characters")
    @Column(name = "rejection_reason", length = 255)
    private String rejectionReason;

    @Size(max = 500, message = "Hero image URL must not exceed 500 characters")
    @Column(name = "hero_image", length = 500)
    private String heroImage;

    @Column(name = "capacity")
    private Integer capacity;

    @ManyToMany
    @JoinTable(
            name = "mess_facilities",
            joinColumns = @JoinColumn(name = "mess_id"),
            inverseJoinColumns = @JoinColumn(name = "facility_id")
    )
    @Builder.Default
    private Set<Facility> facilities = new HashSet<>();

    @OneToMany(mappedBy = "mess", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MessImage> images = new ArrayList<>();
}
