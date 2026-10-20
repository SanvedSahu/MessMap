package com.messmap.modules.user.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.messmap.modules.user.dto.LoginRequest;
import com.messmap.modules.user.dto.OwnerRegistrationRequest;
import com.messmap.modules.user.entity.Role;
import com.messmap.modules.user.entity.User;
import com.messmap.modules.user.entity.UserStatus;
import com.messmap.modules.user.repository.UserRepository;
import com.messmap.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @BeforeEach
    void setUp() {
        // Clean any test users that might conflict
        userRepository.findByEmail("newowner@messmap.com").ifPresent(userRepository::delete);
        userRepository.findByEmail("existingowner@messmap.com").ifPresent(userRepository::delete);
    }

    @Test
    @DisplayName("POST /api/v1/auth/register/owner - should successfully register mess owner with server-controlled role and hashed password")
    void shouldRegisterMessOwnerSuccessfully() throws Exception {
        OwnerRegistrationRequest request = OwnerRegistrationRequest.builder()
                .name("Suresh Patil")
                .email("newowner@messmap.com")
                .password("securePassword123")
                .phone("+91 98220 12345")
                .college("Pune University")
                .build();

        mockMvc.perform(post("/api/v1/auth/register/owner")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", containsString("registered successfully")))
                .andExpect(jsonPath("$.data.token", notNullValue()))
                .andExpect(jsonPath("$.data.tokenType", is("Bearer")))
                .andExpect(jsonPath("$.data.user.name", is("Suresh Patil")))
                .andExpect(jsonPath("$.data.user.email", is("newowner@messmap.com")))
                .andExpect(jsonPath("$.data.user.role", is("ROLE_MESS_OWNER")))
                .andExpect(jsonPath("$.data.user.status", is("ACTIVE")));

        // Verify database persistence and password hashing
        User savedUser = userRepository.findByEmail("newowner@messmap.com").orElse(null);
        assertThat(savedUser).isNotNull();
        assertThat(savedUser.getRole()).isEqualTo(Role.ROLE_MESS_OWNER);
        assertThat(savedUser.getPassword()).isNotEqualTo("securePassword123");
        assertThat(passwordEncoder.matches("securePassword123", savedUser.getPassword())).isTrue();
    }

    @Test
    @DisplayName("POST /api/v1/auth/register/owner - should reject duplicate email with HTTP 409 Conflict")
    void shouldRejectDuplicateEmail() throws Exception {
        // Pre-create an existing user
        User existing = User.builder()
                .name("Existing Owner")
                .email("existingowner@messmap.com")
                .password(passwordEncoder.encode("existingPass123"))
                .role(Role.ROLE_MESS_OWNER)
                .status(UserStatus.ACTIVE)
                .build();
        userRepository.save(existing);

        OwnerRegistrationRequest duplicateRequest = OwnerRegistrationRequest.builder()
                .name("Duplicate Attempt")
                .email("existingowner@messmap.com")
                .password("anotherPassword123")
                .build();

        mockMvc.perform(post("/api/v1/auth/register/owner")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicateRequest)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.status", is(409)))
                .andExpect(jsonPath("$.message", containsString("already exists")));
    }

    @Test
    @DisplayName("POST /api/v1/auth/register/owner - should fail with HTTP 400 when validation constraints are violated")
    void shouldFailValidationOnInvalidInput() throws Exception {
        OwnerRegistrationRequest invalidRequest = OwnerRegistrationRequest.builder()
                .name("") // Blank name
                .email("not-a-valid-email") // Invalid email
                .password("123") // Too short (< 6 chars)
                .build();

        mockMvc.perform(post("/api/v1/auth/register/owner")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.details", notNullValue()));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login - should authenticate valid owner credentials and return JWT token")
    void shouldLoginSuccessfullyWithValidCredentials() throws Exception {
        User user = User.builder()
                .name("Valid Owner")
                .email("loginowner@messmap.com")
                .password(passwordEncoder.encode("correctPassword123"))
                .role(Role.ROLE_MESS_OWNER)
                .status(UserStatus.ACTIVE)
                .build();
        userRepository.save(user);

        LoginRequest loginRequest = LoginRequest.builder()
                .email("loginowner@messmap.com")
                .password("correctPassword123")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.token", notNullValue()))
                .andExpect(jsonPath("$.data.user.email", is("loginowner@messmap.com")))
                .andExpect(jsonPath("$.data.user.role", is("ROLE_MESS_OWNER")));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login - should reject invalid password with HTTP 401")
    void shouldRejectInvalidPassword() throws Exception {
        User user = User.builder()
                .name("Valid Owner")
                .email("logincheck@messmap.com")
                .password(passwordEncoder.encode("correctPassword123"))
                .role(Role.ROLE_MESS_OWNER)
                .status(UserStatus.ACTIVE)
                .build();
        userRepository.save(user);

        LoginRequest loginRequest = LoginRequest.builder()
                .email("logincheck@messmap.com")
                .password("wrongPassword123")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.status", is(401)));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login - should reject non-existent user with HTTP 401")
    void shouldRejectNonExistentUser() throws Exception {
        LoginRequest loginRequest = LoginRequest.builder()
                .email("doesnotexist@messmap.com")
                .password("somePassword123")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)));
    }

    @Test
    @DisplayName("GET /api/v1/auth/me - should return authenticated user info when bearer token is present")
    void shouldReturnAuthenticatedUserInfo() throws Exception {
        User user = User.builder()
                .name("Me Owner")
                .email("me@messmap.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.ROLE_MESS_OWNER)
                .status(UserStatus.ACTIVE)
                .build();
        User saved = userRepository.save(user);
        String token = tokenProvider.generateToken(saved);

        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.email", is("me@messmap.com")))
                .andExpect(jsonPath("$.data.id", is(saved.getId().intValue())));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login - should authenticate seeded administrator and issue genuine JWT with ROLE_ADMIN")
    void shouldAuthenticateAdminWithRealJwt() throws Exception {
        User adminUser = userRepository.findByEmail("admin@messmap.com")
                .orElseGet(() -> User.builder()
                        .name("Platform Administrator")
                        .email("admin@messmap.com")
                        .build());
        adminUser.setPassword(passwordEncoder.encode("admin"));
        adminUser.setRole(Role.ROLE_ADMIN);
        adminUser.setStatus(UserStatus.ACTIVE);
        userRepository.saveAndFlush(adminUser);

        LoginRequest loginRequest = LoginRequest.builder()
                .email("admin@messmap.com")
                .password("admin")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Login successful")))
                .andExpect(jsonPath("$.data.token", notNullValue()))
                .andExpect(jsonPath("$.data.tokenType", is("Bearer")))
                .andExpect(jsonPath("$.data.user.email", is("admin@messmap.com")))
                .andExpect(jsonPath("$.data.user.role", is("ROLE_ADMIN")))
                .andExpect(jsonPath("$.data.user.status", is("ACTIVE")));
    }
}
