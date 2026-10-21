package com.messmap.modules.favorite.controller;

import com.messmap.modules.favorite.entity.Favorite;
import com.messmap.modules.favorite.repository.FavoriteRepository;
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
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class StudentFavoriteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private MessRepository messRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User student1;
    private User student2;
    private User owner;
    private String student1Token;
    private String student2Token;
    private String ownerToken;

    private Mess approvedMess1;
    private Mess approvedMess2;
    private Mess pendingMess;

    @BeforeEach
    void setUp() {
        favoriteRepository.deleteAll();
        messRepository.deleteAll();
        userRepository.deleteAll();

        student1 = userRepository.save(User.builder()
                .name("Anushka Pawar")
                .email("anushka.student@messmap.com")
                .password(passwordEncoder.encode("secretPass123"))
                .role(Role.ROLE_STUDENT)
                .status(UserStatus.ACTIVE)
                .build());
        student1Token = "Bearer " + jwtTokenProvider.generateToken(student1);

        student2 = userRepository.save(User.builder()
                .name("Rahul Patil")
                .email("rahul.student@messmap.com")
                .password(passwordEncoder.encode("secretPass123"))
                .role(Role.ROLE_STUDENT)
                .status(UserStatus.ACTIVE)
                .build());
        student2Token = "Bearer " + jwtTokenProvider.generateToken(student2);

        owner = userRepository.save(User.builder()
                .name("Ramesh Shinde")
                .email("ramesh.owner@messmap.com")
                .password(passwordEncoder.encode("secretPass123"))
                .role(Role.ROLE_MESS_OWNER)
                .status(UserStatus.ACTIVE)
                .build());
        ownerToken = "Bearer " + jwtTokenProvider.generateToken(owner);

        approvedMess1 = messRepository.save(Mess.builder()
                .owner(owner)
                .name("Annapurna Pure Veg")
                .address("FC Road, Pune")
                .city("Pune")
                .area("Shivajinagar")
                .foodType(FoodType.PURE_VEG)
                .monthlyPrice(new BigDecimal("2600.00"))
                .dailyPrice(new BigDecimal("90.00"))
                .status(MessStatus.APPROVED)
                .operatingStatus(OperatingStatus.OPEN)
                .build());

        approvedMess2 = messRepository.save(Mess.builder()
                .owner(owner)
                .name("Maratha Special Dining")
                .address("Paud Road, Pune")
                .city("Pune")
                .area("Kothrud")
                .foodType(FoodType.VEG_AND_NON_VEG)
                .monthlyPrice(new BigDecimal("3500.00"))
                .dailyPrice(new BigDecimal("120.00"))
                .status(MessStatus.APPROVED)
                .operatingStatus(OperatingStatus.OPEN)
                .build());

        pendingMess = messRepository.save(Mess.builder()
                .owner(owner)
                .name("Corner Kitchen (Pending)")
                .address("Camp, Pune")
                .city("Pune")
                .foodType(FoodType.PURE_VEG)
                .status(MessStatus.PENDING)
                .build());
    }

    // =========================================================================
    // POST /api/student/favorites/{messId} Tests
    // =========================================================================

    @Test
    @DisplayName("POST /api/student/favorites/{messId} should bookmark mess and return HTTP 201 Created")
    void testAddFavoriteSuccess() throws Exception {
        mockMvc.perform(post("/api/student/favorites/{messId}", approvedMess1.getId())
                        .header(HttpHeaders.AUTHORIZATION, student1Token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Mess added to favorites successfully")))
                .andExpect(jsonPath("$.data.favoriteId", notNullValue()))
                .andExpect(jsonPath("$.data.id", is(approvedMess1.getId().intValue())))
                .andExpect(jsonPath("$.data.messId", is(approvedMess1.getId().intValue())))
                .andExpect(jsonPath("$.data.name", is("Annapurna Pure Veg")))
                .andExpect(jsonPath("$.data.messName", is("Annapurna Pure Veg")))
                .andExpect(jsonPath("$.data.city", is("Pune")))
                .andExpect(jsonPath("$.data.monthlyPrice", is(2600.0)))
                .andExpect(jsonPath("$.data.favoritedAt", notNullValue()));

        assertThat(favoriteRepository.existsByUserIdAndMessId(student1.getId(), approvedMess1.getId())).isTrue();
    }

    @Test
    @DisplayName("POST /api/v1/student/favorites/{messId} alias route should function identically")
    void testAddFavoriteAliasRoute() throws Exception {
        mockMvc.perform(post("/api/v1/student/favorites/{messId}", approvedMess1.getId())
                        .header(HttpHeaders.AUTHORIZATION, student1Token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.id", is(approvedMess1.getId().intValue())));
    }

    @Test
    @DisplayName("POST /api/student/favorites/{messId} should handle duplicates gracefully and return HTTP 200 OK")
    void testAddFavoriteDuplicateIdempotent() throws Exception {
        // Pre-save favorite
        favoriteRepository.save(Favorite.builder().user(student1).mess(approvedMess1).build());

        mockMvc.perform(post("/api/student/favorites/{messId}", approvedMess1.getId())
                        .header(HttpHeaders.AUTHORIZATION, student1Token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Mess is already in favorites")))
                .andExpect(jsonPath("$.data.id", is(approvedMess1.getId().intValue())));

        // Verify no duplicate row created
        List<Favorite> favorites = favoriteRepository.findByUserId(student1.getId());
        assertThat(favorites).hasSize(1);
    }

    @Test
    @DisplayName("POST /api/student/favorites/{messId} with nonexistent mess ID should return HTTP 404 Not Found")
    void testAddFavoriteNonexistentMessReturns404() throws Exception {
        mockMvc.perform(post("/api/student/favorites/{messId}", 999999L)
                        .header(HttpHeaders.AUTHORIZATION, student1Token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.message", containsString("Mess not found with id: 999999")));
    }

    @Test
    @DisplayName("POST /api/student/favorites/{messId} with unapproved mess should return HTTP 404 Not Found")
    void testAddFavoriteUnapprovedMessReturns404() throws Exception {
        mockMvc.perform(post("/api/student/favorites/{messId}", pendingMess.getId())
                        .header(HttpHeaders.AUTHORIZATION, student1Token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.status", is(404)));
    }

    @Test
    @DisplayName("POST /api/student/favorites/{messId} unauthenticated should return HTTP 401 Unauthorized")
    void testAddFavoriteUnauthenticatedReturns401() throws Exception {
        mockMvc.perform(post("/api/student/favorites/{messId}", approvedMess1.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/student/favorites/{messId} with non-student role should return HTTP 403 Forbidden")
    void testAddFavoriteForbiddenForOwnerReturns403() throws Exception {
        mockMvc.perform(post("/api/student/favorites/{messId}", approvedMess1.getId())
                        .header(HttpHeaders.AUTHORIZATION, ownerToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    // =========================================================================
    // DELETE /api/student/favorites/{messId} Tests
    // =========================================================================

    @Test
    @DisplayName("DELETE /api/student/favorites/{messId} should remove mess from student favorites")
    void testRemoveFavoriteSuccess() throws Exception {
        favoriteRepository.save(Favorite.builder().user(student1).mess(approvedMess1).build());
        assertThat(favoriteRepository.existsByUserIdAndMessId(student1.getId(), approvedMess1.getId())).isTrue();

        mockMvc.perform(delete("/api/student/favorites/{messId}", approvedMess1.getId())
                        .header(HttpHeaders.AUTHORIZATION, student1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Mess removed from favorites successfully")));

        assertThat(favoriteRepository.existsByUserIdAndMessId(student1.getId(), approvedMess1.getId())).isFalse();
    }

    @Test
    @DisplayName("DELETE /api/v1/student/favorites/{messId} alias route should function identically")
    void testRemoveFavoriteAliasRoute() throws Exception {
        favoriteRepository.save(Favorite.builder().user(student1).mess(approvedMess1).build());

        mockMvc.perform(delete("/api/v1/student/favorites/{messId}", approvedMess1.getId())
                        .header(HttpHeaders.AUTHORIZATION, student1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Mess removed from favorites successfully")));
    }

    @Test
    @DisplayName("DELETE /api/student/favorites/{messId} should be idempotent when mess is not favorited")
    void testRemoveFavoriteIdempotentWhenNotFavorited() throws Exception {
        mockMvc.perform(delete("/api/student/favorites/{messId}", approvedMess1.getId())
                        .header(HttpHeaders.AUTHORIZATION, student1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Mess removed from favorites successfully")));
    }

    // =========================================================================
    // GET /api/student/favorites Tests
    // =========================================================================

    @Test
    @DisplayName("GET /api/student/favorites should return only messes bookmarked by authenticated student")
    void testGetFavoritesReturnsOnlyCurrentUserFavorites() throws Exception {
        // student1 favorites both messes
        favoriteRepository.save(Favorite.builder().user(student1).mess(approvedMess1).build());
        favoriteRepository.save(Favorite.builder().user(student1).mess(approvedMess2).build());

        // student2 favorites only mess2
        favoriteRepository.save(Favorite.builder().user(student2).mess(approvedMess2).build());

        // student1 query
        mockMvc.perform(get("/api/student/favorites")
                        .header(HttpHeaders.AUTHORIZATION, student1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[*].name", containsInAnyOrder(
                        "Annapurna Pure Veg",
                        "Maratha Special Dining"
                )));

        // student2 query should only see 1 favorite
        mockMvc.perform(get("/api/student/favorites")
                        .header(HttpHeaders.AUTHORIZATION, student2Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].name", is("Maratha Special Dining")));
    }

    @Test
    @DisplayName("GET /api/v1/student/favorites alias route should function identically")
    void testGetFavoritesAliasRoute() throws Exception {
        favoriteRepository.save(Favorite.builder().user(student1).mess(approvedMess1).build());

        mockMvc.perform(get("/api/v1/student/favorites")
                        .header(HttpHeaders.AUTHORIZATION, student1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id", is(approvedMess1.getId().intValue())));
    }

    @Test
    @DisplayName("GET /api/student/favorites should return empty array when student has no favorites")
    void testGetFavoritesEmptyList() throws Exception {
        mockMvc.perform(get("/api/student/favorites")
                        .header(HttpHeaders.AUTHORIZATION, student1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(0)));
    }
}
