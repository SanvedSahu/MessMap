package com.messmap.modules.user.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.messmap.modules.mess.entity.FoodType;
import com.messmap.modules.mess.entity.Mess;
import com.messmap.modules.mess.entity.MessStatus;
import com.messmap.modules.mess.entity.OperatingStatus;
import com.messmap.modules.mess.repository.MessRepository;
import com.messmap.modules.user.dto.ChangePasswordRequest;
import com.messmap.modules.user.dto.OwnerProfileUpdateRequest;
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

import java.math.BigDecimal;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class OwnerProfileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MessRepository messRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    private User ownerA;
    private String tokenOwnerA;

    private User ownerB;
    private String tokenOwnerB;

    private User studentUser;
    private String tokenStudent;

    private User adminUser;
    private String tokenAdmin;

    @BeforeEach
    void setUp() {
        // Create Owner A
        ownerA = userRepository.save(User.builder()
                .name("Owner Alice")
                .email("alice@annapurna.com")
                .password(passwordEncoder.encode("alicePass123"))
                .phone("+91 98231 00001")
                .role(Role.ROLE_MESS_OWNER)
                .status(UserStatus.ACTIVE)
                .college("COEP Pune")
                .build());
        tokenOwnerA = tokenProvider.generateToken(ownerA);

        // Associate a mess with Owner A
        messRepository.save(Mess.builder()
                .owner(ownerA)
                .name("Annapurna Dining Hall")
                .address("Shop 1, Near COEP Gate")
                .city("Pune")
                .foodType(FoodType.PURE_VEG)
                .monthlyPrice(BigDecimal.valueOf(3200))
                .dailyPrice(BigDecimal.valueOf(100))
                .status(MessStatus.APPROVED)
                .operatingStatus(OperatingStatus.OPEN)
                .build());

        // Create Owner B
        ownerB = userRepository.save(User.builder()
                .name("Owner Bob")
                .email("bob@shivneri.com")
                .password(passwordEncoder.encode("bobPass123"))
                .phone("+91 98231 00002")
                .role(Role.ROLE_MESS_OWNER)
                .status(UserStatus.ACTIVE)
                .build());
        tokenOwnerB = tokenProvider.generateToken(ownerB);

        // Create Student
        studentUser = userRepository.save(User.builder()
                .name("Student Sam")
                .email("sam@student.com")
                .password(passwordEncoder.encode("studentPass123"))
                .role(Role.ROLE_STUDENT)
                .status(UserStatus.ACTIVE)
                .build());
        tokenStudent = tokenProvider.generateToken(studentUser);

        // Create Admin
        adminUser = userRepository.save(User.builder()
                .name("Admin User")
                .email("admin@messmap.org")
                .password(passwordEncoder.encode("adminPass123"))
                .role(Role.ROLE_ADMIN)
                .status(UserStatus.ACTIVE)
                .build());
        tokenAdmin = tokenProvider.generateToken(adminUser);
    }

    @Test
    @DisplayName("GET /api/v1/owner/profile - should return authenticated owner profile with owned messes")
    void shouldReturnAuthenticatedOwnerProfile() throws Exception {
        mockMvc.perform(get("/api/v1/owner/profile")
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.id", is(ownerA.getId().intValue())))
                .andExpect(jsonPath("$.data.name", is("Owner Alice")))
                .andExpect(jsonPath("$.data.email", is("alice@annapurna.com")))
                .andExpect(jsonPath("$.data.messes", hasSize(1)))
                .andExpect(jsonPath("$.data.messes[0].name", is("Annapurna Dining Hall")));
    }

    @Test
    @DisplayName("GET /api/v1/owner/profile - should return HTTP 401 when no token is supplied")
    void shouldReturn401WhenUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/v1/owner/profile")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.status", is(401)));
    }

    @Test
    @DisplayName("GET /api/v1/owner/profile - should return HTTP 403 when accessed by student role")
    void shouldReturn403WhenStudentAccessesOwnerEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/owner/profile")
                        .header("Authorization", "Bearer " + tokenStudent)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.status", is(403)));
    }

    @Test
    @DisplayName("PUT /api/v1/owner/profile - should update authenticated owner details successfully")
    void shouldUpdateAuthenticatedOwnerProfile() throws Exception {
        OwnerProfileUpdateRequest updateRequest = OwnerProfileUpdateRequest.builder()
                .name("Alice Sharma (Updated)")
                .phone("+91 99999 88888")
                .college("Pune University Campus")
                .build();

        mockMvc.perform(put("/api/v1/owner/profile")
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.name", is("Alice Sharma (Updated)")))
                .andExpect(jsonPath("$.data.phone", is("+91 99999 88888")))
                .andExpect(jsonPath("$.data.college", is("Pune University Campus")));
    }

    @Test
    @DisplayName("GET /api/v1/owner/profile/{id} - should allow owner to view their own profile by ID")
    void shouldAllowOwnerToViewOwnProfileById() throws Exception {
        mockMvc.perform(get("/api/v1/owner/profile/" + ownerA.getId())
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.id", is(ownerA.getId().intValue())));
    }

    @Test
    @DisplayName("GET /api/v1/owner/profile/{id} - should prevent owner from viewing another owner's profile (HTTP 403)")
    void shouldPreventOwnerFromViewingOtherUserProfile() throws Exception {
        // Owner A tries to view Owner B's profile
        mockMvc.perform(get("/api/v1/owner/profile/" + ownerB.getId())
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.status", is(403)));
    }

    @Test
    @DisplayName("PUT /api/v1/owner/profile/{id} - should prevent owner from updating another owner's profile (HTTP 403)")
    void shouldPreventOwnerFromModifyingOtherUserProfile() throws Exception {
        OwnerProfileUpdateRequest maliciousUpdate = OwnerProfileUpdateRequest.builder()
                .name("Hacked Name")
                .build();

        // Owner A tries to modify Owner B's profile
        mockMvc.perform(put("/api/v1/owner/profile/" + ownerB.getId())
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(maliciousUpdate)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.status", is(403)));
    }

    @Test
    @DisplayName("GET /api/v1/owner/profile/{id} - should allow administrator to view any owner profile")
    void shouldAllowAdminToViewAnyOwnerProfile() throws Exception {
        mockMvc.perform(get("/api/v1/owner/profile/" + ownerA.getId())
                        .header("Authorization", "Bearer " + tokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id", is(ownerA.getId().intValue())));
    }

    @Test
    @DisplayName("PUT /api/v1/owner/profile/password - should change password when current password matches")
    void shouldChangePasswordSuccessfully() throws Exception {
        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .currentPassword("alicePass123")
                .newPassword("brandNewPassword456")
                .confirmPassword("brandNewPassword456")
                .build();

        mockMvc.perform(put("/api/v1/owner/profile/password")
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", containsString("Password changed successfully")));
    }

    @Test
    @DisplayName("PUT /api/v1/owner/profile/password - should reject password change when current password is wrong")
    void shouldRejectPasswordChangeWhenCurrentPasswordIncorrect() throws Exception {
        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .currentPassword("incorrectCurrentPassword")
                .newPassword("brandNewPassword456")
                .confirmPassword("brandNewPassword456")
                .build();

        mockMvc.perform(put("/api/v1/owner/profile/password")
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.message", containsString("Current password does not match")));
    }
}
