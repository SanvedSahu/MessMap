package com.messmap.modules.user.service;

import com.messmap.common.exception.DuplicateResourceException;
import com.messmap.common.exception.UnauthorizedException;
import com.messmap.modules.user.dto.AuthResponse;
import com.messmap.modules.user.dto.StudentLoginRequest;
import com.messmap.modules.user.dto.StudentProfileResponse;
import com.messmap.modules.user.dto.StudentRegisterRequest;
import com.messmap.modules.user.entity.DietaryPreference;
import com.messmap.modules.user.entity.Role;
import com.messmap.modules.user.entity.User;
import com.messmap.modules.user.entity.UserStatus;
import com.messmap.modules.user.repository.UserRepository;
import com.messmap.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service orchestrating Student registration, credential verification, and JWT issuance.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StudentAuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * Register a new student account.
     * Enforces unique email check, BCrypt password hashing, and server-side ROLE_STUDENT role assignment.
     */
    @Transactional
    public AuthResponse register(StudentRegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            log.warn("Registration rejected: email '{}' is already registered", normalizedEmail);
            throw new DuplicateResourceException("User already exists with email: '" + normalizedEmail + "'");
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(normalizedEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .role(Role.ROLE_STUDENT)
                .status(UserStatus.ACTIVE)
                .college(request.getCollege() != null ? request.getCollege().trim() : null)
                .hostel(request.getHostel() != null ? request.getHostel().trim() : null)
                .dietaryPreference(request.getDietaryPreference() != null ? request.getDietaryPreference() : DietaryPreference.VEG)
                .build();

        User savedUser = userRepository.save(user);
        log.info("Student registered successfully with id: {} and email: {}", savedUser.getId(), savedUser.getEmail());

        String token = jwtTokenProvider.generateToken(savedUser);
        return AuthResponse.of(token, jwtTokenProvider.getExpirationMs(), StudentProfileResponse.fromUser(savedUser));
    }

    /**
     * Authenticate student credentials and return a signed JWT.
     * Returns generic unauthorized error for invalid credentials without revealing email presence.
     */
    @Transactional(readOnly = true)
    public AuthResponse login(StudentLoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> {
                    log.warn("Login failed: unrecognized email '{}'", normalizedEmail);
                    return new UnauthorizedException("Invalid email or password");
                });

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Login failed: invalid password for email '{}'", normalizedEmail);
            throw new UnauthorizedException("Invalid email or password");
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            log.warn("Login rejected: user status is '{}' for email '{}'", user.getStatus(), normalizedEmail);
            throw new UnauthorizedException("Account is not active. Please contact support.");
        }

        log.info("Student successfully authenticated: id: {}, email: {}", user.getId(), user.getEmail());
        String token = jwtTokenProvider.generateToken(user);
        return AuthResponse.of(token, jwtTokenProvider.getExpirationMs(), StudentProfileResponse.fromUser(user));
    }
}
