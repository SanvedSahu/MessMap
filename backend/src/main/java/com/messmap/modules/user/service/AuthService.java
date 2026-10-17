package com.messmap.modules.user.service;

import com.messmap.common.exception.DuplicateResourceException;
import com.messmap.common.exception.ResourceNotFoundException;
import com.messmap.common.exception.UnauthorizedException;
import com.messmap.modules.user.dto.AuthResponse;
import com.messmap.modules.user.dto.LoginRequest;
import com.messmap.modules.user.dto.OwnerRegistrationRequest;
import com.messmap.modules.user.dto.UserResponse;
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
 * Service managing user authentication, owner registration, and identity tokens.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    /**
     * Registers a new Mess Owner account with server-controlled role assignment and password hashing.
     */
    @Transactional
    public AuthResponse registerOwner(OwnerRegistrationRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        // 1. Duplicate email protection
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new DuplicateResourceException("An account with email " + normalizedEmail + " already exists.");
        }

        // 2. Build User entity with server-controlled ROLE_MESS_OWNER role
        User owner = User.builder()
                .name(request.getName().trim())
                .email(normalizedEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .role(Role.ROLE_MESS_OWNER) // Server-controlled role assignment
                .status(UserStatus.ACTIVE)
                .college(request.getCollege() != null ? request.getCollege().trim() : null)
                .hostel(request.getHostel() != null ? request.getHostel().trim() : null)
                .avatarUrl(request.getAvatarUrl() != null ? request.getAvatarUrl().trim() : null)
                .build();

        User savedOwner = userRepository.save(owner);
        log.info("Successfully registered mess owner account id={}, email={}", savedOwner.getId(), savedOwner.getEmail());

        // 3. Issue authentication token
        String token = tokenProvider.generateToken(savedOwner);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getExpirationMs())
                .user(UserResponse.fromEntity(savedOwner))
                .build();
    }

    /**
     * Authenticates an existing user and returns a signed JWT.
     */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Failed login attempt for email: {}", normalizedEmail);
            throw new UnauthorizedException("Invalid email or password.");
        }

        if (user.getStatus() == UserStatus.SUSPENDED) {
            log.warn("Login attempt for suspended user id: {}", user.getId());
            throw new UnauthorizedException("Your account has been suspended. Please contact platform administrators.");
        }

        log.info("User logged in successfully id={}, role={}", user.getId(), user.getRole());
        String token = tokenProvider.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getExpirationMs())
                .user(UserResponse.fromEntity(user))
                .build();
    }

    /**
     * Get current user details by user ID.
     */
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return UserResponse.fromEntity(user);
    }
}
