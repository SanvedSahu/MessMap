package com.messmap.modules.user.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.messmap.modules.user.entity.DietaryPreference;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request payload for updating student profile details.
 * Disallows client-side modification of protected security fields (id, email, role, status, password).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfileUpdateRequest {

    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @Size(max = 20, message = "Phone must not exceed 20 characters")
    private String phone;

    @Size(max = 150, message = "College or locality must not exceed 150 characters")
    @JsonAlias({"collegeOrLocality", "locality"})
    private String college;

    @Size(max = 100, message = "Hostel must not exceed 100 characters")
    private String hostel;

    private DietaryPreference dietaryPreference;

    @Size(max = 255, message = "Avatar URL must not exceed 255 characters")
    private String avatarUrl;

    public String getCollegeOrLocality() {
        return college;
    }

    public void setCollegeOrLocality(String collegeOrLocality) {
        this.college = collegeOrLocality;
    }
}
