package com.messmap.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.messmap.modules.admin.dto.SuspendMessRequest;
import com.messmap.modules.menu.dto.CreateMenuItemRequest;
import com.messmap.modules.menu.entity.MealType;
import com.messmap.modules.menu.repository.MenuItemRepository;
import com.messmap.modules.mess.dto.CreateMessRequest;
import com.messmap.modules.mess.dto.SubmitVerificationRequest;
import com.messmap.modules.mess.entity.FoodType;
import com.messmap.modules.mess.entity.Mess;
import com.messmap.modules.mess.entity.MessStatus;
import com.messmap.modules.favorite.repository.FavoriteRepository;
import com.messmap.modules.mess.repository.MessRepository;
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
import java.util.Collections;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Issue #18 End-to-End Verification Test Suite:
 * Validates the complete Student -> Mess Owner -> Admin Approval core flow
 * across registration, profile setup, menu creation, verification submission,
 * student search isolation, admin moderation/approval, student discovery, and
 * administrative suspension/unsuspension.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class StudentOwnerAdminE2EFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MessRepository messRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final String ADMIN_EMAIL = "admin.e2e@messmap.com";
    private static final String OWNER_EMAIL = "rajesh.e2e@messmap.com";
    private static final String STUDENT_EMAIL = "amit.e2e@student.ac.in";
    private static final String COMMON_PASS = "ValidPassword123!";

    @BeforeEach
    void setUp() {
        cleanupData();

        // Ensure a dedicated test admin exists
        if (!userRepository.existsByEmail(ADMIN_EMAIL)) {
            userRepository.save(User.builder()
                    .name("E2E Test Administrator")
                    .email(ADMIN_EMAIL)
                    .password(passwordEncoder.encode(COMMON_PASS))
                    .phone("+91 99999 88888")
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
        // Safe FK ordering
        favoriteRepository.deleteAll();
        reviewRepository.deleteAll();
        menuItemRepository.deleteAll();
        messRepository.deleteAll();

        userRepository.findByEmail(OWNER_EMAIL).ifPresent(userRepository::delete);
        userRepository.findByEmail(STUDENT_EMAIL).ifPresent(userRepository::delete);
        userRepository.findByEmail(ADMIN_EMAIL).ifPresent(userRepository::delete);
    }

    @Test
    @DisplayName("Complete E2E Core Flow: Owner Setup -> Submit -> Student Isolation -> Admin Approval -> Student Discovery -> Suspension Lifecycle")
    void testCompleteStudentOwnerAdminLifecycle() throws Exception {
        // =========================================================================
        // STEP 1: Owner Setup (Register, Login, Create Mess Profile, Add Menu Items)
        // =========================================================================

        // 1a. Register Owner
        OwnerRegistrationRequest ownerReg = OwnerRegistrationRequest.builder()
                .name("Rajesh Sharma")
                .email(OWNER_EMAIL)
                .password(COMMON_PASS)
                .phone("+91 98765 43210")
                .college("Pune University")
                .hostel("Block A")
                .build();

        mockMvc.perform(post("/api/v1/auth/register/owner")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(ownerReg)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isNotEmpty());

        // 1b. Login Owner to obtain JWT token
        LoginRequest ownerLogin = LoginRequest.builder()
                .email(OWNER_EMAIL)
                .password(COMMON_PASS)
                .build();

        MvcResult ownerLoginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(ownerLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andReturn();

        String ownerToken = objectMapper.readTree(ownerLoginResult.getResponse().getContentAsString())
                .path("data").path("token").asText();
        assertNotNull(ownerToken);

        // 1c. Owner Creates Mess Profile
        CreateMessRequest messRequest = CreateMessRequest.builder()
                .name("Shree Ganesh Executive Mess")
                .description("Authentic home-style pure veg meals with daily specials.")
                .address("Lane 4, Near College Main Gate, Fergusson Road")
                .area("Shivajinagar")
                .city("Pune")
                .state("Maharashtra")
                .pincode("411005")
                .phone("+91 98765 43210")
                .foodType("PURE_VEG")
                .monthlyPrice(new BigDecimal("3500.00"))
                .dailyPrice(new BigDecimal("120.00"))
                .breakfastPrice(new BigDecimal("40.00"))
                .lunchPrice(new BigDecimal("60.00"))
                .dinnerPrice(new BigDecimal("60.00"))
                .breakfastTiming("07:30 AM - 10:00 AM")
                .lunchTiming("12:00 PM - 03:00 PM")
                .dinnerTiming("07:30 PM - 10:00 PM")
                .amenities(Collections.singletonList("RO Purified Water"))
                .latitude(new BigDecimal("18.5204000"))
                .longitude(new BigDecimal("73.8402000"))
                .draft(true)
                .build();

        MvcResult createMessResult = mockMvc.perform(post("/api/v1/owner/mess")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(messRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Shree Ganesh Executive Mess"))
                .andExpect(jsonPath("$.data.status").value("DRAFT"))
                .andReturn();

        long messId = objectMapper.readTree(createMessResult.getResponse().getContentAsString())
                .path("data").path("id").asLong();

        // 1d. Owner Adds Daily Menu Items
        CreateMenuItemRequest menuItem = CreateMenuItemRequest.builder()
                .messId(messId)
                .dayOfWeek("MONDAY")
                .mealType(MealType.LUNCH)
                .dishName("Paneer Butter Masala Thali")
                .description("Paneer sabji, dal tadka, 3 chapati, rice, gulab jamun")
                .price(new BigDecimal("120.00"))
                .isAvailable(true)
                .isSpecial(true)
                .build();

        mockMvc.perform(post("/api/v1/owner/mess/menu/items")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(menuItem)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.dishName").value("Paneer Butter Masala Thali"));

        // =========================================================================
        // STEP 2: Owner Submission (Submit for Admin Verification)
        // =========================================================================

        SubmitVerificationRequest submitRequest = SubmitVerificationRequest.builder()
                .messId(messId)
                .build();

        mockMvc.perform(post("/api/v1/owner/mess/submit-verification")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(submitRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("PENDING"));

        // =========================================================================
        // STEP 3: Student Isolation (Pending mess must NOT appear in search)
        // =========================================================================

        // 3a. Register Student
        StudentRegisterRequest studentReg = StudentRegisterRequest.builder()
                .name("Amit Patil")
                .email(STUDENT_EMAIL)
                .password(COMMON_PASS)
                .phone("+91 91234 56789")
                .college("Pune Institute of Computer Technology")
                .build();

        mockMvc.perform(post("/api/v1/auth/student/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(studentReg)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));

        // 3b. Student Searches Messes: Pending mess MUST NOT be in public results
        mockMvc.perform(get("/api/v1/messes")
                        .param("search", "Shree Ganesh")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(0)));

        // 3b-2. Student Nearby Search: Pending mess MUST NOT be in nearby results
        mockMvc.perform(get("/api/v1/messes/nearby")
                        .param("latitude", "18.5204")
                        .param("longitude", "73.8402")
                        .param("radiusKm", "5.0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(0)));

        // 3c. Direct lookup of unapproved mess returns 404
        mockMvc.perform(get("/api/v1/messes/" + messId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        // =========================================================================
        // STEP 4: Admin Approval (Admin reviews and approves pending mess)
        // =========================================================================

        // 4a. Admin Login
        LoginRequest adminLogin = LoginRequest.builder()
                .email(ADMIN_EMAIL)
                .password(COMMON_PASS)
                .build();

        MvcResult adminLoginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andReturn();

        String adminToken = objectMapper.readTree(adminLoginResult.getResponse().getContentAsString())
                .path("data").path("token").asText();

        // 4b. Admin Lists Pending Messes: confirms mess is present
        mockMvc.perform(get("/api/v1/admin/messes/pending")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[*].id", hasItem((int) messId)));

        // 4c. Admin Approves Mess
        mockMvc.perform(post("/api/v1/admin/messes/" + messId + "/approve")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("APPROVED"));

        // =========================================================================
        // STEP 5: Student Discovery (Approved mess is now discoverable with menu)
        // =========================================================================

        // 5a. Student searches again: mess is now visible
        mockMvc.perform(get("/api/v1/messes")
                        .param("search", "Shree Ganesh")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id").value(messId))
                .andExpect(jsonPath("$.data[0].name").value("Shree Ganesh Executive Mess"))
                .andExpect(jsonPath("$.data[0].status").value("APPROVED"));

        // 5b. Student retrieves detailed profile and verifies menu item
        mockMvc.perform(get("/api/v1/messes/" + messId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Shree Ganesh Executive Mess"))
                .andExpect(jsonPath("$.data.menuItems", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data.menuItems[0].dishName").value("Paneer Butter Masala Thali"));

        // 5c. Student Nearby Search: Approved mess appears with distance
        mockMvc.perform(get("/api/v1/messes/nearby")
                        .param("latitude", "18.5204")
                        .param("longitude", "73.8402")
                        .param("radiusKm", "5.0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id").value(messId))
                .andExpect(jsonPath("$.data[0].distanceKm").value(closeTo(0.0, 0.1)));

        // 5d. Student Nearby Search with small radius excludes the mess
        mockMvc.perform(get("/api/messes/nearby")
                        .param("latitude", "18.5700")
                        .param("longitude", "73.8402")
                        .param("radiusKm", "1.0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(0)));

        // =========================================================================
        // STEP 6: Admin Suspension & Unsuspension Lifecycle
        // =========================================================================

        // 6a. Admin Suspends Mess
        SuspendMessRequest suspendRequest = new SuspendMessRequest();
        suspendRequest.setReason("Temporary hygiene inspection pending.");

        mockMvc.perform(post("/api/v1/admin/messes/" + messId + "/suspend")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(suspendRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("SUSPENDED"));

        // 6b. Student searches: suspended mess immediately disappears from discovery
        mockMvc.perform(get("/api/v1/messes")
                        .param("search", "Shree Ganesh")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(0)));

        // 6b-2. Student Nearby Search: suspended mess immediately disappears from nearby discovery
        mockMvc.perform(get("/api/v1/messes/nearby")
                        .param("latitude", "18.5204")
                        .param("longitude", "73.8402")
                        .param("radiusKm", "5.0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(0)));

        // 6c. Admin Unsuspends Mess
        mockMvc.perform(post("/api/v1/admin/messes/" + messId + "/unsuspend")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("APPROVED"));

        // 6d. Student searches again: unsuspended mess immediately reappears
        mockMvc.perform(get("/api/v1/messes")
                        .param("search", "Shree Ganesh")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id").value(messId))
                .andExpect(jsonPath("$.data[0].status").value("APPROVED"));

        // 6d-2. Student Nearby Search: unsuspended mess immediately reappears in nearby discovery
        mockMvc.perform(get("/api/v1/messes/nearby")
                        .param("latitude", "18.5204")
                        .param("longitude", "73.8402")
                        .param("radiusKm", "5.0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id").value(messId));
    }
}
