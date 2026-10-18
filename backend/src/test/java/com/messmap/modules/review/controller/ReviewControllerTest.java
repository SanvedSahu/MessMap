package com.messmap.modules.review.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.messmap.modules.mess.entity.FoodType;
import com.messmap.modules.mess.entity.Mess;
import com.messmap.modules.mess.entity.MessStatus;
import com.messmap.modules.mess.entity.OperatingStatus;
import com.messmap.modules.mess.repository.MessRepository;
import com.messmap.modules.review.dto.CreateReviewRequest;
import com.messmap.modules.review.dto.UpdateReviewRequest;
import com.messmap.modules.review.entity.Review;
import com.messmap.modules.review.entity.ReviewStatus;
import com.messmap.modules.review.repository.ReviewRepository;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ReviewControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ReviewRepository reviewRepository;

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

    private Mess approvedMess;
    private Mess pendingMess;

    @BeforeEach
    void setUp() {
        reviewRepository.deleteAll();
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

        approvedMess = messRepository.save(Mess.builder()
                .owner(owner)
                .name("Sai Sagar Deluxe Mess")
                .address("Opposite Campus Gate 1")
                .area("Shivajinagar")
                .city("Pune")
                .state("Maharashtra")
                .pincode("411005")
                .foodType(FoodType.VEG_AND_NON_VEG)
                .monthlyPrice(BigDecimal.valueOf(3200))
                .dailyPrice(BigDecimal.valueOf(110))
                .status(MessStatus.APPROVED)
                .operatingStatus(OperatingStatus.OPEN)
                .build());

        pendingMess = messRepository.save(Mess.builder()
                .owner(owner)
                .name("Unapproved New Mess")
                .address("Near Hostel 3")
                .city("Pune")
                .foodType(FoodType.PURE_VEG)
                .status(MessStatus.PENDING)
                .operatingStatus(OperatingStatus.OPEN)
                .build());
    }

    @Test
    @DisplayName("GET /api/messes/{messId}/reviews handles messes with no reviews gracefully")
    void getMessReviews_EmptyReviews_ReturnsOk() throws Exception {
        mockMvc.perform(get("/api/messes/{messId}/reviews", approvedMess.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.messId", is(approvedMess.getId().intValue())))
                .andExpect(jsonPath("$.data.messName", is("Sai Sagar Deluxe Mess")))
                .andExpect(jsonPath("$.data.averageRating", is(0.0)))
                .andExpect(jsonPath("$.data.totalReviews", is(0)))
                .andExpect(jsonPath("$.data.reviews", hasSize(0)));
    }

    @Test
    @DisplayName("GET /api/v1/messes/{messId}/reviews route alias functions identically")
    void getMessReviews_V1Alias_ReturnsOk() throws Exception {
        mockMvc.perform(get("/api/v1/messes/{messId}/reviews", approvedMess.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.messId", is(approvedMess.getId().intValue())));
    }

    @Test
    @DisplayName("POST /api/messes/{messId}/reviews allows student to submit valid review with rating 1 and 5")
    void submitReview_ValidRatings1And5_Success() throws Exception {
        // Rating 5 with comment
        CreateReviewRequest request5 = CreateReviewRequest.builder()
                .rating(5)
                .comment("Outstanding service and hearty meals!")
                .foodQualityScore(5)
                .hygieneScore(5)
                .build();

        mockMvc.perform(post("/api/messes/{messId}/reviews", approvedMess.getId())
                        .header(HttpHeaders.AUTHORIZATION, student1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request5)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.rating", is(5)))
                .andExpect(jsonPath("$.data.comment", is("Outstanding service and hearty meals!")))
                .andExpect(jsonPath("$.data.userId", is(student1.getId().intValue())))
                .andExpect(jsonPath("$.data.messId", is(approvedMess.getId().intValue())));

        // Rating 1 without comment (comment is optional)
        CreateReviewRequest request1 = CreateReviewRequest.builder()
                .rating(1)
                .build();

        mockMvc.perform(post("/api/messes/{messId}/reviews", approvedMess.getId())
                        .header(HttpHeaders.AUTHORIZATION, student2Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.rating", is(1)))
                .andExpect(jsonPath("$.data.comment").doesNotExist());
    }

    @Test
    @DisplayName("POST /api/messes/{messId}/reviews rejects invalid ratings 0 and 6 with HTTP 400 Bad Request")
    void submitReview_InvalidRatings0And6_ReturnsBadRequest() throws Exception {
        CreateReviewRequest request0 = CreateReviewRequest.builder()
                .rating(0)
                .comment("Zero rating")
                .build();

        mockMvc.perform(post("/api/messes/{messId}/reviews", approvedMess.getId())
                        .header(HttpHeaders.AUTHORIZATION, student1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request0)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)));

        CreateReviewRequest request6 = CreateReviewRequest.builder()
                .rating(6)
                .comment("Six rating")
                .build();

        mockMvc.perform(post("/api/messes/{messId}/reviews", approvedMess.getId())
                        .header(HttpHeaders.AUTHORIZATION, student1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request6)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)));
    }

    @Test
    @DisplayName("POST /api/messes/{messId}/reviews rejects review for unapproved mess with HTTP 400 Bad Request")
    void submitReview_UnapprovedMess_ReturnsBadRequest() throws Exception {
        CreateReviewRequest request = CreateReviewRequest.builder()
                .rating(4)
                .comment("Trying to review pending mess")
                .build();

        mockMvc.perform(post("/api/messes/{messId}/reviews", pendingMess.getId())
                        .header(HttpHeaders.AUTHORIZATION, student1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.message", containsString("Cannot submit review: Mess is not approved")));
    }

    @Test
    @DisplayName("POST /api/messes/{messId}/reviews rejects unauthenticated requests with HTTP 401 Unauthorized")
    void submitReview_Unauthenticated_ReturnsUnauthorized() throws Exception {
        CreateReviewRequest request = CreateReviewRequest.builder()
                .rating(4)
                .comment("No token provided")
                .build();

        mockMvc.perform(post("/api/messes/{messId}/reviews", approvedMess.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("PUT /api/messes/{messId}/reviews/{reviewId} allows student to update their own review")
    void updateReview_OwnReview_Success() throws Exception {
        Review review = reviewRepository.save(Review.builder()
                .user(student1)
                .mess(approvedMess)
                .rating(3)
                .comment("Average food")
                .status(ReviewStatus.PUBLISHED)
                .build());

        UpdateReviewRequest updateRequest = UpdateReviewRequest.builder()
                .rating(5)
                .comment("Greatly improved after management changed chef!")
                .foodQualityScore(5)
                .hygieneScore(4)
                .build();

        mockMvc.perform(put("/api/messes/{messId}/reviews/{reviewId}", approvedMess.getId(), review.getId())
                        .header(HttpHeaders.AUTHORIZATION, student1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.rating", is(5)))
                .andExpect(jsonPath("$.data.comment", is("Greatly improved after management changed chef!")));

        Review updated = reviewRepository.findById(review.getId()).orElseThrow();
        assertThat(updated.getRating()).isEqualTo(5);
    }

    @Test
    @DisplayName("PUT /api/messes/{messId}/reviews/{reviewId} rejects invalid ratings 0 and 6 with HTTP 400")
    void updateReview_InvalidRatings_ReturnsBadRequest() throws Exception {
        Review review = reviewRepository.save(Review.builder()
                .user(student1)
                .mess(approvedMess)
                .rating(3)
                .comment("Average")
                .status(ReviewStatus.PUBLISHED)
                .build());

        UpdateReviewRequest updateRequest = UpdateReviewRequest.builder()
                .rating(0)
                .build();

        mockMvc.perform(put("/api/messes/{messId}/reviews/{reviewId}", approvedMess.getId(), review.getId())
                        .header(HttpHeaders.AUTHORIZATION, student1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PUT /api/messes/{messId}/reviews/{reviewId} rejects attempt to update another student's review with HTTP 403 Forbidden")
    void updateReview_AnotherStudent_ReturnsForbidden() throws Exception {
        // Authored by student1
        Review review = reviewRepository.save(Review.builder()
                .user(student1)
                .mess(approvedMess)
                .rating(3)
                .comment("Authored by Student 1")
                .status(ReviewStatus.PUBLISHED)
                .build());

        UpdateReviewRequest updateRequest = UpdateReviewRequest.builder()
                .rating(1)
                .comment("Malicious edit attempt by Student 2")
                .build();

        // Student2 attempts to update Student1's review
        mockMvc.perform(put("/api/messes/{messId}/reviews/{reviewId}", approvedMess.getId(), review.getId())
                        .header(HttpHeaders.AUTHORIZATION, student2Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", is(403)));
    }

    @Test
    @DisplayName("DELETE /api/messes/{messId}/reviews/{reviewId} allows student to delete their own review")
    void deleteReview_OwnReview_Success() throws Exception {
        Review review = reviewRepository.save(Review.builder()
                .user(student1)
                .mess(approvedMess)
                .rating(4)
                .comment("Temporary review")
                .status(ReviewStatus.PUBLISHED)
                .build());

        mockMvc.perform(delete("/api/messes/{messId}/reviews/{reviewId}", approvedMess.getId(), review.getId())
                        .header(HttpHeaders.AUTHORIZATION, student1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", containsString("deleted successfully")));

        assertThat(reviewRepository.findById(review.getId())).isEmpty();
    }

    @Test
    @DisplayName("DELETE /api/messes/{messId}/reviews/{reviewId} rejects attempt to delete another student's review with HTTP 403 Forbidden")
    void deleteReview_AnotherStudent_ReturnsForbidden() throws Exception {
        Review review = reviewRepository.save(Review.builder()
                .user(student1)
                .mess(approvedMess)
                .rating(4)
                .comment("Student 1 Review")
                .status(ReviewStatus.PUBLISHED)
                .build());

        // Student2 attempts to delete Student1's review
        mockMvc.perform(delete("/api/messes/{messId}/reviews/{reviewId}", approvedMess.getId(), review.getId())
                        .header(HttpHeaders.AUTHORIZATION, student2Token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", is(403)));

        assertThat(reviewRepository.findById(review.getId())).isPresent();
    }

    @Test
    @DisplayName("Verify dynamic aggregate rating recalculation across review creation, update, and deletion")
    void aggregateRating_DynamicRecalculation_Verified() throws Exception {
        // Step 1: Mess starts with no reviews -> aggregate 0.0, total 0
        mockMvc.perform(get("/api/messes/{messId}/reviews", approvedMess.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.averageRating", is(0.0)))
                .andExpect(jsonPath("$.data.totalReviews", is(0)));

        // Step 2: Student 1 posts a rating of 4
        CreateReviewRequest review1 = CreateReviewRequest.builder().rating(4).comment("Good").build();
        String res1 = mockMvc.perform(post("/api/messes/{messId}/reviews", approvedMess.getId())
                        .header(HttpHeaders.AUTHORIZATION, student1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(review1)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Long review1Id = objectMapper.readTree(res1).path("data").path("id").asLong();

        // Aggregate should now be 4.0, total 1
        mockMvc.perform(get("/api/messes/{messId}/reviews", approvedMess.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.averageRating", is(4.0)))
                .andExpect(jsonPath("$.data.totalReviews", is(1)));

        // Step 3: Student 2 posts a rating of 2
        CreateReviewRequest review2 = CreateReviewRequest.builder().rating(2).comment("Disappointing").build();
        mockMvc.perform(post("/api/messes/{messId}/reviews", approvedMess.getId())
                        .header(HttpHeaders.AUTHORIZATION, student2Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(review2)))
                .andExpect(status().isCreated());

        // Aggregate of 4 and 2 is (4+2)/2 = 3.0, total 2
        mockMvc.perform(get("/api/messes/{messId}/reviews", approvedMess.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.averageRating", is(3.0)))
                .andExpect(jsonPath("$.data.totalReviews", is(2)));

        // Step 4: Student 1 updates rating from 4 to 5
        UpdateReviewRequest updateRequest = UpdateReviewRequest.builder().rating(5).comment("Now excellent").build();
        mockMvc.perform(put("/api/messes/{messId}/reviews/{reviewId}", approvedMess.getId(), review1Id)
                        .header(HttpHeaders.AUTHORIZATION, student1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk());

        // Aggregate of 5 and 2 is (5+2)/2 = 3.5, total 2
        mockMvc.perform(get("/api/messes/{messId}/reviews", approvedMess.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.averageRating", is(3.5)))
                .andExpect(jsonPath("$.data.totalReviews", is(2)));

        // Step 5: Student 1 deletes review
        mockMvc.perform(delete("/api/messes/{messId}/reviews/{reviewId}", approvedMess.getId(), review1Id)
                        .header(HttpHeaders.AUTHORIZATION, student1Token))
                .andExpect(status().isOk());

        // Aggregate should now be only Student 2's rating: 2.0, total 1
        mockMvc.perform(get("/api/messes/{messId}/reviews", approvedMess.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.averageRating", is(2.0)))
                .andExpect(jsonPath("$.data.totalReviews", is(1)));
    }
}
