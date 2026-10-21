package com.messmap.modules.user.service;

import com.messmap.common.exception.ResourceNotFoundException;
import com.messmap.modules.user.dto.StudentProfileResponse;
import com.messmap.modules.user.dto.StudentProfileUpdateRequest;
import com.messmap.modules.user.entity.User;
import com.messmap.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service managing student profile retrieval and safe profile updates.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StudentProfileService {

    private final UserRepository userRepository;

    /**
     * Retrieve student profile by user ID.
     */
    @Transactional(readOnly = true)
    public StudentProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found with id: " + userId));

        return StudentProfileResponse.fromUser(user);
    }

    /**
     * Update permitted student profile attributes (phone, college/locality, hostel, dietary preference, name, avatar).
     * Protected attributes (id, email, role, status, password) are strictly preserved and unmodifiable.
     */
    @Transactional
    public StudentProfileResponse updateProfile(Long userId, StudentProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found with id: " + userId));

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName().trim());
        }

        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }

        if (request.getCollege() != null) {
            user.setCollege(request.getCollege().trim());
        }

        if (request.getHostel() != null) {
            user.setHostel(request.getHostel().trim());
        }

        if (request.getDietaryPreference() != null) {
            user.setDietaryPreference(request.getDietaryPreference());
        }

        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl().trim());
        }

        User updatedUser = userRepository.save(user);
        log.info("Student profile updated successfully for userId: {}", updatedUser.getId());

        return StudentProfileResponse.fromUser(updatedUser);
    }
}
