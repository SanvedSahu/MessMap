package com.messmap.modules.user.dto;

import com.messmap.modules.user.entity.DietaryPreference;
import com.messmap.modules.user.entity.Role;
import com.messmap.modules.user.entity.User;
import com.messmap.modules.user.entity.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Safe student profile representation without sensitive credentials.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfileResponse {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private Role role;
    private UserStatus status;
    private String college;
    private String collegeOrLocality;
    private String hostel;
    private DietaryPreference dietaryPreference;
    private String avatarUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static StudentProfileResponse fromUser(User user) {
        if (user == null) {
            return null;
        }
        return StudentProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .status(user.getStatus())
                .college(user.getCollege())
                .collegeOrLocality(user.getCollege())
                .hostel(user.getHostel())
                .dietaryPreference(user.getDietaryPreference() != null ? user.getDietaryPreference() : DietaryPreference.VEG)
                .avatarUrl(user.getAvatarUrl())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
