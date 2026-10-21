package com.messmap.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.messmap.modules.menu.dto.CreateMenuItemRequest;
import com.messmap.modules.menu.dto.UpdateMenuItemRequest;
import com.messmap.modules.menu.entity.MealType;
import com.messmap.modules.menu.entity.MenuItem;
import com.messmap.modules.menu.repository.MenuItemRepository;
import com.messmap.modules.mess.entity.FoodType;
import com.messmap.modules.mess.entity.Mess;
import com.messmap.modules.mess.entity.MessStatus;
import com.messmap.modules.mess.entity.OperatingStatus;
import com.messmap.modules.mess.repository.MessRepository;
import com.messmap.modules.review.dto.CreateReviewRequest;
import com.messmap.modules.user.entity.Role;
import com.messmap.modules.user.entity.User;
import com.messmap.modules.user.entity.UserStatus;
import com.messmap.modules.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * End-to-end Role-Based Access Control (RBAC) Security Matrix Integration Tests.
 * Fulfills GitHub Issue #6 acceptance criteria:
 * - Verifies HTTP 401 for unauthenticated calls to protected routes
 * - Verifies HTTP 403 for cross-role access attempts across Student, Owner, and Admin domains
 * - Verifies permitted role access across all functional endpoint categories
 * - Verifies resource ownership boundaries (cross-owner tamper resistance)
 * - Verifies public endpoint accessibility without tokens
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class RbacSecurityMatrixTest {

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
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    private User adminUser;
    private String adminToken;

    private User studentUser;
    private String studentToken;

    private User ownerA;
    private String ownerTokenA;

    private User ownerB;
    private String ownerTokenB;

    private Mess messOwnerA;
    private Mess messOwnerB;
    private Mess pendingMess;
    private MenuItem menuItemOwnerA;

    @BeforeEach
    void setUp() {
        menuItemRepository.deleteAll();
        messRepository.deleteAll();
        userRepository.deleteAll();

        // 1. Admin Actor
        adminUser = userRepository.save(User.builder()
                .name("Root Administrator")
                .email("admin.rbac@messmap.com")
                .password(passwordEncoder.encode("AdminPass123!"))
                .role(Role.ROLE_ADMIN)
                .status(UserStatus.ACTIVE)
                .build());
        adminToken = "Bearer " + tokenProvider.generateToken(adminUser);

        // 2. Student Actor
        studentUser = userRepository.save(User.builder()
                .name("Rohan Student")
                .email("rohan.student@messmap.com")
                .password(passwordEncoder.encode("StudentPass123!"))
                .role(Role.ROLE_STUDENT)
                .status(UserStatus.ACTIVE)
                .build());
        studentToken = "Bearer " + tokenProvider.generateToken(studentUser);

        // 3. Owner A Actor
        ownerA = userRepository.save(User.builder()
                .name("Suresh Owner")
                .email("suresh.owner@messmap.com")
                .password(passwordEncoder.encode("OwnerPass123!"))
                .role(Role.ROLE_MESS_OWNER)
                .status(UserStatus.ACTIVE)
                .build());
        ownerTokenA = "Bearer " + tokenProvider.generateToken(ownerA);

        // 4. Owner B Actor (for cross-owner isolation tests)
        ownerB = userRepository.save(User.builder()
                .name("Dinesh Owner")
                .email("dinesh.owner@messmap.com")
                .password(passwordEncoder.encode("OwnerPass123!"))
                .role(Role.ROLE_MESS_OWNER)
                .status(UserStatus.ACTIVE)
                .build());
        ownerTokenB = "Bearer " + tokenProvider.generateToken(ownerB);

        // Approved Mess for Owner A
        messOwnerA = messRepository.save(Mess.builder()
                .owner(ownerA)
                .name("Suresh Dining Hall")
                .address("FC Road, Deccan")
                .city("Pune")
                .area("Deccan")
                .foodType(FoodType.PURE_VEG)
                .monthlyPrice(new BigDecimal("2800.00"))
                .dailyPrice(new BigDecimal("95.00"))
                .status(MessStatus.APPROVED)
                .operatingStatus(OperatingStatus.OPEN)
                .build());

        // Approved Mess for Owner B
        messOwnerB = messRepository.save(Mess.builder()
                .owner(ownerB)
                .name("Dinesh Special Thali")
                .address("Karve Nagar")
                .city("Pune")
                .area("Karve Nagar")
                .foodType(FoodType.VEG_AND_NON_VEG)
                .monthlyPrice(new BigDecimal("3200.00"))
                .dailyPrice(new BigDecimal("110.00"))
                .status(MessStatus.APPROVED)
                .operatingStatus(OperatingStatus.OPEN)
                .build());

        // Pending Mess for verification queue tests
        pendingMess = messRepository.save(Mess.builder()
                .owner(ownerA)
                .name("New Branch Mess")
                .address("Kothrud Depot")
                .city("Pune")
                .area("Kothrud")
                .foodType(FoodType.PURE_VEG)
                .status(MessStatus.PENDING)
                .operatingStatus(OperatingStatus.CLOSED)
                .build());

        // Menu item belonging to Owner A
        menuItemOwnerA = menuItemRepository.save(MenuItem.builder()
                .mess(messOwnerA)
                .name("Paneer Butter Masala Thali")
                .description("Rich paneer gravy with 3 rotis")
                .dayOfWeek("MONDAY")
                .mealType(MealType.LUNCH)
                .price(new BigDecimal("120.00"))
                .isAvailable(true)
                .isSpecial(true)
                .build());
    }

    // =========================================================================
    // Category 1: Public Endpoints (Permitted without authentication)
    // =========================================================================
    @Nested
    @DisplayName("1. Public Access Control (PermitAll)")
    class PublicAccessTests {

        @Test
        @DisplayName("GET /api/messes - Public can browse approved mess catalog without token")
        void publicCanBrowseApprovedMesses() throws Exception {
            mockMvc.perform(get("/api/messes"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data", notNullValue()));
        }

        @Test
        @DisplayName("GET /api/messes/{id} - Public can view approved mess details without token")
        void publicCanViewApprovedMessDetails() throws Exception {
            mockMvc.perform(get("/api/messes/{id}", messOwnerA.getId()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data.id", is(messOwnerA.getId().intValue())));
        }

        @Test
        @DisplayName("GET /api/v1/health - Public can view health check status")
        void publicCanCheckHealth() throws Exception {
            mockMvc.perform(get("/api/v1/health"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.status", is("UP")));
        }

        @Test
        @DisplayName("GET /api/messes/{id}/reviews - Public can view mess reviews without token")
        void publicCanViewMessReviews() throws Exception {
            mockMvc.perform(get("/api/messes/{messId}/reviews", messOwnerA.getId()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data.reviews", notNullValue()));
        }
    }

    // =========================================================================
    // Category 2: Admin Protected Endpoints (/api/admin/**)
    // =========================================================================
    @Nested
    @DisplayName("2. Admin Endpoints Access Control (/api/admin/**)")
    class AdminEndpointTests {

        @Test
        @DisplayName("GET /api/admin/metrics - Unauthenticated request returns 401 Unauthorized")
        void unauthenticatedMetricsReturns401() throws Exception {
            mockMvc.perform(get("/api/admin/metrics"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("GET /api/admin/metrics - Student token returns 403 Forbidden")
        void studentOnAdminMetricsReturns403() throws Exception {
            mockMvc.perform(get("/api/admin/metrics")
                            .header(HttpHeaders.AUTHORIZATION, studentToken))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("GET /api/admin/metrics - Mess Owner token returns 403 Forbidden")
        void ownerOnAdminMetricsReturns403() throws Exception {
            mockMvc.perform(get("/api/admin/metrics")
                            .header(HttpHeaders.AUTHORIZATION, ownerTokenA))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("GET /api/admin/metrics - Admin token returns 200 OK")
        void adminOnAdminMetricsReturns200() throws Exception {
            mockMvc.perform(get("/api/admin/metrics")
                            .header(HttpHeaders.AUTHORIZATION, adminToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data.totalMesses", notNullValue()));
        }

        @Test
        @DisplayName("GET /api/admin/users - Student token returns 403 Forbidden")
        void studentOnAdminUsersReturns403() throws Exception {
            mockMvc.perform(get("/api/admin/users")
                            .header(HttpHeaders.AUTHORIZATION, studentToken))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("GET /api/admin/users - Owner token returns 403 Forbidden")
        void ownerOnAdminUsersReturns403() throws Exception {
            mockMvc.perform(get("/api/admin/users")
                            .header(HttpHeaders.AUTHORIZATION, ownerTokenA))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("GET /api/admin/users - Admin token returns 200 OK")
        void adminOnAdminUsersReturns200() throws Exception {
            mockMvc.perform(get("/api/admin/users")
                            .header(HttpHeaders.AUTHORIZATION, adminToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data.content", notNullValue()));
        }

        @Test
        @DisplayName("GET /api/admin/messes/pending - Student token returns 403 Forbidden")
        void studentOnAdminPendingMessesReturns403() throws Exception {
            mockMvc.perform(get("/api/admin/messes/pending")
                            .header(HttpHeaders.AUTHORIZATION, studentToken))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("GET /api/admin/messes/pending - Owner token returns 403 Forbidden")
        void ownerOnAdminPendingMessesReturns403() throws Exception {
            mockMvc.perform(get("/api/admin/messes/pending")
                            .header(HttpHeaders.AUTHORIZATION, ownerTokenA))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("GET /api/admin/messes/pending - Admin token returns 200 OK")
        void adminOnAdminPendingMessesReturns200() throws Exception {
            mockMvc.perform(get("/api/admin/messes/pending")
                            .header(HttpHeaders.AUTHORIZATION, adminToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data", hasSize(1)));
        }

        @Test
        @DisplayName("POST /api/admin/messes/{id}/approve - Student token returns 403 Forbidden")
        void studentCannotApproveMess() throws Exception {
            mockMvc.perform(post("/api/admin/messes/{id}/approve", pendingMess.getId())
                            .header(HttpHeaders.AUTHORIZATION, studentToken))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("POST /api/admin/messes/{id}/approve - Owner token returns 403 Forbidden")
        void ownerCannotApproveMess() throws Exception {
            mockMvc.perform(post("/api/admin/messes/{id}/approve", pendingMess.getId())
                            .header(HttpHeaders.AUTHORIZATION, ownerTokenA))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("POST /api/admin/messes/{id}/approve - Admin token successfully approves mess (200 OK)")
        void adminCanApproveMess() throws Exception {
            mockMvc.perform(post("/api/admin/messes/{id}/approve", pendingMess.getId())
                            .header(HttpHeaders.AUTHORIZATION, adminToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data.status", is("APPROVED")));
        }
    }

    // =========================================================================
    // Category 3: Mess Owner Endpoints (/api/owner/**)
    // =========================================================================
    @Nested
    @DisplayName("3. Mess Owner Endpoints Access Control (/api/owner/**)")
    class OwnerEndpointTests {

        @Test
        @DisplayName("GET /api/owner/mess - Unauthenticated request returns 401 Unauthorized")
        void unauthenticatedOwnerMessReturns401() throws Exception {
            mockMvc.perform(get("/api/owner/mess"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("GET /api/owner/mess - Student token returns 403 Forbidden")
        void studentOnOwnerMessReturns403() throws Exception {
            mockMvc.perform(get("/api/owner/mess")
                            .header(HttpHeaders.AUTHORIZATION, studentToken))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("GET /api/owner/mess - Authenticated Owner returns 200 OK")
        void ownerCanAccessOwnMess() throws Exception {
            mockMvc.perform(get("/api/owner/mess")
                            .header(HttpHeaders.AUTHORIZATION, ownerTokenA))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data.name", is("Suresh Dining Hall")));
        }

        @Test
        @DisplayName("GET /api/owner/mess/menu - Student token returns 403 Forbidden")
        void studentOnOwnerMenuReturns403() throws Exception {
            mockMvc.perform(get("/api/owner/mess/menu")
                            .header(HttpHeaders.AUTHORIZATION, studentToken))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("GET /api/owner/mess/menu - Authenticated Owner returns 200 OK")
        void ownerCanAccessOwnMenu() throws Exception {
            mockMvc.perform(get("/api/owner/mess/menu")
                            .header(HttpHeaders.AUTHORIZATION, ownerTokenA))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data.messName", is("Suresh Dining Hall")));
        }

        @Test
        @DisplayName("POST /api/owner/mess/menu/items - Student token returns 403 Forbidden")
        void studentCannotCreateMenuItem() throws Exception {
            CreateMenuItemRequest request = CreateMenuItemRequest.builder()
                    .dayOfWeek("TUESDAY")
                    .mealType(MealType.LUNCH)
                    .dishName("Dal Tadka")
                    .price(new BigDecimal("60.00"))
                    .build();

            mockMvc.perform(post("/api/owner/mess/menu/items")
                            .header(HttpHeaders.AUTHORIZATION, studentToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("POST /api/owner/mess/menu/items - Authenticated Owner creates dish successfully (201 Created)")
        void ownerCanCreateMenuItem() throws Exception {
            CreateMenuItemRequest request = CreateMenuItemRequest.builder()
                    .dayOfWeek("TUESDAY")
                    .mealType(MealType.LUNCH)
                    .dishName("Dal Tadka")
                    .price(new BigDecimal("60.00"))
                    .build();

            mockMvc.perform(post("/api/owner/mess/menu/items")
                            .header(HttpHeaders.AUTHORIZATION, ownerTokenA)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data.dishName", is("Dal Tadka")));
        }

        @Test
        @DisplayName("Admin has oversight permission on /api/owner/mess (200 OK)")
        void adminCanAccessOwnerMessEndpoint() throws Exception {
            mockMvc.perform(get("/api/owner/mess/{id}", messOwnerA.getId())
                            .header(HttpHeaders.AUTHORIZATION, adminToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)));
        }
    }

    // =========================================================================
    // Category 4: Cross-Owner Resource Isolation (IDOR Boundary)
    // =========================================================================
    @Nested
    @DisplayName("4. Cross-Owner Resource Isolation")
    class CrossOwnerIsolationTests {

        @Test
        @DisplayName("PUT /api/owner/mess/menu/items/{id} - Owner B cannot edit Owner A's dish (403 Forbidden)")
        void ownerCannotEditAnotherOwnersMenuItem() throws Exception {
            UpdateMenuItemRequest updateReq = UpdateMenuItemRequest.builder()
                    .dishName("Hacked Dish Name")
                    .price(new BigDecimal("10.00"))
                    .build();

            mockMvc.perform(put("/api/owner/mess/menu/items/{id}", menuItemOwnerA.getId())
                            .header(HttpHeaders.AUTHORIZATION, ownerTokenB)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updateReq)))
                    .andExpect(status().isForbidden())
                    .andExpect(jsonPath("$.status", is(403)));
        }

        @Test
        @DisplayName("DELETE /api/owner/mess/menu/items/{id} - Owner B cannot delete Owner A's dish (403 Forbidden)")
        void ownerCannotDeleteAnotherOwnersMenuItem() throws Exception {
            mockMvc.perform(delete("/api/owner/mess/menu/items/{id}", menuItemOwnerA.getId())
                            .header(HttpHeaders.AUTHORIZATION, ownerTokenB))
                    .andExpect(status().isForbidden())
                    .andExpect(jsonPath("$.status", is(403)));
        }

        @Test
        @DisplayName("PUT /api/owner/mess/{id} - Owner B cannot modify Owner A's mess profile (403 Forbidden)")
        void ownerCannotModifyAnotherOwnersMess() throws Exception {
            mockMvc.perform(put("/api/owner/mess/{id}", messOwnerA.getId())
                            .header(HttpHeaders.AUTHORIZATION, ownerTokenB)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"name\":\"Stolen Mess\",\"address\":\"New Addr\"}"))
                    .andExpect(status().isForbidden())
                    .andExpect(jsonPath("$.status", is(403)));
        }
    }

    // =========================================================================
    // Category 5: Student Protected Endpoints (/api/student/**)
    // =========================================================================
    @Nested
    @DisplayName("5. Student Endpoints Access Control (/api/student/**)")
    class StudentEndpointTests {

        @Test
        @DisplayName("GET /api/student/favorites - Unauthenticated request returns 401 Unauthorized")
        void unauthenticatedStudentFavoritesReturns401() throws Exception {
            mockMvc.perform(get("/api/student/favorites"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("GET /api/student/favorites - Owner token returns 403 Forbidden")
        void ownerOnStudentFavoritesReturns403() throws Exception {
            mockMvc.perform(get("/api/student/favorites")
                            .header(HttpHeaders.AUTHORIZATION, ownerTokenA))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("GET /api/student/favorites - Student token returns 200 OK")
        void studentCanAccessOwnFavorites() throws Exception {
            mockMvc.perform(get("/api/student/favorites")
                            .header(HttpHeaders.AUTHORIZATION, studentToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data", is(empty())));
        }

        @Test
        @DisplayName("POST /api/student/favorites/{messId} - Owner token returns 403 Forbidden")
        void ownerCannotBookmarkFavoriteMess() throws Exception {
            mockMvc.perform(post("/api/student/favorites/{messId}", messOwnerA.getId())
                            .header(HttpHeaders.AUTHORIZATION, ownerTokenA))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("POST /api/student/favorites/{messId} - Student token adds bookmark (201 Created)")
        void studentCanBookmarkFavoriteMess() throws Exception {
            mockMvc.perform(post("/api/student/favorites/{messId}", messOwnerA.getId())
                            .header(HttpHeaders.AUTHORIZATION, studentToken))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.success", is(true)));
        }

        @Test
        @DisplayName("GET /api/student/profile - Owner token returns 403 Forbidden")
        void ownerOnStudentProfileReturns403() throws Exception {
            mockMvc.perform(get("/api/student/profile")
                            .header(HttpHeaders.AUTHORIZATION, ownerTokenA))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("GET /api/student/profile - Student token returns 200 OK")
        void studentCanAccessOwnProfile() throws Exception {
            mockMvc.perform(get("/api/student/profile")
                            .header(HttpHeaders.AUTHORIZATION, studentToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data.email", is("rohan.student@messmap.com")));
        }
    }

    // =========================================================================
    // Category 6: Review & Rating Role Restrictions
    // =========================================================================
    @Nested
    @DisplayName("6. Review & Rating Access Control")
    class ReviewAccessTests {

        @Test
        @DisplayName("POST /api/messes/{id}/reviews - Unauthenticated request returns 401 Unauthorized")
        void unauthenticatedReviewSubmissionReturns401() throws Exception {
            CreateReviewRequest reviewRequest = CreateReviewRequest.builder()
                    .rating(5)
                    .comment("Delicious hot food!")
                    .foodQualityScore(5)
                    .hygieneScore(4)
                    .build();

            mockMvc.perform(post("/api/messes/{messId}/reviews", messOwnerA.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(reviewRequest)))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("POST /api/messes/{id}/reviews - Mess Owner token returns 403 Forbidden (Owners cannot review)")
        void ownerCannotSubmitReview() throws Exception {
            CreateReviewRequest reviewRequest = CreateReviewRequest.builder()
                    .rating(5)
                    .comment("Owner promoting self")
                    .foodQualityScore(5)
                    .hygieneScore(5)
                    .build();

            mockMvc.perform(post("/api/messes/{messId}/reviews", messOwnerA.getId())
                            .header(HttpHeaders.AUTHORIZATION, ownerTokenA)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(reviewRequest)))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("POST /api/messes/{id}/reviews - Student token submits review successfully (201 Created)")
        void studentCanSubmitReview() throws Exception {
            CreateReviewRequest reviewRequest = CreateReviewRequest.builder()
                    .rating(4)
                    .comment("Clean environment and good rotis.")
                    .foodQualityScore(4)
                    .hygieneScore(4)
                    .build();

            mockMvc.perform(post("/api/messes/{messId}/reviews", messOwnerA.getId())
                            .header(HttpHeaders.AUTHORIZATION, studentToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(reviewRequest)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data.rating", is(4)));
        }
    }

    // =========================================================================
    // Category 7: Malformed, Missing or Forged JWT Tokens
    // =========================================================================
    @Nested
    @DisplayName("7. Token Validation Security")
    class TokenValidationTests {

        @Test
        @DisplayName("Protected endpoint with malformed JWT returns 401 Unauthorized")
        void malformedTokenReturns401() throws Exception {
            mockMvc.perform(get("/api/admin/metrics")
                            .header(HttpHeaders.AUTHORIZATION, "Bearer this.is.a.malformed.jwt.token"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Protected endpoint with token lacking 'Bearer ' prefix returns 401 Unauthorized")
        void tokenWithoutBearerPrefixReturns401() throws Exception {
            String rawToken = tokenProvider.generateToken(studentUser);
            mockMvc.perform(get("/api/student/favorites")
                            .header(HttpHeaders.AUTHORIZATION, rawToken))
                    .andExpect(status().isUnauthorized());
        }
    }
}
