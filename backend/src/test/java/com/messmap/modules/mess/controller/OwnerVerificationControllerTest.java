package com.messmap.modules.mess.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.messmap.modules.admin.service.AdminMessVerificationService;
import com.messmap.modules.mess.dto.CreateMessRequest;
import com.messmap.modules.mess.dto.SubmitVerificationRequest;
import com.messmap.modules.mess.entity.FoodType;
import com.messmap.modules.mess.entity.Mess;
import com.messmap.modules.mess.entity.MessStatus;
import com.messmap.modules.mess.entity.OperatingStatus;
import com.messmap.modules.mess.repository.MessRepository;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Comprehensive integration test suite for Issue #15:
 * Mess Owner listing submission for admin verification and status tracking APIs.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class OwnerVerificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MessRepository messRepository;

    @Autowired
    private AdminMessVerificationService adminMessVerificationService;

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

    private Mess draftMessOwnerA;
    private Mess approvedMessOwnerB;

    @BeforeEach
    void setUp() {
        // Owner A
        ownerA = userRepository.save(User.builder()
                .name("Owner Alice")
                .email("alice.verification@test.com")
                .password(passwordEncoder.encode("alicePass123"))
                .phone("+91 98221 00001")
                .role(Role.ROLE_MESS_OWNER)
                .status(UserStatus.ACTIVE)
                .build());
        tokenOwnerA = tokenProvider.generateToken(ownerA);

        // Owner B
        ownerB = userRepository.save(User.builder()
                .name("Owner Bob")
                .email("bob.verification@test.com")
                .password(passwordEncoder.encode("bobPass123"))
                .phone("+91 98221 00002")
                .role(Role.ROLE_MESS_OWNER)
                .status(UserStatus.ACTIVE)
                .build());
        tokenOwnerB = tokenProvider.generateToken(ownerB);

        // Student
        studentUser = userRepository.save(User.builder()
                .name("Student Charlie")
                .email("charlie.student@test.com")
                .password(passwordEncoder.encode("studentPass123"))
                .phone("+91 98221 00003")
                .role(Role.ROLE_STUDENT)
                .status(UserStatus.ACTIVE)
                .build());
        tokenStudent = tokenProvider.generateToken(studentUser);

        // Admin
        adminUser = userRepository.save(User.builder()
                .name("Admin Moderation")
                .email("admin.mod@test.com")
                .password(passwordEncoder.encode("adminPass123"))
                .phone("+91 98221 00004")
                .role(Role.ROLE_ADMIN)
                .status(UserStatus.ACTIVE)
                .build());
        tokenAdmin = tokenProvider.generateToken(adminUser);

        // Complete draft mess for Owner A
        draftMessOwnerA = messRepository.save(Mess.builder()
                .owner(ownerA)
                .name("Annapurna Pure Veg Mess")
                .description("Quality home style food")
                .address("Shop 10, FC Road")
                .area("Deccan Gymkhana")
                .city("Pune")
                .state("Maharashtra")
                .pincode("411004")
                .phone("+91 98221 00001")
                .foodType(FoodType.PURE_VEG)
                .breakfastTiming("07:30 AM – 10:00 AM")
                .lunchTiming("12:30 PM – 03:00 PM")
                .dinnerTiming("07:30 PM – 10:00 PM")
                .openingTime("07:30 AM")
                .closingTime("10:00 PM")
                .status(MessStatus.DRAFT)
                .operatingStatus(OperatingStatus.OPEN)
                .build());

        // Approved mess for Owner B
        approvedMessOwnerB = messRepository.save(Mess.builder()
                .owner(ownerB)
                .name("Shivaji Dining")
                .address("MG Road, Camp")
                .area("Camp")
                .city("Pune")
                .phone("+91 98221 00002")
                .foodType(FoodType.VEG_AND_NON_VEG)
                .lunchTiming("12:00 PM – 03:30 PM")
                .status(MessStatus.APPROVED)
                .operatingStatus(OperatingStatus.OPEN)
                .build());
    }

    @Test
    @DisplayName("1. POST /api/owner/mess/submit-verification - Successfully submit listing from DRAFT to PENDING")
    void shouldSubmitDraftListingForVerificationSuccessfully() throws Exception {
        mockMvc.perform(post("/api/owner/mess/submit-verification")
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", containsString("Mess listing submitted for verification successfully")))
                .andExpect(jsonPath("$.data.messId", is(draftMessOwnerA.getId().intValue())))
                .andExpect(jsonPath("$.data.status", is("PENDING")))
                .andExpect(jsonPath("$.data.canSubmit", is(false)))
                .andExpect(jsonPath("$.data.missingFields", hasSize(0)));

        Mess updated = messRepository.findById(draftMessOwnerA.getId()).orElseThrow();
        org.assertj.core.api.Assertions.assertThat(updated.getStatus()).isEqualTo(MessStatus.PENDING);
        org.assertj.core.api.Assertions.assertThat(updated.getRejectionReason()).isNull();
    }

    @Test
    @DisplayName("2. POST /api/owner/mess/{id}/submit-verification - Resubmit REJECTED listing, transitions to PENDING and clears reason")
    void shouldResubmitRejectedListingSuccessfullyAndClearReason() throws Exception {
        // Set mess to REJECTED with a rejection reason
        draftMessOwnerA.setStatus(MessStatus.REJECTED);
        draftMessOwnerA.setRejectionReason("Food safety registration documents missing");
        messRepository.save(draftMessOwnerA);

        mockMvc.perform(post("/api/owner/mess/" + draftMessOwnerA.getId() + "/submit-verification")
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.status", is("PENDING")))
                .andExpect(jsonPath("$.data.rejectionReason").doesNotExist())
                .andExpect(jsonPath("$.data.canSubmit", is(false)));

        Mess updated = messRepository.findById(draftMessOwnerA.getId()).orElseThrow();
        org.assertj.core.api.Assertions.assertThat(updated.getStatus()).isEqualTo(MessStatus.PENDING);
        org.assertj.core.api.Assertions.assertThat(updated.getRejectionReason()).isNull();
    }

    @Test
    @DisplayName("3. POST /api/owner/mess/submit-verification - Reject submission when mandatory profile fields are missing (HTTP 400)")
    void shouldRejectSubmissionWhenMandatoryProfileFieldsAreMissing() throws Exception {
        // Clear area and phone
        draftMessOwnerA.setArea(null);
        draftMessOwnerA.setPhone("   ");
        messRepository.save(draftMessOwnerA);

        mockMvc.perform(post("/api/owner/mess/submit-verification")
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.message", containsString("Mess profile is incomplete for verification submission")))
                .andExpect(jsonPath("$.details", hasItems(
                        "Area/locality is required",
                        "Contact phone is required"
                )));
    }

    @Test
    @DisplayName("4. POST /api/owner/mess/submit-verification - Reject submission when meal timings are absent even if openingTime is set (HTTP 400)")
    void shouldRejectSubmissionWhenNoMealTimingIsSetEvenIfOpeningTimeExists() throws Exception {
        // Mess has openingTime and closingTime, but NO breakfastTiming, lunchTiming, or dinnerTiming
        draftMessOwnerA.setOpeningTime("08:00 AM");
        draftMessOwnerA.setClosingTime("10:00 PM");
        draftMessOwnerA.setBreakfastTiming(null);
        draftMessOwnerA.setLunchTiming("");
        draftMessOwnerA.setDinnerTiming("   ");
        messRepository.save(draftMessOwnerA);

        mockMvc.perform(post("/api/owner/mess/submit-verification")
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.details", hasItem("At least one meal timing (breakfast, lunch, or dinner) is required")));
    }

    @Test
    @DisplayName("5. POST /api/owner/mess/submit-verification - Accept submission if at least ONE meal timing exists")
    void shouldAcceptSubmissionIfAtLeastOneMealTimingExists() throws Exception {
        // Only lunchTiming is set, breakfast and dinner are null
        draftMessOwnerA.setBreakfastTiming(null);
        draftMessOwnerA.setDinnerTiming(null);
        draftMessOwnerA.setLunchTiming("12:00 PM – 03:00 PM");
        messRepository.save(draftMessOwnerA);

        mockMvc.perform(post("/api/owner/mess/submit-verification")
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("PENDING")));
    }

    @Test
    @DisplayName("6. POST /api/owner/mess/submit-verification - Reject invalid transition when status is already PENDING (HTTP 400)")
    void shouldRejectSubmissionWhenAlreadyPending() throws Exception {
        draftMessOwnerA.setStatus(MessStatus.PENDING);
        messRepository.save(draftMessOwnerA);

        mockMvc.perform(post("/api/owner/mess/submit-verification")
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.message", containsString("already submitted and pending admin verification")));
    }

    @Test
    @DisplayName("7. POST /api/owner/mess/{id}/submit-verification - Reject invalid transition when status is APPROVED (HTTP 400)")
    void shouldRejectSubmissionWhenAlreadyApproved() throws Exception {
        mockMvc.perform(post("/api/owner/mess/" + approvedMessOwnerB.getId() + "/submit-verification")
                        .header("Authorization", "Bearer " + tokenOwnerB)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.message", containsString("already approved")));
    }

    @Test
    @DisplayName("8. POST /api/owner/mess/submit-verification - Reject invalid transition when status is SUSPENDED (HTTP 400)")
    void shouldRejectSubmissionWhenSuspended() throws Exception {
        draftMessOwnerA.setStatus(MessStatus.SUSPENDED);
        messRepository.save(draftMessOwnerA);

        mockMvc.perform(post("/api/owner/mess/submit-verification")
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.message", containsString("currently suspended")));
    }

    @Test
    @DisplayName("9. POST /api/owner/mess/{id}/submit-verification - Prevent cross-owner submission (HTTP 403)")
    void shouldPreventCrossOwnerVerificationSubmission() throws Exception {
        // Owner A attempts to submit Owner B's mess
        mockMvc.perform(post("/api/owner/mess/" + approvedMessOwnerB.getId() + "/submit-verification")
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", is(403)))
                .andExpect(jsonPath("$.message", containsString("Access is denied")));
    }

    @Test
    @DisplayName("10. GET /api/owner/mess/verification-status - Retrieve status for DRAFT listing with completeness details")
    void shouldRetrieveVerificationStatusForDraftListing() throws Exception {
        mockMvc.perform(get("/api/owner/mess/verification-status")
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.messId", is(draftMessOwnerA.getId().intValue())))
                .andExpect(jsonPath("$.data.messName", is("Annapurna Pure Veg Mess")))
                .andExpect(jsonPath("$.data.status", is("DRAFT")))
                .andExpect(jsonPath("$.data.canSubmit", is(true)))
                .andExpect(jsonPath("$.data.missingFields", hasSize(0)));
    }

    @Test
    @DisplayName("11. GET /api/owner/mess/verification-status - Reflect real-time admin rejection and feedback remarks (Issue #4)")
    void shouldReflectAdminRejectionRemarksInRealTime() throws Exception {
        // Submit mess to PENDING
        draftMessOwnerA.setStatus(MessStatus.PENDING);
        messRepository.save(draftMessOwnerA);

        // Admin rejects via AdminMessVerificationService
        adminMessVerificationService.rejectMess(draftMessOwnerA.getId(), "Missing health inspector license and menu pricing");

        // Owner checks status
        mockMvc.perform(get("/api/owner/mess/verification-status")
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("REJECTED")))
                .andExpect(jsonPath("$.data.rejectionReason", is("Missing health inspector license and menu pricing")))
                .andExpect(jsonPath("$.data.adminRemarks", is("Missing health inspector license and menu pricing")))
                .andExpect(jsonPath("$.data.canSubmit", is(true)));
    }

    @Test
    @DisplayName("12. GET /api/owner/mess/verification-status - Reflect real-time admin approval (Issue #4)")
    void shouldReflectAdminApprovalInRealTime() throws Exception {
        draftMessOwnerA.setStatus(MessStatus.PENDING);
        messRepository.save(draftMessOwnerA);

        // Admin approves mess
        adminMessVerificationService.approveMess(draftMessOwnerA.getId());

        // Owner checks status
        mockMvc.perform(get("/api/owner/mess/verification-status")
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("APPROVED")))
                .andExpect(jsonPath("$.data.rejectionReason").doesNotExist())
                .andExpect(jsonPath("$.data.canSubmit", is(false)));
    }

    @Test
    @DisplayName("13. GET /api/owner/mess/verification-status - Reflect real-time admin suspension (Issue #4)")
    void shouldReflectAdminSuspensionInRealTime() throws Exception {
        // Admin suspends Owner B's approved mess
        adminMessVerificationService.suspendMess(approvedMessOwnerB.getId(), "Student hygiene violation complaints");

        mockMvc.perform(get("/api/owner/mess/" + approvedMessOwnerB.getId() + "/verification-status")
                        .header("Authorization", "Bearer " + tokenOwnerB)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("SUSPENDED")))
                .andExpect(jsonPath("$.data.rejectionReason", is("Student hygiene violation complaints")))
                .andExpect(jsonPath("$.data.canSubmit", is(false)));
    }

    @Test
    @DisplayName("14. GET /api/owner/mess/{id}/verification-status - Prevent cross-owner status viewing (HTTP 403)")
    void shouldPreventCrossOwnerVerificationStatusViewing() throws Exception {
        // Owner A tries to view Owner B's status
        mockMvc.perform(get("/api/owner/mess/" + approvedMessOwnerB.getId() + "/verification-status")
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", is(403)));
    }

    @Test
    @DisplayName("15. POST & GET verification endpoints - Unauthenticated requests return HTTP 401")
    void shouldRejectUnauthenticatedRequests() throws Exception {
        mockMvc.perform(post("/api/owner/mess/submit-verification")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)));

        mockMvc.perform(get("/api/owner/mess/verification-status")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)));
    }

    @Test
    @DisplayName("16. POST & GET verification endpoints - Student role access returns HTTP 403")
    void shouldRejectStudentRoleAccess() throws Exception {
        mockMvc.perform(post("/api/owner/mess/submit-verification")
                        .header("Authorization", "Bearer " + tokenStudent)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", is(403)));

        mockMvc.perform(get("/api/owner/mess/verification-status")
                        .header("Authorization", "Bearer " + tokenStudent)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", is(403)));
    }

    @Test
    @DisplayName("17. POST /api/owner/mess/submit-verification - Support request body with messId")
    void shouldSupportRequestBodyWithMessId() throws Exception {
        SubmitVerificationRequest request = SubmitVerificationRequest.builder()
                .messId(draftMessOwnerA.getId())
                .build();

        mockMvc.perform(post("/api/owner/mess/submit-verification")
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.messId", is(draftMessOwnerA.getId().intValue())))
                .andExpect(jsonPath("$.data.status", is("PENDING")));
    }

    @Test
    @DisplayName("18. GET /api/v1/owner/messes/{id}/verification-status - Versioned plural route aliases")
    void shouldSupportVersionedPluralRouteAliases() throws Exception {
        mockMvc.perform(get("/api/v1/owner/messes/" + draftMessOwnerA.getId() + "/verification-status")
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("DRAFT")));
    }

    @Test
    @DisplayName("19. POST /api/owner/mess - Create mess with explicit DRAFT status")
    void shouldAllowCreatingMessWithExplicitDraftStatus() throws Exception {
        CreateMessRequest request = CreateMessRequest.builder()
                .name("Draft Kitchen")
                .address("Lane 2, Deccan")
                .locality("Deccan")
                .city("Pune")
                .contact("+91 99999 11111")
                .status("DRAFT")
                .build();

        mockMvc.perform(post("/api/owner/mess")
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name", is("Draft Kitchen")))
                .andExpect(jsonPath("$.data.status", is("DRAFT")));
    }
}
