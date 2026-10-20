package com.messmap.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.messmap.modules.menu.dto.CreateMenuItemRequest;
import com.messmap.modules.menu.entity.MealType;
import com.messmap.modules.menu.repository.MenuItemRepository;
import com.messmap.modules.mess.dto.CreateMessRequest;
import com.messmap.modules.mess.dto.SubmitVerificationRequest;
import com.messmap.modules.mess.dto.UpdateMessProfileRequest;
import com.messmap.modules.mess.entity.FoodType;
import com.messmap.modules.mess.entity.MessStatus;
import com.messmap.modules.favorite.repository.FavoriteRepository;
import com.messmap.modules.mess.repository.MessRepository;
import com.messmap.modules.review.dto.CreateReviewRequest;
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
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Regression and validation test suite covering the Four MessMap Functional Bugs:
 *
 * Bug 1: Mess registration and discovery in arbitrary (non-predefined) locations.
 * Bug 2: Latitude, longitude, address synchronization, persistence, and coordinate validation.
 * Bug 3: Password policy consistency (minimum 6 characters) across all registration endpoints.
 * Bug 4: Owner data isolation, empty states for newly registered owners, cross-owner access control,
 *        and review isolation.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class FourBugsRegressionIntegrationTest {

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

    private static final String ADMIN_EMAIL = "admin.bugs@messmap.com";
    private static final String COMMON_PASS = "ValidPassword123!";

    @BeforeEach
    void setUp() {
        cleanupData();

        if (!userRepository.existsByEmail(ADMIN_EMAIL)) {
            userRepository.save(User.builder()
                    .name("Bug Regression Admin")
                    .email(ADMIN_EMAIL)
                    .password(passwordEncoder.encode(COMMON_PASS))
                    .phone("+91 99999 11111")
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
        favoriteRepository.deleteAll();
        reviewRepository.deleteAll();
        menuItemRepository.deleteAll();
        messRepository.deleteAll();

        List<String> emails = List.of(
                ADMIN_EMAIL,
                "owner.bug1@messmap.com",
                "owner.bug2@messmap.com",
                "student.bug1@student.ac.in",
                "owner1.bug4@messmap.com",
                "owner2.bug4@messmap.com",
                "student.bug4@student.ac.in",
                "pass.test.student6@student.ac.in",
                "pass.test.owner6@messmap.com",
                "pass.test.student7@student.ac.in",
                "pass.test.owner7@messmap.com"
        );

        for (String email : emails) {
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

    // =========================================================================
    // BUG 1: Mess Registration & Discovery in Arbitrary Locations
    // =========================================================================
    @Test
    @DisplayName("Bug 1: Register and discover mess in arbitrary location outside predefined list")
    void testBug1_MessRegistrationAndDiscoveryInArbitraryLocation() throws Exception {
        String ownerEmail = "owner.bug1@messmap.com";
        String studentEmail = "student.bug1@student.ac.in";

        // 1. Register Owner
        OwnerRegistrationRequest ownerReg = OwnerRegistrationRequest.builder()
                .name("Arbitrary Location Owner")
                .email(ownerEmail)
                .password(COMMON_PASS)
                .phone("+91 98765 11111")
                .college("Pune University")
                .hostel("Block C")
                .build();

        mockMvc.perform(post("/api/v1/auth/register/owner")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(ownerReg)))
                .andExpect(status().isCreated());

        String ownerToken = loginUser(ownerEmail, COMMON_PASS);

        // 2. Register Mess with arbitrary location: Balewadi High Street, Pimpri-Chinchwad
        CreateMessRequest messRequest = CreateMessRequest.builder()
                .name("Sahyadri Elite Mess")
                .description("Quality homely meals in Balewadi")
                .address("Shop 42, High Street Promenade")
                .area("Balewadi High Street") // Arbitrary area not in predefined list
                .city("Pimpri-Chinchwad")      // Arbitrary city
                .state("Maharashtra")
                .pincode("411045")
                .phone("+91 98765 11111")
                .foodType("PURE_VEG")
                .lunchTiming("12:00 PM – 03:00 PM")
                .dailyPrice(new BigDecimal("130.00"))
                .monthlyPrice(new BigDecimal("3500.00"))
                .latitude(new BigDecimal("18.578900"))
                .longitude(new BigDecimal("73.770700"))
                .status("DRAFT")
                .build();

        MvcResult createMessResult = mockMvc.perform(post("/api/v1/owner/mess")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(messRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.area").value("Balewadi High Street"))
                .andExpect(jsonPath("$.data.city").value("Pimpri-Chinchwad"))
                .andReturn();

        long messId = objectMapper.readTree(createMessResult.getResponse().getContentAsString())
                .path("data").path("id").asLong();

        // 3. Submit for verification
        SubmitVerificationRequest submitRequest = SubmitVerificationRequest.builder()
                .messId(messId)
                .build();

        mockMvc.perform(post("/api/v1/owner/mess/submit-verification")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(submitRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PENDING"));

        // 4. Register student
        StudentRegisterRequest studentReg = StudentRegisterRequest.builder()
                .name("Student Discovery Tester")
                .email(studentEmail)
                .password(COMMON_PASS)
                .phone("+91 91234 11111")
                .college("COEP")
                .build();

        mockMvc.perform(post("/api/v1/auth/student/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(studentReg)))
                .andExpect(status().isCreated());

        // 5. Verify pending mess is NOT visible to student in search by area or city
        mockMvc.perform(get("/api/v1/messes")
                        .param("locality", "Balewadi High Street")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(0)));

        mockMvc.perform(get("/api/v1/messes")
                        .param("search", "Pimpri-Chinchwad")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(0)));

        // 6. Admin approves mess
        String adminToken = loginUser(ADMIN_EMAIL, COMMON_PASS);
        mockMvc.perform(post("/api/v1/admin/messes/" + messId + "/approve")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("APPROVED"));

        // 7. Verify student can now discover mess by arbitrary locality, city, or address search
        mockMvc.perform(get("/api/v1/messes")
                        .param("locality", "Balewadi High Street")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id").value(messId))
                .andExpect(jsonPath("$.data[0].area").value("Balewadi High Street"))
                .andExpect(jsonPath("$.data[0].city").value("Pimpri-Chinchwad"));

        mockMvc.perform(get("/api/v1/messes")
                        .param("search", "Pimpri-Chinchwad")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id").value(messId));

        mockMvc.perform(get("/api/v1/messes")
                        .param("search", "High Street Promenade")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id").value(messId));
    }

    // =========================================================================
    // BUG 2: Coordinate & Address Synchronization, Persistence, and Validation
    // =========================================================================
    @Test
    @DisplayName("Bug 2: Synchronize and persist updated coordinates and address, reject invalid ranges")
    void testBug2_CoordinatePersistenceAndValidation() throws Exception {
        String ownerEmail = "owner.bug2@messmap.com";

        OwnerRegistrationRequest ownerReg = OwnerRegistrationRequest.builder()
                .name("Coordinate Sync Owner")
                .email(ownerEmail)
                .password(COMMON_PASS)
                .phone("+91 98765 22222")
                .college("Pune University")
                .build();

        mockMvc.perform(post("/api/v1/auth/register/owner")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(ownerReg)))
                .andExpect(status().isCreated());

        String ownerToken = loginUser(ownerEmail, COMMON_PASS);

        // 1. Initial Mess Creation
        CreateMessRequest messRequest = CreateMessRequest.builder()
                .name("Coordinate Test Mess")
                .address("Initial Address 1")
                .area("Kothrud")
                .city("Pune")
                .phone("+91 98765 22222")
                .latitude(new BigDecimal("18.507400"))
                .longitude(new BigDecimal("73.807700"))
                .build();

        MvcResult createMessResult = mockMvc.perform(post("/api/v1/owner/mess")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(messRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        long messId = objectMapper.readTree(createMessResult.getResponse().getContentAsString())
                .path("data").path("id").asLong();

        // 2. Owner updates location and coordinates (e.g. from moving map pin or selecting new address)
        UpdateMessProfileRequest updateLocation = UpdateMessProfileRequest.builder()
                .name("Coordinate Test Mess")
                .address("Lane 7, Near Cummins College, Karve Nagar")
                .area("Karve Nagar")
                .city("Pune")
                .pincode("411052")
                .latitude(new BigDecimal("18.490123"))
                .longitude(new BigDecimal("73.818456"))
                .build();

        mockMvc.perform(put("/api/v1/owner/mess/" + messId)
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateLocation)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.address").value("Lane 7, Near Cummins College, Karve Nagar"))
                .andExpect(jsonPath("$.data.area").value("Karve Nagar"))
                .andExpect(jsonPath("$.data.latitude").value(18.490123))
                .andExpect(jsonPath("$.data.longitude").value(73.818456));

        // 3. Reload profile via GET and confirm persistence
        mockMvc.perform(get("/api/v1/owner/mess/" + messId)
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.address").value("Lane 7, Near Cummins College, Karve Nagar"))
                .andExpect(jsonPath("$.data.area").value("Karve Nagar"))
                .andExpect(jsonPath("$.data.pincode").value("411052"))
                .andExpect(jsonPath("$.data.latitude").value(18.490123))
                .andExpect(jsonPath("$.data.longitude").value(73.818456));

        // 4. Test invalid coordinate boundary validation: Latitude > 90.0
        UpdateMessProfileRequest invalidLat = UpdateMessProfileRequest.builder()
                .latitude(new BigDecimal("95.000000"))
                .longitude(new BigDecimal("73.818456"))
                .build();

        mockMvc.perform(put("/api/v1/owner/mess/" + messId)
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidLat)))
                .andExpect(status().isBadRequest());

        // 5. Test invalid coordinate boundary validation: Longitude < -180.0
        UpdateMessProfileRequest invalidLng = UpdateMessProfileRequest.builder()
                .latitude(new BigDecimal("18.490123"))
                .longitude(new BigDecimal("-185.000000"))
                .build();

        mockMvc.perform(put("/api/v1/owner/mess/" + messId)
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidLng)))
                .andExpect(status().isBadRequest());
    }

    // =========================================================================
    // BUG 3: Password Length Policy Consistency (Minimum 6 Characters)
    // =========================================================================
    @Test
    @DisplayName("Bug 3: Enforce minimum 6 characters password validation consistently")
    void testBug3_PasswordPolicyConsistency() throws Exception {
        // 1. Student registration with 5 characters -> 400 Bad Request
        StudentRegisterRequest shortStudent = StudentRegisterRequest.builder()
                .name("Short Pass Student")
                .email("short.pass@student.ac.in")
                .password("12345") // Below 6 chars
                .college("COEP")
                .build();

        mockMvc.perform(post("/api/v1/auth/student/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(shortStudent)))
                .andExpect(status().isBadRequest());

        // 2. Owner registration with 5 characters -> 400 Bad Request
        OwnerRegistrationRequest shortOwner = OwnerRegistrationRequest.builder()
                .name("Short Pass Owner")
                .email("short.owner@messmap.com")
                .password("12345") // Below 6 chars
                .phone("+91 98765 33333")
                .build();

        mockMvc.perform(post("/api/v1/auth/register/owner")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(shortOwner)))
                .andExpect(status().isBadRequest());

        // 3. Exactly 6 characters -> 201 Created for Student
        StudentRegisterRequest exactStudent = StudentRegisterRequest.builder()
                .name("Exact Pass Student")
                .email("pass.test.student6@student.ac.in")
                .password("Abc123") // Exactly 6 chars
                .college("COEP")
                .build();

        mockMvc.perform(post("/api/v1/auth/student/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(exactStudent)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));

        // 4. Exactly 6 characters -> 201 Created for Owner
        OwnerRegistrationRequest exactOwner = OwnerRegistrationRequest.builder()
                .name("Exact Pass Owner")
                .email("pass.test.owner6@messmap.com")
                .password("Abc123") // Exactly 6 chars
                .phone("+91 98765 44444")
                .build();

        mockMvc.perform(post("/api/v1/auth/register/owner")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(exactOwner)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));

        // 5. Greater than 6 characters -> 201 Created
        StudentRegisterRequest longStudent = StudentRegisterRequest.builder()
                .name("Long Pass Student")
                .email("pass.test.student7@student.ac.in")
                .password("StrongPassword123!")
                .college("COEP")
                .build();

        mockMvc.perform(post("/api/v1/auth/student/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(longStudent)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }

    // =========================================================================
    // BUG 4: Owner Data Isolation, Empty States, and Review Isolation
    // =========================================================================
    @Test
    @DisplayName("Bug 4: Owner data isolation, empty states for new owners, cross-owner RBAC, review isolation")
    void testBug4_OwnerDataIsolationAndAccessControl() throws Exception {
        String owner1Email = "owner1.bug4@messmap.com";
        String owner2Email = "owner2.bug4@messmap.com";
        String studentEmail = "student.bug4@student.ac.in";

        // 1. Register Owner 1 and Owner 2
        OwnerRegistrationRequest owner1Reg = OwnerRegistrationRequest.builder()
                .name("Owner One")
                .email(owner1Email)
                .password(COMMON_PASS)
                .phone("+91 98765 55555")
                .build();

        mockMvc.perform(post("/api/v1/auth/register/owner")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(owner1Reg)))
                .andExpect(status().isCreated());

        OwnerRegistrationRequest owner2Reg = OwnerRegistrationRequest.builder()
                .name("Owner Two")
                .email(owner2Email)
                .password(COMMON_PASS)
                .phone("+91 98765 66666")
                .build();

        mockMvc.perform(post("/api/v1/auth/register/owner")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(owner2Reg)))
                .andExpect(status().isCreated());

        String token1 = loginUser(owner1Email, COMMON_PASS);
        String token2 = loginUser(owner2Email, COMMON_PASS);

        // 2. Newly registered Owner 2 calls /api/v1/owner/mess before creating any mess:
        // Must return 404 Not Found (triggering frontend empty state), NOT another owner's mess or hardcoded default
        mockMvc.perform(get("/api/v1/owner/mess")
                        .header("Authorization", "Bearer " + token2)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        // Newly registered Owner 2 calls /api/v1/owner/messes: must return empty list []
        mockMvc.perform(get("/api/v1/owner/messes")
                        .header("Authorization", "Bearer " + token2)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(0)));

        // 3. Owner 1 creates Mess 1 and adds a Menu Item
        CreateMessRequest mess1Request = CreateMessRequest.builder()
                .name("Owner 1 Royal Mess")
                .address("Lane 1, Deccan Gymkhana")
                .area("Deccan")
                .city("Pune")
                .phone("+91 98765 55555")
                .status("APPROVED")
                .build();

        MvcResult createMess1Result = mockMvc.perform(post("/api/v1/owner/mess")
                        .header("Authorization", "Bearer " + token1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mess1Request)))
                .andExpect(status().isCreated())
                .andReturn();

        long mess1Id = objectMapper.readTree(createMess1Result.getResponse().getContentAsString())
                .path("data").path("id").asLong();

        CreateMenuItemRequest menuItem1 = CreateMenuItemRequest.builder()
                .messId(mess1Id)
                .dayOfWeek("MONDAY")
                .mealType(MealType.LUNCH)
                .dishName("Owner 1 Signature Thali")
                .price(new BigDecimal("150.00"))
                .isAvailable(true)
                .build();

        mockMvc.perform(post("/api/v1/owner/mess/menu/items")
                        .header("Authorization", "Bearer " + token1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(menuItem1)))
                .andExpect(status().isCreated());

        // 4. Verify Owner 2 still has NO mess profile and NO dishes
        mockMvc.perform(get("/api/v1/owner/mess")
                        .header("Authorization", "Bearer " + token2)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/v1/owner/messes")
                        .header("Authorization", "Bearer " + token2)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(0)));

        // 5. Cross-owner access control: Owner 2 cannot view or update Mess 1
        mockMvc.perform(get("/api/v1/owner/mess/" + mess1Id)
                        .header("Authorization", "Bearer " + token2)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());

        UpdateMessProfileRequest maliciousUpdate = UpdateMessProfileRequest.builder()
                .name("Hacked By Owner 2")
                .build();

        mockMvc.perform(put("/api/v1/owner/mess/" + mess1Id)
                        .header("Authorization", "Bearer " + token2)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(maliciousUpdate)))
                .andExpect(status().isForbidden());

        // 6. Owner 2 creates their own Mess 2
        CreateMessRequest mess2Request = CreateMessRequest.builder()
                .name("Owner 2 Coastal Mess")
                .address("Survey 8, Viman Nagar")
                .area("Viman Nagar")
                .city("Pune")
                .phone("+91 98765 66666")
                .status("APPROVED")
                .build();

        MvcResult createMess2Result = mockMvc.perform(post("/api/v1/owner/mess")
                        .header("Authorization", "Bearer " + token2)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mess2Request)))
                .andExpect(status().isCreated())
                .andReturn();

        long mess2Id = objectMapper.readTree(createMess2Result.getResponse().getContentAsString())
                .path("data").path("id").asLong();

        // 7. Owner 2 now sees ONLY Mess 2
        mockMvc.perform(get("/api/v1/owner/mess")
                        .header("Authorization", "Bearer " + token2)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(mess2Id))
                .andExpect(jsonPath("$.data.name").value("Owner 2 Coastal Mess"));

        // 8. Reviews Isolation:
        // Initially Mess 2 must have 0 reviews
        mockMvc.perform(get("/api/v1/messes/" + mess2Id + "/reviews")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalReviews").value(0))
                .andExpect(jsonPath("$.data.reviews", hasSize(0)));

        // Admin approves Mess 1 so it can accept student reviews
        String adminToken = loginUser(ADMIN_EMAIL, COMMON_PASS);
        mockMvc.perform(post("/api/v1/admin/messes/" + mess1Id + "/approve")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        // Register student and post a review for Mess 1
        StudentRegisterRequest studentReg = StudentRegisterRequest.builder()
                .name("Reviewer Student")
                .email(studentEmail)
                .password(COMMON_PASS)
                .college("MIT")
                .build();

        mockMvc.perform(post("/api/v1/auth/student/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(studentReg)))
                .andExpect(status().isCreated());

        String studentToken = loginUser(studentEmail, COMMON_PASS);

        CreateReviewRequest review1 = CreateReviewRequest.builder()
                .rating(5)
                .comment("Excellent authentic food at Mess 1!")
                .foodQualityScore(5)
                .hygieneScore(5)
                .build();

        mockMvc.perform(post("/api/v1/messes/" + mess1Id + "/reviews")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(review1)))
                .andExpect(status().isCreated());

        // Verify Mess 1 has 1 review
        mockMvc.perform(get("/api/v1/messes/" + mess1Id + "/reviews")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalReviews").value(1))
                .andExpect(jsonPath("$.data.reviews", hasSize(1)))
                .andExpect(jsonPath("$.data.reviews[0].comment").value("Excellent authentic food at Mess 1!"));

        // Verify Mess 2 STILL has 0 reviews (no review leak or inheritance)
        mockMvc.perform(get("/api/v1/messes/" + mess2Id + "/reviews")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalReviews").value(0))
                .andExpect(jsonPath("$.data.reviews", hasSize(0)));
    }
}
