package com.messmap.modules.admin.controller;

import com.messmap.modules.mess.entity.FoodType;
import com.messmap.modules.mess.entity.Mess;
import com.messmap.modules.mess.entity.MessStatus;
import com.messmap.modules.mess.entity.OperatingStatus;
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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminMetricsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MessRepository messRepository;

    @BeforeEach
    void setUp() {
        messRepository.deleteAll();
        userRepository.deleteAll();

        // Seed Users
        User admin = userRepository.save(User.builder()
                .name("Super Admin")
                .email("admin.metrics@messmap.com")
                .password("hashedPassword")
                .role(Role.ROLE_ADMIN)
                .status(UserStatus.ACTIVE)
                .build());

        User owner = userRepository.save(User.builder()
                .name("Owner One")
                .email("owner.metrics@messmap.com")
                .password("hashedPassword")
                .role(Role.ROLE_MESS_OWNER)
                .status(UserStatus.ACTIVE)
                .build());

        User student = userRepository.save(User.builder()
                .name("Student One")
                .email("student.metrics@messmap.com")
                .password("hashedPassword")
                .role(Role.ROLE_STUDENT)
                .status(UserStatus.ACTIVE)
                .build());

        // Seed Messes across different statuses
        // 1. APPROVED
        messRepository.save(Mess.builder()
                .name("Annapurna Approved Mess")
                .owner(owner)
                .address("FC Road")
                .city("Pune")
                .foodType(FoodType.PURE_VEG)
                .status(MessStatus.APPROVED)
                .operatingStatus(OperatingStatus.OPEN)
                .build());

        // 2. PENDING
        messRepository.save(Mess.builder()
                .name("Shivaji Pending Mess")
                .owner(owner)
                .address("JM Road")
                .city("Pune")
                .foodType(FoodType.VEG_AND_NON_VEG)
                .status(MessStatus.PENDING)
                .operatingStatus(OperatingStatus.OPEN)
                .build());

        // 3. SUSPENDED
        messRepository.save(Mess.builder()
                .name("Rajdhani Suspended Mess")
                .owner(owner)
                .address("Kothrud")
                .city("Pune")
                .foodType(FoodType.PURE_VEG)
                .status(MessStatus.SUSPENDED)
                .operatingStatus(OperatingStatus.CLOSED)
                .build());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/admin/metrics with ROLE_ADMIN should return HTTP 200 and live database metrics")
    void shouldReturnMetricsForAdmin() throws Exception {
        mockMvc.perform(get("/api/admin/metrics")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", containsString("successfully")))
                .andExpect(jsonPath("$.data.totalUsers", is(3)))
                .andExpect(jsonPath("$.data.activeMesses", is(1)))
                .andExpect(jsonPath("$.data.approvedMesses", is(1)))
                .andExpect(jsonPath("$.data.pendingVerification", is(1)))
                .andExpect(jsonPath("$.data.pendingMesses", is(1)))
                .andExpect(jsonPath("$.data.suspendedMesses", is(1)))
                .andExpect(jsonPath("$.data.totalMesses", is(3)));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/admin/dashboard/summary with ROLE_ADMIN should return HTTP 200")
    void shouldSupportDashboardSummaryAlias() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard/summary")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.totalUsers", is(3)))
                .andExpect(jsonPath("$.data.activeMesses", is(1)));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/v1/admin/metrics with ROLE_ADMIN should return HTTP 200")
    void shouldSupportV1AdminMetricsPath() throws Exception {
        mockMvc.perform(get("/api/v1/admin/metrics")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.totalUsers", is(3)));
    }

    @Test
    @DisplayName("GET /api/admin/metrics unauthenticated should return HTTP 401 Unauthorized")
    void shouldDenyUnauthenticatedRequest() throws Exception {
        mockMvc.perform(get("/api/admin/metrics")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "STUDENT")
    @DisplayName("GET /api/admin/metrics with ROLE_STUDENT should return HTTP 403 Forbidden")
    void shouldDenyStudentRole() throws Exception {
        mockMvc.perform(get("/api/admin/metrics")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "MESS_OWNER")
    @DisplayName("GET /api/admin/metrics with ROLE_MESS_OWNER should return HTTP 403 Forbidden")
    void shouldDenyMessOwnerRole() throws Exception {
        mockMvc.perform(get("/api/admin/metrics")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }
}
