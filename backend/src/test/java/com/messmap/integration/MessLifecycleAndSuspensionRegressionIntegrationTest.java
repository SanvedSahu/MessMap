package com.messmap.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.messmap.modules.admin.dto.RejectSuspensionReviewRequest;
import com.messmap.modules.admin.dto.RemoveMessRequest;
import com.messmap.modules.favorite.repository.FavoriteRepository;
import com.messmap.modules.menu.repository.MenuItemRepository;
import com.messmap.modules.mess.dto.CreateMessRequest;
import com.messmap.modules.mess.dto.RequestSuspensionReviewRequest;
import com.messmap.modules.mess.dto.UpdateMessProfileRequest;
import com.messmap.modules.mess.entity.Mess;
import com.messmap.modules.mess.entity.MessStatus;
import com.messmap.modules.mess.entity.OperatingStatus;
import com.messmap.modules.mess.entity.SuspensionReviewStatus;
import com.messmap.modules.mess.repository.MessRepository;
import com.messmap.modules.mess.repository.SuspensionReviewRequestRepository;
import com.messmap.modules.review.repository.ReviewRepository;
import com.messmap.modules.user.dto.LoginRequest;
import com.messmap.modules.user.dto.OwnerRegistrationRequest;
import com.messmap.modules.user.dto.StudentRegisterRequest;
import com.messmap.modules.user.entity.Role;
import com.messmap.modules.user.entity.User;
import com.messmap.modules.user.entity.UserStatus;
import com.messmap.modules.user.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
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
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Regression test suite covering the 4 Mess Lifecycle, Admin Removal, and Suspension bugs:
 *
 * 1. Owner-closed mess excluded from student discovery; reopening restores visibility.
 * 2. Owner cannot reopen an admin-suspended mess; direct API attempts are rejected.
 * 3. Admin removal rejects blank reason, persists REMOVED state + removalReason,
 *    excludes from student discovery, and blocks owner reactivation.
 * 4. Suspension review request submission, duplicate prevention, unauthorized access rejection,
 *    and admin approval/rejection workflows.
 * 5. Removal and suspension integrity across Student, Owner, and Admin views.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class MessLifecycleAndSuspensionRegressionIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MessRepository messRepository;

    @Autowired
    private SuspensionReviewRequestRepository suspensionReviewRequestRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final String ADMIN_EMAIL = "admin.lifecycle@messmap.com";
    private static final String COMMON_PASS = "ValidPassword123!";

    @BeforeEach
    void setUp() {
        cleanupData();

        if (!userRepository.existsByEmail(ADMIN_EMAIL)) {
            userRepository.save(User.builder()
                    .name("Lifecycle Admin")
                    .email(ADMIN_EMAIL)
                    .password(passwordEncoder.encode(COMMON_PASS))
                    .phone("+91 91111 22222")
                    .role(Role.ROLE_ADMIN)
                    .status(UserStatus.ACTIVE)
                    .build());
        }
    }

    @AfterEach
    void tearDown() {
        cleanupData();
    }

    private void cleanupData() {
        suspensionReviewRequestRepository.deleteAll();
        favoriteRepository.deleteAll();
        reviewRepository.deleteAll();
        menuItemRepository.deleteAll();
        messRepository.deleteAll();

        List<String> testEmails = List.of(
                ADMIN_EMAIL,
                "owner.lifecycle1@messmap.com",
                "owner.lifecycle2@messmap.com",
                "student.lifecycle@student.ac.in"
        );

        for (String email : testEmails) {
            userRepository.findByEmail(email).ifPresent(userRepository::delete);
        }
    }

    private String loginUser(String email, String password) throws Exception {
        LoginRequest loginRequest = LoginRequest.builder()
                .email(email)
                .password(password)
                .build();

        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andReturn();

        return objectMapper.readTree(result.getResponse().getContentAsString())
                .path("data").path("token").asText();
    }

    private Long createAndApproveMess(String ownerEmail, String messName) throws Exception {
        // Register Owner
        OwnerRegistrationRequest ownerReg = OwnerRegistrationRequest.builder()
                .name("Owner of " + messName)
                .email(ownerEmail)
                .password(COMMON_PASS)
                .phone("+91 98222 33333")
                .college("Pune University")
                .build();

        mockMvc.perform(post("/api/v1/auth/register/owner")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(ownerReg)))
                .andExpect(status().isCreated());

        String ownerToken = loginUser(ownerEmail, COMMON_PASS);

        // Create Mess
        CreateMessRequest messRequest = CreateMessRequest.builder()
                .name(messName)
                .description("Authentic tasty meals")
                .address("Lane 4, FC Road")
                .area("Shivajinagar")
                .city("Pune")
                .state("Maharashtra")
                .pincode("411005")
                .phone("+91 98222 33333")
                .foodType("VEG_AND_NON_VEG")
                .breakfastTiming("07:30 AM – 10:00 AM")
                .lunchTiming("12:00 PM – 03:00 PM")
                .dinnerTiming("07:30 PM – 10:30 PM")
                .dailyPrice(new BigDecimal("120.00"))
                .monthlyPrice(new BigDecimal("3200.00"))
                .latitude(new BigDecimal("18.520400"))
                .longitude(new BigDecimal("73.856700"))
                .status("APPROVED")
                .build();

        MvcResult res = mockMvc.perform(post("/api/v1/owner/mess")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(messRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        Long messId = objectMapper.readTree(res.getResponse().getContentAsString())
                .path("data").path("id").asLong();

        // Ensure mess is APPROVED and OPEN
        Mess mess = messRepository.findById(messId).orElseThrow();
        mess.setStatus(MessStatus.APPROVED);
        mess.setOperatingStatus(OperatingStatus.OPEN);
        messRepository.save(mess);

        return messId;
    }

    // =========================================================================
    // BUG 1: Owner-closed mess excluded from student discovery
    // =========================================================================
    @Test
    @DisplayName("Bug 1: Owner closes mess -> excluded from discovery; Reopening restores visibility")
    void testBug1_OwnerClosesAndReopensMess() throws Exception {
        String ownerEmail = "owner.lifecycle1@messmap.com";
        Long messId = createAndApproveMess(ownerEmail, "Shivaji Swad Mess");
        String ownerToken = loginUser(ownerEmail, COMMON_PASS);

        // 1. Verify mess is in student discovery initially
        mockMvc.perform(get("/api/v1/messes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[*].id", hasItem(messId.intValue())));

        // 2. Owner closes mess
        UpdateMessProfileRequest closeRequest = UpdateMessProfileRequest.builder()
                .operatingStatus(OperatingStatus.CLOSED)
                .build();

        mockMvc.perform(put("/api/v1/owner/mess/profile")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(closeRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.operatingStatus").value("CLOSED"));

        // 3. Student discovery excludes closed mess by default
        mockMvc.perform(get("/api/v1/messes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[*].id", not(hasItem(messId.intValue()))));

        // 4. Direct mess detail shows operatingStatus = CLOSED
        mockMvc.perform(get("/api/v1/messes/" + messId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.operatingStatus").value("CLOSED"));

        // 5. Query with includeClosed=true retrieves the closed mess
        mockMvc.perform(get("/api/v1/messes?includeClosed=true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[*].id", hasItem(messId.intValue())));

        // 6. Owner reopens mess
        UpdateMessProfileRequest openRequest = UpdateMessProfileRequest.builder()
                .operatingStatus(OperatingStatus.OPEN)
                .build();

        mockMvc.perform(put("/api/v1/owner/mess/profile")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(openRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.operatingStatus").value("OPEN"));

        // 7. Student discovery now includes the reopened mess
        mockMvc.perform(get("/api/v1/messes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[*].id", hasItem(messId.intValue())));
    }

    // =========================================================================
    // BUG 4 (A): Owner cannot reopen an admin-suspended mess
    // =========================================================================
    @Test
    @DisplayName("Bug 4: Owner cannot reopen admin-suspended mess; direct API attempts rejected")
    void testBug4_OwnerCannotReopenSuspendedMess() throws Exception {
        String ownerEmail = "owner.lifecycle1@messmap.com";
        Long messId = createAndApproveMess(ownerEmail, "Sahyadri Kitchen");
        String ownerToken = loginUser(ownerEmail, COMMON_PASS);
        String adminToken = loginUser(ADMIN_EMAIL, COMMON_PASS);

        // 1. Admin suspends the mess
        mockMvc.perform(post("/api/v1/admin/messes/" + messId + "/suspend")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("SUSPENDED"))
                .andExpect(jsonPath("$.data.operatingStatus").value("CLOSED"));

        // 2. Student discovery excludes suspended mess
        mockMvc.perform(get("/api/v1/messes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[*].id", not(hasItem(messId.intValue()))));

        // 3. Owner attempts to reopen suspended mess via profile API -> 400 Bad Request
        UpdateMessProfileRequest reopenRequest = UpdateMessProfileRequest.builder()
                .operatingStatus(OperatingStatus.OPEN)
                .build();

        mockMvc.perform(put("/api/v1/owner/mess/profile")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reopenRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("suspended by an administrator")));

        // 4. Verify in DB that status is still SUSPENDED and operatingStatus is CLOSED
        Mess messInDb = messRepository.findById(messId).orElseThrow();
        assertEquals(MessStatus.SUSPENDED, messInDb.getStatus());
        assertEquals(OperatingStatus.CLOSED, messInDb.getOperatingStatus());
    }

    // =========================================================================
    // BUG 3: Admin removal persists, notifies owner, and blocks reactivation
    // =========================================================================
    @Test
    @DisplayName("Bug 3: Admin removal validates reason, persists REMOVED status, notifies owner, blocks reactivation")
    void testBug3_AdminRemovalWorkflow() throws Exception {
        String ownerEmail = "owner.lifecycle1@messmap.com";
        String otherOwnerEmail = "owner.lifecycle2@messmap.com";
        Long messId = createAndApproveMess(ownerEmail, "Anand Bhojanalaya");
        Long otherMessId = createAndApproveMess(otherOwnerEmail, "Ganesh Dining");

        String adminToken = loginUser(ADMIN_EMAIL, COMMON_PASS);
        String ownerToken = loginUser(ownerEmail, COMMON_PASS);
        String otherOwnerToken = loginUser(otherOwnerEmail, COMMON_PASS);

        // 1. Admin removal rejects empty or whitespace-only reason
        RemoveMessRequest blankReasonReq = new RemoveMessRequest("   ");
        mockMvc.perform(post("/api/v1/admin/messes/" + messId + "/remove")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(blankReasonReq)))
                .andExpect(status().isBadRequest());

        // 2. Admin removal succeeds with valid reason
        String validReason = "Repeated food safety and hygiene guideline non-compliance";
        RemoveMessRequest validRemoveReq = new RemoveMessRequest(validReason);

        mockMvc.perform(post("/api/v1/admin/messes/" + messId + "/remove")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRemoveReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("REMOVED"))
                .andExpect(jsonPath("$.data.operatingStatus").value("CLOSED"))
                .andExpect(jsonPath("$.data.removalReason").value(validReason));

        // 3. Removed mess excluded from student discovery
        mockMvc.perform(get("/api/v1/messes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[*].id", not(hasItem(messId.intValue()))));

        // 4. Direct public mess detail endpoint rejects/excludes removed mess
        mockMvc.perform(get("/api/v1/messes/" + messId))
                .andExpect(status().isNotFound());

        // 5. Correct owner can retrieve mess and view removal reason
        mockMvc.perform(get("/api/v1/owner/mess")
                        .header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("REMOVED"))
                .andExpect(jsonPath("$.data.operatingStatus").value("CLOSED"))
                .andExpect(jsonPath("$.data.removalReason").value(validReason));

        // 6. Another owner cannot access the removed mess (403 Forbidden)
        mockMvc.perform(get("/api/v1/owner/mess/" + messId)
                        .header("Authorization", "Bearer " + otherOwnerToken))
                .andExpect(status().isForbidden());

        // 7. Owner cannot modify or reopen removed mess
        UpdateMessProfileRequest tryReopen = UpdateMessProfileRequest.builder()
                .operatingStatus(OperatingStatus.OPEN)
                .build();

        mockMvc.perform(put("/api/v1/owner/mess/profile")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(tryReopen)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("removed by an administrator")));

        // 8. Owner cannot resubmit removed mess for verification
        mockMvc.perform(post("/api/v1/owner/mess/submit-verification")
                        .header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("removed by an administrator")));
    }

    // =========================================================================
    // BUG 4 (B & C): Suspension review request and Admin approval/rejection
    // =========================================================================
    @Test
    @DisplayName("Bug 4: Owner submits review request, admin queue views, rejects, and approves lifting suspension")
    void testBug4_SuspensionReviewWorkflow() throws Exception {
        String ownerEmail = "owner.lifecycle1@messmap.com";
        Long messId = createAndApproveMess(ownerEmail, "Durvankur Thali Mess");

        String adminToken = loginUser(ADMIN_EMAIL, COMMON_PASS);
        String ownerToken = loginUser(ownerEmail, COMMON_PASS);

        // 1. Admin suspends mess
        mockMvc.perform(post("/api/v1/admin/messes/" + messId + "/suspend")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk());

        // 2. Owner submits suspension review request
        RequestSuspensionReviewRequest reviewRequest = RequestSuspensionReviewRequest.builder()
                .messId(messId)
                .explanation("Corrective pest control and complete sanitization performed on site.")
                .build();

        MvcResult reviewResult = mockMvc.perform(post("/api/v1/owner/mess/suspension-review")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reviewRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("PENDING"))
                .andExpect(jsonPath("$.data.messId").value(messId))
                .andReturn();

        Long requestId = objectMapper.readTree(reviewResult.getResponse().getContentAsString())
                .path("data").path("id").asLong();

        // 3. Submitting duplicate review request while pending is rejected
        mockMvc.perform(post("/api/v1/owner/mess/suspension-review")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reviewRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("already pending")));

        // 4. Unauthorized user (owner or student) cannot access admin suspension-reviews endpoint
        mockMvc.perform(get("/api/v1/admin/messes/suspension-reviews")
                        .header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isForbidden());

        // 5. Admin can list pending suspension reviews
        mockMvc.perform(get("/api/v1/admin/messes/suspension-reviews?status=PENDING")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[*].id", hasItem(requestId.intValue())))
                .andExpect(jsonPath("$.data[*].messName", hasItem("Durvankur Thali Mess")));

        // 6. Admin rejects review request with reason
        RejectSuspensionReviewRequest rejectReq = new RejectSuspensionReviewRequest("Sanitization certificate from approved vendor required.");
        mockMvc.perform(post("/api/v1/admin/messes/suspension-reviews/" + requestId + "/reject")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rejectReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("REJECTED"))
                .andExpect(jsonPath("$.data.adminNotes").value("Sanitization certificate from approved vendor required."));

        // 7. Verify mess is STILL suspended
        Mess messAfterReject = messRepository.findById(messId).orElseThrow();
        assertEquals(MessStatus.SUSPENDED, messAfterReject.getStatus());

        // 8. Owner submits a second review request after rejection
        RequestSuspensionReviewRequest reviewRequest2 = RequestSuspensionReviewRequest.builder()
                .messId(messId)
                .explanation("Attached vendor sanitization certificate #VC-8891.")
                .build();

        MvcResult reviewResult2 = mockMvc.perform(post("/api/v1/owner/mess/suspension-review")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reviewRequest2)))
                .andExpect(status().isCreated())
                .andReturn();

        Long requestId2 = objectMapper.readTree(reviewResult2.getResponse().getContentAsString())
                .path("data").path("id").asLong();

        // 9. Admin approves second review request -> suspension is lifted to APPROVED
        mockMvc.perform(post("/api/v1/admin/messes/suspension-reviews/" + requestId2 + "/approve")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("APPROVED"));

        // 10. Verify mess in DB is restored to APPROVED status
        Mess messAfterApprove = messRepository.findById(messId).orElseThrow();
        assertEquals(MessStatus.APPROVED, messAfterApprove.getStatus());
    }

    // =========================================================================
    // BUG 4 edge case: Approval cannot reactivate a REMOVED mess
    // =========================================================================
    @Test
    @DisplayName("Bug 4 Edge Case: Approval of review cannot reactivate a removed mess")
    void testBug4_ApprovalCannotReactivateRemovedMess() throws Exception {
        String ownerEmail = "owner.lifecycle1@messmap.com";
        Long messId = createAndApproveMess(ownerEmail, "Gokul Dining Hall");

        String adminToken = loginUser(ADMIN_EMAIL, COMMON_PASS);
        String ownerToken = loginUser(ownerEmail, COMMON_PASS);

        // 1. Admin suspends mess
        mockMvc.perform(post("/api/v1/admin/messes/" + messId + "/suspend")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk());

        // 2. Owner submits review request
        RequestSuspensionReviewRequest reviewRequest = RequestSuspensionReviewRequest.builder()
                .messId(messId)
                .explanation("Requesting review")
                .build();

        MvcResult reviewResult = mockMvc.perform(post("/api/v1/owner/mess/suspension-review")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reviewRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        Long requestId = objectMapper.readTree(reviewResult.getResponse().getContentAsString())
                .path("data").path("id").asLong();

        // 3. Admin removes mess before reviewing
        RemoveMessRequest removeReq = new RemoveMessRequest("Serious breach of conduct");
        mockMvc.perform(post("/api/v1/admin/messes/" + messId + "/remove")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(removeReq)))
                .andExpect(status().isOk());

        // 4. Attempting to approve the suspension review for a removed mess is rejected
        mockMvc.perform(post("/api/v1/admin/messes/suspension-reviews/" + requestId + "/approve")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("removed by an administrator")));

        // Verify status remains REMOVED
        Mess mess = messRepository.findById(messId).orElseThrow();
        assertEquals(MessStatus.REMOVED, mess.getStatus());
    }
}
