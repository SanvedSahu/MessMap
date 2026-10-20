package com.messmap.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.messmap.modules.complaint.repository.ComplaintRepository;
import com.messmap.modules.favorite.repository.FavoriteRepository;
import com.messmap.modules.menu.repository.MenuItemRepository;
import com.messmap.modules.mess.repository.MessImageRepository;
import com.messmap.modules.mess.repository.MessRepository;
import com.messmap.modules.review.repository.ReviewRepository;
import com.messmap.modules.user.entity.Role;
import com.messmap.modules.user.entity.User;
import com.messmap.modules.user.entity.UserStatus;
import com.messmap.modules.user.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for JWT Session Lifecycle, Token Expiration, and Tampering Rejection.
 * Fulfills GitHub Issue #19 acceptance criteria:
 * - Expired JWT tokens sent to protected endpoints are rejected with HTTP 401 Unauthorized.
 * - Forged and untrusted signature JWT tokens are rejected with HTTP 401 Unauthorized.
 * - Malformed, truncated, and empty authorization headers are rejected safely with HTTP 401.
 * - All unauthorized rejections produce standardized JSON ErrorResponse payloads.
 * - Valid tokens authenticate cleanly across roles (positive control).
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class JwtSessionLifecycleTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private MessImageRepository messImageRepository;

    @Autowired
    private MessRepository messRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider liveTokenProvider;

    private User adminUser;
    private User ownerUser;
    private User studentUser;

    private JwtTokenProvider expiredTokenProvider;
    private JwtTokenProvider untrustedKeyTokenProvider;

    private static final String APP_SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private static final String UNTRUSTED_SECRET = "999E635266556A586E3272357538782F413F4428472B4B6250645367566B9999";

    @BeforeEach
    void setUp() {
        cleanUpDatabase();

        // 1. Seed users
        adminUser = userRepository.save(User.builder()
                .name("Admin User")
                .email("admin.jwt@messmap.com")
                .password(passwordEncoder.encode("AdminPass123!"))
                .role(Role.ROLE_ADMIN)
                .status(UserStatus.ACTIVE)
                .build());

        ownerUser = userRepository.save(User.builder()
                .name("Owner User")
                .email("owner.jwt@messmap.com")
                .password(passwordEncoder.encode("OwnerPass123!"))
                .role(Role.ROLE_MESS_OWNER)
                .status(UserStatus.ACTIVE)
                .build());

        studentUser = userRepository.save(User.builder()
                .name("Student User")
                .email("student.jwt@messmap.com")
                .password(passwordEncoder.encode("StudentPass123!"))
                .role(Role.ROLE_STUDENT)
                .status(UserStatus.ACTIVE)
                .build());

        // 2. Deterministic expired token provider (-60 seconds expiration offset)
        expiredTokenProvider = new JwtTokenProvider(APP_SECRET, -60000L);

        // 3. Forged token provider with untrusted secret key
        untrustedKeyTokenProvider = new JwtTokenProvider(UNTRUSTED_SECRET, 86400000L);
    }

    @AfterEach
    void tearDown() {
        cleanUpDatabase();
    }

    private void cleanUpDatabase() {
        complaintRepository.deleteAll();
        favoriteRepository.deleteAll();
        reviewRepository.deleteAll();
        menuItemRepository.deleteAll();
        messImageRepository.deleteAll();
        messRepository.deleteAll();
        userRepository.deleteAll();
    }

    // =========================================================================
    // Category 1: Expired Token Rejection
    // =========================================================================
    @Nested
    @DisplayName("1. Expired JWT Rejection across Protected Endpoints")
    class ExpiredTokenTests {

        @Test
        @DisplayName("Expired Admin JWT accessing /api/admin/metrics returns 401 with standard ErrorResponse")
        void expiredAdminTokenReturns401() throws Exception {
            String expiredToken = expiredTokenProvider.generateToken(adminUser);

            mockMvc.perform(get("/api/admin/metrics")
                            .header(HttpHeaders.AUTHORIZATION, "Bearer " + expiredToken))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.status", is(401)))
                    .andExpect(jsonPath("$.error", is("Unauthorized")))
                    .andExpect(jsonPath("$.message", containsString("Full authentication is required")))
                    .andExpect(jsonPath("$.path", is("/api/admin/metrics")))
                    .andExpect(jsonPath("$.timestamp", notNullValue()));
        }

        @Test
        @DisplayName("Expired Mess Owner JWT accessing /api/owner/mess returns 401 with standard ErrorResponse")
        void expiredOwnerTokenReturns401() throws Exception {
            String expiredToken = expiredTokenProvider.generateToken(ownerUser);

            mockMvc.perform(get("/api/owner/mess")
                            .header(HttpHeaders.AUTHORIZATION, "Bearer " + expiredToken))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.status", is(401)))
                    .andExpect(jsonPath("$.error", is("Unauthorized")))
                    .andExpect(jsonPath("$.message", containsString("Full authentication is required")))
                    .andExpect(jsonPath("$.path", is("/api/owner/mess")))
                    .andExpect(jsonPath("$.timestamp", notNullValue()));
        }

        @Test
        @DisplayName("Expired Student JWT accessing /api/student/favorites returns 401 with standard ErrorResponse")
        void expiredStudentTokenReturns401() throws Exception {
            String expiredToken = expiredTokenProvider.generateToken(studentUser);

            mockMvc.perform(get("/api/student/favorites")
                            .header(HttpHeaders.AUTHORIZATION, "Bearer " + expiredToken))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.status", is(401)))
                    .andExpect(jsonPath("$.error", is("Unauthorized")))
                    .andExpect(jsonPath("$.message", containsString("Full authentication is required")))
                    .andExpect(jsonPath("$.path", is("/api/student/favorites")))
                    .andExpect(jsonPath("$.timestamp", notNullValue()));
        }

        @Test
        @DisplayName("Expired token on mutating POST /api/student/favorites/1 returns 401 and prevents mutation")
        void expiredTokenOnMutationReturns401() throws Exception {
            String expiredToken = expiredTokenProvider.generateToken(studentUser);

            mockMvc.perform(post("/api/student/favorites/1")
                            .header(HttpHeaders.AUTHORIZATION, "Bearer " + expiredToken))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.status", is(401)))
                    .andExpect(jsonPath("$.error", is("Unauthorized")))
                    .andExpect(jsonPath("$.path", is("/api/student/favorites/1")));
        }
    }

    // =========================================================================
    // Category 2: Forged & Untrusted Signature Token Rejection
    // =========================================================================
    @Nested
    @DisplayName("2. Forged and Untrusted Signature Rejection")
    class ForgedSignatureTests {

        @Test
        @DisplayName("JWT signed with an untrusted secret key accessing /api/admin/metrics returns 401")
        void forgedAdminTokenReturns401() throws Exception {
            String forgedToken = untrustedKeyTokenProvider.generateToken(adminUser);

            mockMvc.perform(get("/api/admin/metrics")
                            .header(HttpHeaders.AUTHORIZATION, "Bearer " + forgedToken))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.status", is(401)))
                    .andExpect(jsonPath("$.error", is("Unauthorized")))
                    .andExpect(jsonPath("$.path", is("/api/admin/metrics")));
        }

        @Test
        @DisplayName("JWT signed with an untrusted secret key accessing /api/student/favorites returns 401")
        void forgedStudentTokenReturns401() throws Exception {
            String forgedToken = untrustedKeyTokenProvider.generateToken(studentUser);

            mockMvc.perform(get("/api/student/favorites")
                            .header(HttpHeaders.AUTHORIZATION, "Bearer " + forgedToken))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.status", is(401)))
                    .andExpect(jsonPath("$.error", is("Unauthorized")))
                    .andExpect(jsonPath("$.path", is("/api/student/favorites")));
        }
    }

    // =========================================================================
    // Category 3: Malformed, Truncated & Empty Token Rejection
    // =========================================================================
    @Nested
    @DisplayName("3. Malformed and Empty Authorization Header Handling")
    class MalformedHeaderTests {

        @Test
        @DisplayName("Malformed Bearer token returns 401 Unauthorized without 500 server error")
        void malformedTokenReturns401() throws Exception {
            mockMvc.perform(get("/api/admin/metrics")
                            .header(HttpHeaders.AUTHORIZATION, "Bearer corrupted.jwt.token.value"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.status", is(401)))
                    .andExpect(jsonPath("$.error", is("Unauthorized")));
        }

        @Test
        @DisplayName("Truncated two-part JWT (missing signature) returns 401 Unauthorized")
        void truncatedTokenReturns401() throws Exception {
            String validToken = liveTokenProvider.generateToken(adminUser);
            // Keep only header.payload without signature
            String[] parts = validToken.split("\\.");
            String truncatedToken = parts[0] + "." + parts[1];

            mockMvc.perform(get("/api/admin/metrics")
                            .header(HttpHeaders.AUTHORIZATION, "Bearer " + truncatedToken))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.status", is(401)))
                    .andExpect(jsonPath("$.error", is("Unauthorized")));
        }

        @Test
        @DisplayName("Authorization header with 'Bearer ' and empty token returns 401")
        void emptyBearerTokenReturns401() throws Exception {
            mockMvc.perform(get("/api/student/favorites")
                            .header(HttpHeaders.AUTHORIZATION, "Bearer "))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.status", is(401)));
        }

        @Test
        @DisplayName("Authorization header with whitespace returns 401")
        void whitespaceBearerTokenReturns401() throws Exception {
            mockMvc.perform(get("/api/student/favorites")
                            .header(HttpHeaders.AUTHORIZATION, "Bearer    "))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.status", is(401)));
        }

        @Test
        @DisplayName("Missing Authorization header on protected endpoint returns 401")
        void missingAuthHeaderReturns401() throws Exception {
            mockMvc.perform(get("/api/student/favorites"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.status", is(401)));
        }
    }

    // =========================================================================
    // Category 4: Positive Control (Valid Token Authenticates Cleanly)
    // =========================================================================
    @Nested
    @DisplayName("4. Positive Control with Valid JWT Tokens")
    class PositiveControlTests {

        @Test
        @DisplayName("Valid Admin JWT accessing /api/admin/metrics returns 200 OK")
        void validAdminTokenReturns200() throws Exception {
            String validToken = liveTokenProvider.generateToken(adminUser);

            mockMvc.perform(get("/api/admin/metrics")
                            .header(HttpHeaders.AUTHORIZATION, "Bearer " + validToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data", notNullValue()));
        }

        @Test
        @DisplayName("Valid Student JWT accessing /api/student/favorites returns 200 OK")
        void validStudentTokenReturns200() throws Exception {
            String validToken = liveTokenProvider.generateToken(studentUser);

            mockMvc.perform(get("/api/student/favorites")
                            .header(HttpHeaders.AUTHORIZATION, "Bearer " + validToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data", is(empty())));
        }
    }
}
