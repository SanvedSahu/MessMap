package com.messmap.modules.review.service;

import com.messmap.common.exception.BadRequestException;
import com.messmap.common.exception.ResourceNotFoundException;
import com.messmap.modules.mess.entity.Mess;
import com.messmap.modules.mess.entity.MessStatus;
import com.messmap.modules.mess.repository.MessRepository;
import com.messmap.modules.review.dto.CreateReviewRequest;
import com.messmap.modules.review.dto.MessReviewsResponse;
import com.messmap.modules.review.dto.ReviewResponse;
import com.messmap.modules.review.dto.UpdateReviewRequest;
import com.messmap.modules.review.entity.Review;
import com.messmap.modules.review.entity.ReviewStatus;
import com.messmap.modules.review.repository.ReviewRepository;
import com.messmap.modules.user.entity.Role;
import com.messmap.modules.user.entity.User;
import com.messmap.modules.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private MessRepository messRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ReviewService reviewService;

    private User student1;
    private User student2;
    private Mess approvedMess;
    private Mess pendingMess;
    private Review review1;

    @BeforeEach
    void setUp() {
        student1 = User.builder()
                .id(1L)
                .name("Student One")
                .email("student1@example.com")
                .role(Role.ROLE_STUDENT)
                .build();

        student2 = User.builder()
                .id(2L)
                .name("Student Two")
                .email("student2@example.com")
                .role(Role.ROLE_STUDENT)
                .build();

        approvedMess = Mess.builder()
                .id(10L)
                .name("Annapurna Mess")
                .status(MessStatus.APPROVED)
                .build();

        pendingMess = Mess.builder()
                .id(20L)
                .name("Pending Mess")
                .status(MessStatus.PENDING)
                .build();

        review1 = Review.builder()
                .id(100L)
                .user(student1)
                .mess(approvedMess)
                .rating(4)
                .comment("Good food")
                .status(ReviewStatus.PUBLISHED)
                .build();
    }

    @Test
    @DisplayName("getMessReviews returns published reviews and aggregate average rating")
    void getMessReviews_Success_WithReviews() {
        when(messRepository.findById(10L)).thenReturn(Optional.of(approvedMess));
        when(reviewRepository.findByMessIdAndStatusOrderByCreatedAtDesc(10L, ReviewStatus.PUBLISHED))
                .thenReturn(List.of(review1));
        when(reviewRepository.findAverageRatingByMessId(10L)).thenReturn(Optional.of(4.25));
        when(reviewRepository.countByMessIdAndStatus(10L, ReviewStatus.PUBLISHED)).thenReturn(1L);

        MessReviewsResponse response = reviewService.getMessReviews(10L);

        assertThat(response).isNotNull();
        assertThat(response.getMessId()).isEqualTo(10L);
        assertThat(response.getMessName()).isEqualTo("Annapurna Mess");
        assertThat(response.getAverageRating()).isEqualTo(4.3);
        assertThat(response.getTotalReviews()).isEqualTo(1L);
        assertThat(response.getReviews()).hasSize(1);
        assertThat(response.getReviews().get(0).getRating()).isEqualTo(4);
    }

    @Test
    @DisplayName("getMessReviews handles messes with no reviews gracefully")
    void getMessReviews_Success_NoReviews() {
        when(messRepository.findById(10L)).thenReturn(Optional.of(approvedMess));
        when(reviewRepository.findByMessIdAndStatusOrderByCreatedAtDesc(10L, ReviewStatus.PUBLISHED))
                .thenReturn(Collections.emptyList());
        when(reviewRepository.findAverageRatingByMessId(10L)).thenReturn(Optional.empty());
        when(reviewRepository.countByMessIdAndStatus(10L, ReviewStatus.PUBLISHED)).thenReturn(0L);

        MessReviewsResponse response = reviewService.getMessReviews(10L);

        assertThat(response).isNotNull();
        assertThat(response.getMessId()).isEqualTo(10L);
        assertThat(response.getAverageRating()).isEqualTo(0.0);
        assertThat(response.getTotalReviews()).isEqualTo(0L);
        assertThat(response.getReviews()).isEmpty();
    }

    @Test
    @DisplayName("getMessReviews throws ResourceNotFoundException when mess does not exist")
    void getMessReviews_MessNotFound() {
        when(messRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reviewService.getMessReviews(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Mess not found with id: 999");
    }

    @Test
    @DisplayName("submitReview successfully creates review for approved mess with rating 1 and 5")
    void submitReview_Success() {
        when(messRepository.findById(10L)).thenReturn(Optional.of(approvedMess));
        when(userRepository.findById(1L)).thenReturn(Optional.of(student1));
        when(reviewRepository.save(any(Review.class))).thenAnswer(invocation -> {
            Review r = invocation.getArgument(0);
            r.setId(101L);
            return r;
        });

        CreateReviewRequest request = CreateReviewRequest.builder()
                .rating(5)
                .comment("Excellent thali!")
                .foodQualityScore(5)
                .hygieneScore(5)
                .build();

        ReviewResponse response = reviewService.submitReview(10L, 1L, request);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(101L);
        assertThat(response.getRating()).isEqualTo(5);
        assertThat(response.getComment()).isEqualTo("Excellent thali!");
        assertThat(response.getUserId()).isEqualTo(1L);
        assertThat(response.getMessId()).isEqualTo(10L);
    }

    @Test
    @DisplayName("submitReview rejects unapproved mess with HTTP 400 BadRequestException")
    void submitReview_UnapprovedMess_ThrowsBadRequestException() {
        when(messRepository.findById(20L)).thenReturn(Optional.of(pendingMess));

        CreateReviewRequest request = CreateReviewRequest.builder()
                .rating(4)
                .comment("Pending mess review")
                .build();

        assertThatThrownBy(() -> reviewService.submitReview(20L, 1L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Cannot submit review: Mess is not approved");
        verify(reviewRepository, never()).save(any());
    }

    @Test
    @DisplayName("submitReview rejects invalid ratings 0 and 6 with BadRequestException")
    void submitReview_InvalidRating_ThrowsBadRequestException() {
        CreateReviewRequest request0 = CreateReviewRequest.builder().rating(0).build();
        CreateReviewRequest request6 = CreateReviewRequest.builder().rating(6).build();

        assertThatThrownBy(() -> reviewService.submitReview(10L, 1L, request0))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Rating must be between 1 and 5");

        assertThatThrownBy(() -> reviewService.submitReview(10L, 1L, request6))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Rating must be between 1 and 5");
    }

    @Test
    @DisplayName("updateReview successfully updates review when student is author")
    void updateReview_Success() {
        when(messRepository.findById(10L)).thenReturn(Optional.of(approvedMess));
        when(reviewRepository.findById(100L)).thenReturn(Optional.of(review1));
        when(reviewRepository.save(any(Review.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateReviewRequest updateRequest = UpdateReviewRequest.builder()
                .rating(5)
                .comment("Updated: even better now!")
                .build();

        ReviewResponse response = reviewService.updateReview(10L, 100L, 1L, false, updateRequest);

        assertThat(response).isNotNull();
        assertThat(response.getRating()).isEqualTo(5);
        assertThat(response.getComment()).isEqualTo("Updated: even better now!");
    }

    @Test
    @DisplayName("updateReview rejects attempts to update another student's review with AccessDeniedException")
    void updateReview_AnotherStudent_ThrowsAccessDeniedException() {
        when(messRepository.findById(10L)).thenReturn(Optional.of(approvedMess));
        when(reviewRepository.findById(100L)).thenReturn(Optional.of(review1)); // authored by student1 (id=1)

        UpdateReviewRequest updateRequest = UpdateReviewRequest.builder()
                .rating(3)
                .comment("Hacked")
                .build();

        // student2 (id=2) attempts update
        assertThatThrownBy(() -> reviewService.updateReview(10L, 100L, 2L, false, updateRequest))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("You are not authorized to update another student's review");
    }

    @Test
    @DisplayName("updateReview rejects mismatched messId with BadRequestException")
    void updateReview_MismatchedMessId_ThrowsBadRequestException() {
        when(messRepository.findById(999L)).thenReturn(Optional.of(approvedMess));
        when(reviewRepository.findById(100L)).thenReturn(Optional.of(review1)); // mess id is 10

        UpdateReviewRequest updateRequest = UpdateReviewRequest.builder()
                .rating(3)
                .build();

        assertThatThrownBy(() -> reviewService.updateReview(999L, 100L, 1L, false, updateRequest))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("does not belong to mess");
    }

    @Test
    @DisplayName("deleteReview successfully deletes review when student is author")
    void deleteReview_Success() {
        when(messRepository.findById(10L)).thenReturn(Optional.of(approvedMess));
        when(reviewRepository.findById(100L)).thenReturn(Optional.of(review1));

        reviewService.deleteReview(10L, 100L, 1L, false);

        verify(reviewRepository, times(1)).delete(review1);
    }

    @Test
    @DisplayName("deleteReview rejects attempts to delete another student's review with AccessDeniedException")
    void deleteReview_AnotherStudent_ThrowsAccessDeniedException() {
        when(messRepository.findById(10L)).thenReturn(Optional.of(approvedMess));
        when(reviewRepository.findById(100L)).thenReturn(Optional.of(review1)); // authored by student1

        // student2 attempts delete
        assertThatThrownBy(() -> reviewService.deleteReview(10L, 100L, 2L, false))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("You are not authorized to delete another student's review");
        verify(reviewRepository, never()).delete(any());
    }
}
