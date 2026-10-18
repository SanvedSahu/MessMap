package com.messmap.modules.admin.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
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
 * Safe administrative representation of a platform user.
 * Strictly excludes passwords, hashes, and internal security credentials.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AdminUserResponse {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private Role role;
    private UserStatus status;
    private String college;
    private String hostel;
    private String avatarUrl;
    private DietaryPreference dietaryPreference;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AdminUserResponse fromEntity(User user) {
        if (user == null) {
            return null;
        }

        return AdminUserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .status(user.getStatus())
                .college(user.getCollege())
                .hostel(user.getHostel())
                .avatarUrl(user.getAvatarUrl())
                .dietaryPreference(user.getDietaryPreference())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
