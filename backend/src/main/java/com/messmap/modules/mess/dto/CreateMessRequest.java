package com.messmap.modules.mess.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.messmap.modules.mess.entity.FoodType;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

/**
 * Request payload for creating a new mess listing profile by an authenticated mess owner.
 * Supports standard field names and common aliases (e.g. locality for area, contact for phone).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class CreateMessRequest {

    @NotBlank(message = "Mess name is required")
    @Size(max = 150, message = "Mess name must not exceed 150 characters")
    private String name;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @NotBlank(message = "Address is required")
    @Size(max = 255, message = "Address must not exceed 255 characters")
    private String address;

    @Size(max = 100, message = "Area must not exceed 100 characters")
    private String area;

    @Size(max = 100, message = "Locality must not exceed 100 characters")
    private String locality;

    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;

    @Size(max = 100, message = "State must not exceed 100 characters")
    private String state;

    @Size(max = 20, message = "Pincode must not exceed 20 characters")
    private String pincode;

    @Size(max = 20, message = "Phone must not exceed 20 characters")
    private String phone;

    @Size(max = 20, message = "Contact must not exceed 20 characters")
    private String contact;

    @Size(max = 20, message = "Contact number must not exceed 20 characters")
    private String contactNumber;

    @Email(message = "Invalid email format")
    @Size(max = 150, message = "Email must not exceed 150 characters")
    private String email;

    private String foodType;

    @DecimalMin(value = "0.0", message = "Daily price cannot be negative")
    private BigDecimal dailyPrice;

    @DecimalMin(value = "0.0", message = "Monthly price cannot be negative")
    private BigDecimal monthlyPrice;

    @Min(value = 0, message = "Capacity cannot be negative")
    private Integer capacity;

    @DecimalMin(value = "-90.0", message = "Latitude must be >= -90.0")
    @DecimalMax(value = "90.0", message = "Latitude must be <= 90.0")
    private BigDecimal latitude;

    @DecimalMin(value = "-180.0", message = "Longitude must be >= -180.0")
    @DecimalMax(value = "180.0", message = "Longitude must be <= 180.0")
    private BigDecimal longitude;

    @Size(max = 500, message = "Hero image URL must not exceed 500 characters")
    private String heroImage;

    @Size(max = 20, message = "Opening time must not exceed 20 characters")
    private String openingTime;

    @Size(max = 20, message = "Closing time must not exceed 20 characters")
    private String closingTime;

    @Size(max = 50, message = "Breakfast timing must not exceed 50 characters")
    private String breakfastTiming;

    @Size(max = 50, message = "Lunch timing must not exceed 50 characters")
    private String lunchTiming;

    @Size(max = 50, message = "Dinner timing must not exceed 50 characters")
    private String dinnerTiming;

    private Set<Long> facilityIds;

    private List<String> amenities;

    /**
     * Resolves locality/area from either field.
     */
    public String getEffectiveArea() {
        if (area != null && !area.trim().isEmpty()) {
            return area.trim();
        }
        if (locality != null && !locality.trim().isEmpty()) {
            return locality.trim();
        }
        return null;
    }

    /**
     * Resolves contact phone number from phone, contact, or contactNumber.
     */
    public String getEffectivePhone() {
        if (phone != null && !phone.trim().isEmpty()) {
            return phone.trim();
        }
        if (contact != null && !contact.trim().isEmpty()) {
            return contact.trim();
        }
        if (contactNumber != null && !contactNumber.trim().isEmpty()) {
            return contactNumber.trim();
        }
        return null;
    }

    /**
     * Resolves FoodType enum supporting VEG, NON_VEG, BOTH, PURE_VEG, VEG_AND_NON_VEG, JAIN_FRIENDLY.
     */
    public FoodType getEffectiveFoodType() {
        if (foodType == null || foodType.trim().isEmpty()) {
            return FoodType.VEG_AND_NON_VEG;
        }
        String clean = foodType.trim().toUpperCase().replace("-", "_").replace(" ", "_");
        return switch (clean) {
            case "VEG", "PURE_VEG" -> FoodType.PURE_VEG;
            case "NON_VEG", "BOTH", "VEG_AND_NON_VEG" -> FoodType.VEG_AND_NON_VEG;
            case "JAIN", "JAIN_FRIENDLY" -> FoodType.JAIN_FRIENDLY;
            default -> {
                try {
                    yield FoodType.valueOf(clean);
                } catch (IllegalArgumentException ex) {
                    yield FoodType.VEG_AND_NON_VEG;
                }
            }
        };
    }
}
