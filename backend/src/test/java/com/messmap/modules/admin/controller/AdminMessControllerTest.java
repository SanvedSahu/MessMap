package com.messmap.modules.admin.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.messmap.modules.admin.dto.RejectMessRequest;
import com.messmap.modules.admin.dto.SuspendMessRequest;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminMessControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MessRepository messRepository;

    private User owner;
    private Mess pendingMess;
    private Mess approvedMess;
    private Mess suspendedMess;

    @BeforeEach
    void setUp() {
        messRepository.deleteAll();
        userRepository.deleteAll();

        owner = userRepository.save(User.builder()
                .name("Ganesh Sharma")
                .email("ganesh@messmap.com")
                .password("hashedPassword123")
                .phone("9823456789")
                .role(Role.ROLE_MESS_OWNER)
                .status(UserStatus.ACTIVE)
                .build());

        pendingMess = messRepository.save(Mess.builder()
                .name("Shree Ganesh Mess")
                .description("Quality homely Maharashtrian food")
                .address("Fergusson College Road")
                .area("Deccan")
                .city("Pune")
                .phone("9823456789")
                .email("ganesh@messmap.com")
                .foodType(FoodType.PURE_VEG)
                .status(MessStatus.PENDING)
                .operatingStatus(OperatingStatus.OPEN)
                .owner(owner)
                .build());

        approvedMess = messRepository.save(Mess.builder()
                .name("Campus Kitchen")
                .description("North and South Indian dishes")
                .address("Senapati Bapat Road")
                .area("Shivajinagar")
                .city("Pune")
                .foodType(FoodType.VEG_AND_NON_VEG)
                .status(MessStatus.APPROVED)
                .operatingStatus(OperatingStatus.OPEN)
                .owner(owner)
                .build());

        suspendedMess = messRepository.save(Mess.builder()
                .name("Old City Tiffin")
                .description("Affordable tiffin service")
                .address("Tilak Road")
                .area("Sadashiv Peth")
                .city("Pune")
                .foodType(FoodType.PURE_VEG)
                .status(MessStatus.SUSPENDED)
                .operatingStatus(OperatingStatus.OPEN)
                .owner(owner)
                .build());
    }

    @Test
    @DisplayName("GET /api/admin/messes/pending - Admin should retrieve pending messes")
    @WithMockUser(username = "admin@messmap.com", roles = {"ADMIN"})
    void adminShouldRetrievePendingMesses() throws Exception {
        mockMvc.perform(get("/api/admin/messes/pending"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id").value(pendingMess.getId()))
                .andExpect(jsonPath("$.data[0].name").value("Shree Ganesh Mess"))
                .andExpect(jsonPath("$.data[0].status").value("PENDING"))
                .andExpect(jsonPath("$.data[0].ownerName").value("Ganesh Sharma"));
    }

    @Test
    @DisplayName("GET /api/v1/admin/messes/pending - v1 path compatibility")
    @WithMockUser(username = "admin@messmap.com", roles = {"ADMIN"})
    void adminShouldRetrievePendingMessesV1() throws Exception {
        mockMvc.perform(get("/api/v1/admin/messes/pending"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(1)));
    }

    @Test
    @DisplayName("GET /api/admin/messes - Admin should retrieve all messes with status filter")
    @WithMockUser(username = "admin@messmap.com", roles = {"ADMIN"})
    void adminShouldRetrieveFilteredMesses() throws Exception {
        mockMvc.perform(get("/api/admin/messes")
                        .param("status", "APPROVED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].name").value("Campus Kitchen"))
                .andExpect(jsonPath("$.data[0].status").value("APPROVED"));
    }

    @Test
    @DisplayName("GET /api/admin/messes/{id} - Admin should retrieve mess details")
    @WithMockUser(username = "admin@messmap.com", roles = {"ADMIN"})
    void adminShouldRetrieveMessDetails() throws Exception {
        mockMvc.perform(get("/api/admin/messes/{id}", pendingMess.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(pendingMess.getId()))
                .andExpect(jsonPath("$.data.name").value("Shree Ganesh Mess"));
    }

    @Test
    @DisplayName("GET /api/admin/messes/{id} - Should return 404 when mess ID not found")
    @WithMockUser(username = "admin@messmap.com", roles = {"ADMIN"})
    void adminShouldReceive404WhenMessNotFound() throws Exception {
        mockMvc.perform(get("/api/admin/messes/{id}", 999999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("POST /api/admin/messes/{id}/approve - Admin should approve pending mess successfully")
    @WithMockUser(username = "admin@messmap.com", roles = {"ADMIN"})
    void adminShouldApprovePendingMess() throws Exception {
        mockMvc.perform(post("/api/admin/messes/{id}/approve", pendingMess.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Mess approved successfully"))
                .andExpect(jsonPath("$.data.status").value("APPROVED"));

        // Verify database persistence
        Mess updated = messRepository.findById(pendingMess.getId()).orElseThrow();
        assertThat(updated.getStatus()).isEqualTo(MessStatus.APPROVED);
        assertThat(updated.getRejectionReason()).isNull();
    }

    @Test
    @DisplayName("POST /api/admin/messes/{id}/approve - Reject approval if already approved")
    @WithMockUser(username = "admin@messmap.com", roles = {"ADMIN"})
    void shouldFailWhenApprovingAlreadyApprovedMess() throws Exception {
        mockMvc.perform(post("/api/admin/messes/{id}/approve", approvedMess.getId()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("already approved")));
    }

    @Test
    @DisplayName("POST /api/admin/messes/{id}/reject - Admin should reject mess with reason note")
    @WithMockUser(username = "admin@messmap.com", roles = {"ADMIN"})
    void adminShouldRejectMessWithReason() throws Exception {
        RejectMessRequest request = RejectMessRequest.builder()
                .reason("Address verification failed and contact number unreachable")
                .build();

        mockMvc.perform(post("/api/admin/messes/{id}/reject", pendingMess.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Mess rejected successfully"))
                .andExpect(jsonPath("$.data.status").value("REJECTED"))
                .andExpect(jsonPath("$.data.rejectionReason").value("Address verification failed and contact number unreachable"));

        // Verify database persistence
        Mess updated = messRepository.findById(pendingMess.getId()).orElseThrow();
        assertThat(updated.getStatus()).isEqualTo(MessStatus.REJECTED);
        assertThat(updated.getRejectionReason()).isEqualTo("Address verification failed and contact number unreachable");
    }

    @Test
    @DisplayName("POST /api/admin/messes/{id}/reject - Should return 400 when rejection reason is blank")
    @WithMockUser(username = "admin@messmap.com", roles = {"ADMIN"})
    void shouldReturn400WhenRejectionReasonIsBlank() throws Exception {
        RejectMessRequest request = RejectMessRequest.builder()
                .reason("")
                .build();

        mockMvc.perform(post("/api/admin/messes/{id}/reject", pendingMess.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/admin/messes/{id}/suspend - Admin should suspend approved mess")
    @WithMockUser(username = "admin@messmap.com", roles = {"ADMIN"})
    void adminShouldSuspendApprovedMess() throws Exception {
        SuspendMessRequest request = SuspendMessRequest.builder()
                .reason("Repeated student food safety complaints")
                .build();

        mockMvc.perform(post("/api/admin/messes/{id}/suspend", approvedMess.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Mess suspended successfully"))
                .andExpect(jsonPath("$.data.status").value("SUSPENDED"));

        // Verify database persistence
        Mess updated = messRepository.findById(approvedMess.getId()).orElseThrow();
        assertThat(updated.getStatus()).isEqualTo(MessStatus.SUSPENDED);
    }

    @Test
    @DisplayName("POST /api/admin/messes/{id}/suspend - Should return 400 when suspending non-approved mess")
    @WithMockUser(username = "admin@messmap.com", roles = {"ADMIN"})
    void shouldFailWhenSuspendingNonApprovedMess() throws Exception {
        mockMvc.perform(post("/api/admin/messes/{id}/suspend", pendingMess.getId()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Only approved messes can be suspended")));
    }

    @Test
    @DisplayName("POST /api/admin/messes/{id}/unsuspend - Admin should unsuspend suspended mess")
    @WithMockUser(username = "admin@messmap.com", roles = {"ADMIN"})
    void adminShouldUnsuspendMess() throws Exception {
        mockMvc.perform(post("/api/admin/messes/{id}/unsuspend", suspendedMess.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Mess unsuspended successfully"))
                .andExpect(jsonPath("$.data.status").value("APPROVED"));

        // Verify database persistence
        Mess updated = messRepository.findById(suspendedMess.getId()).orElseThrow();
        assertThat(updated.getStatus()).isEqualTo(MessStatus.APPROVED);
        assertThat(updated.getRejectionReason()).isNull();
    }

    @Test
    @DisplayName("Security: Unauthenticated request should return 401")
    void unauthenticatedRequestShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/admin/messes/pending"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Security: Student token should return 403 Forbidden on admin endpoints")
    @WithMockUser(username = "student@messmap.com", roles = {"STUDENT"})
    void studentRequestShouldReturn403() throws Exception {
        mockMvc.perform(get("/api/admin/messes/pending"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Security: Mess Owner token should return 403 Forbidden on approve endpoint")
    @WithMockUser(username = "owner@messmap.com", roles = {"MESS_OWNER"})
    void ownerRequestShouldReturn403() throws Exception {
        mockMvc.perform(post("/api/admin/messes/{id}/approve", pendingMess.getId()))
                .andExpect(status().isForbidden());
    }
}
