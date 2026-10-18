package com.messmap.modules.user.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.messmap.modules.user.entity.DietaryPreference;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request payload for Student account registration.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentRegisterRequest {

    @NotBlank(message = "Full name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 150, message = "Email must not exceed 150 characters")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @Size(max = 20, message = "Phone must not exceed 20 characters")
    private String phone;

    @Size(max = 150, message = "College or locality must not exceed 150 characters")
    @JsonAlias({"collegeOrLocality", "locality"})
    private String college;

    @Size(max = 100, message = "Hostel must not exceed 100 characters")
    private String hostel;

    @Builder.Default
    private DietaryPreference dietaryPreference = DietaryPreference.VEG;

    public String getCollegeOrLocality() {
        return college;
    }

    public void setCollegeOrLocality(String collegeOrLocality) {
        this.college = collegeOrLocality;
    }
}
