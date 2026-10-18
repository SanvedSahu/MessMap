package com.messmap.modules.admin.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.messmap.modules.admin.dto.UpdateUserStatusRequest;
import com.messmap.modules.mess.repository.MessRepository;
import com.messmap.modules.user.entity.Role;
import com.messmap.modules.user.entity.User;
import com.messmap.modules.user.entity.UserStatus;
import com.messmap.modules.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminUserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MessRepository messRepository;

    private User rootAdmin;
    private User secondAdmin;
    private User student;
    private User owner;

    @BeforeEach
    void setUp() {
        messRepository.deleteAll();
        userRepository.deleteAll();

        rootAdmin = userRepository.save(User.builder()
                .name("Super Admin")
                .email("admin@messmap.com")
                .password("hashedPasswordSecret")
                .phone("9823456780")
                .role(Role.ROLE_ADMIN)
                .status(UserStatus.ACTIVE)
                .build());

        secondAdmin = userRepository.save(User.builder()
                .name("Second Admin")
                .email("admin2@messmap.com")
                .password("hashedPasswordSecret")
                .phone("9823456781")
                .role(Role.ROLE_ADMIN)
                .status(UserStatus.ACTIVE)
                .build());

        student = userRepository.save(User.builder()
                .name("Neha Joshi")
                .email("neha@messmap.com")
                .password("hashedPasswordSecret")
                .phone("9823456782")
                .role(Role.ROLE_STUDENT)
                .status(UserStatus.ACTIVE)
                .college("COEP Pune")
                .build());

        owner = userRepository.save(User.builder()
                .name("Prakash Patil")
                .email("prakash@messmap.com")
                .password("hashedPasswordSecret")
                .phone("9823456783")
                .role(Role.ROLE_MESS_OWNER)
                .status(UserStatus.SUSPENDED)
                .build());
    }

    @Test
    @DisplayName("GET /api/admin/users - Admin should list users with pagination and without sensitive credentials")
    @WithMockUser(username = "admin@messmap.com", roles = {"ADMIN"})
    void adminShouldListUsersPaginated() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content", hasSize(4)))
                .andExpect(jsonPath("$.data.totalElements").value(4))
                .andExpect(jsonPath("$.data.pageNumber").value(0))
                // Ensure passwords are NEVER exposed
                .andExpect(jsonPath("$.data.content[0].password").doesNotExist())
                .andExpect(jsonPath("$.data.content[1].password").doesNotExist());
    }

    @Test
    @DisplayName("GET /api/v1/admin/users - v1 path compatibility")
    @WithMockUser(username = "admin@messmap.com", roles = {"ADMIN"})
    void adminShouldListUsersV1() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content", hasSize(4)));
    }

    @Test
    @DisplayName("GET /api/admin/users?role=ROLE_STUDENT - Filter users by role")
    @WithMockUser(username = "admin@messmap.com", roles = {"ADMIN"})
    void adminShouldFilterUsersByRole() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                        .param("role", "ROLE_STUDENT"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.content[0].email").value("neha@messmap.com"))
                .andExpect(jsonPath("$.data.content[0].college").value("COEP Pune"));
    }

    @Test
    @DisplayName("GET /api/admin/users?status=SUSPENDED - Filter users by status")
    @WithMockUser(username = "admin@messmap.com", roles = {"ADMIN"})
    void adminShouldFilterUsersByStatus() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                        .param("status", "SUSPENDED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.content[0].email").value("prakash@messmap.com"));
    }

    @Test
    @DisplayName("GET /api/admin/users/{id} - Admin should retrieve user profile by ID")
    @WithMockUser(username = "admin@messmap.com", roles = {"ADMIN"})
    void adminShouldRetrieveUserProfile() throws Exception {
        mockMvc.perform(get("/api/admin/users/{id}", student.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(student.getId()))
                .andExpect(jsonPath("$.data.name").value("Neha Joshi"))
                .andExpect(jsonPath("$.data.password").doesNotExist());
    }

    @Test
    @DisplayName("GET /api/admin/users/{id} - Should return 404 when user ID is not found")
    @WithMockUser(username = "admin@messmap.com", roles = {"ADMIN"})
    void shouldReturn404WhenUserNotFound() throws Exception {
        mockMvc.perform(get("/api/admin/users/{id}", 999999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("PUT /api/admin/users/{id}/status - Admin should successfully toggle user status")
    @WithMockUser(username = "admin@messmap.com", roles = {"ADMIN"})
    void adminShouldUpdateUserStatus() throws Exception {
        UpdateUserStatusRequest request = UpdateUserStatusRequest.builder()
                .status(UserStatus.SUSPENDED)
                .reason("Repeated fraudulent activity")
                .build();

        mockMvc.perform(put("/api/admin/users/{id}/status", student.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("User status updated successfully"))
                .andExpect(jsonPath("$.data.status").value("SUSPENDED"));

        // Verify database persistence
        User updated = userRepository.findById(student.getId()).orElseThrow();
        assertThat(updated.getStatus()).isEqualTo(UserStatus.SUSPENDED);
    }

    @Test
    @DisplayName("PUT /api/admin/users/{id}/status - Admin cannot deactivate their own root administrator account")
    @WithMockUser(username = "admin@messmap.com", roles = {"ADMIN"})
    void adminCannotDeactivateSelf() throws Exception {
        UpdateUserStatusRequest request = UpdateUserStatusRequest.builder()
                .status(UserStatus.SUSPENDED)
                .reason("Accidental self-lockout")
                .build();

        mockMvc.perform(put("/api/admin/users/{id}/status", rootAdmin.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("cannot deactivate or suspend their own account")));

        // Verify status in DB was NOT changed
        User unchanged = userRepository.findById(rootAdmin.getId()).orElseThrow();
        assertThat(unchanged.getStatus()).isEqualTo(UserStatus.ACTIVE);
    }

    @Test
    @DisplayName("Security: Unauthenticated request should return 401")
    void unauthenticatedRequestShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Security: Student token should return 403 Forbidden")
    @WithMockUser(username = "student@messmap.com", roles = {"STUDENT"})
    void studentRequestShouldReturn403() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Security: Owner token should return 403 Forbidden on status update")
    @WithMockUser(username = "owner@messmap.com", roles = {"MESS_OWNER"})
    void ownerRequestShouldReturn403() throws Exception {
        UpdateUserStatusRequest request = UpdateUserStatusRequest.builder()
                .status(UserStatus.ACTIVE)
                .build();

        mockMvc.perform(put("/api/admin/users/{id}/status", student.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }
}
