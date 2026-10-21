package com.messmap.repository;

import com.messmap.modules.mess.entity.FoodType;
import com.messmap.modules.mess.entity.Mess;
import com.messmap.modules.mess.repository.MessRepository;
import com.messmap.modules.review.entity.Review;
import com.messmap.modules.review.entity.ReviewStatus;
import com.messmap.modules.review.repository.ReviewRepository;
import com.messmap.modules.user.entity.Role;
import com.messmap.modules.user.entity.User;
import com.messmap.modules.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class ReviewRepositoryTest {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private MessRepository messRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("Should persist review and calculate average rating accurately")
    void shouldPersistReviewAndCalculateAverageRating() {
        User owner = userRepository.save(User.builder()
                .name("Review Owner")
                .email("review.owner@messmap.com")
                .password("hash")
                .role(Role.ROLE_MESS_OWNER)
                .build());

        User student1 = userRepository.save(User.builder()
                .name("Student 1")
                .email("student1@coep.ac.in")
                .password("hash")
                .role(Role.ROLE_STUDENT)
                .build());

        User student2 = userRepository.save(User.builder()
                .name("Student 2")
                .email("student2@coep.ac.in")
                .password("hash")
                .role(Role.ROLE_STUDENT)
                .build());

        Mess mess = messRepository.save(Mess.builder()
                .owner(owner)
                .name("Saffron Dining")
                .address("Near Hostel")
                .city("Pune")
                .foodType(FoodType.VEG_AND_NON_VEG)
                .build());

        Review review1 = Review.builder()
                .mess(mess)
                .user(student1)
                .rating(5)
                .foodQualityScore(5)
                .hygieneScore(4)
                .comment("Excellent hygiene and very delicious food!")
                .status(ReviewStatus.PUBLISHED)
                .build();

        Review review2 = Review.builder()
                .mess(mess)
                .user(student2)
                .rating(4)
                .foodQualityScore(4)
                .hygieneScore(4)
                .comment("Great value for money.")
                .status(ReviewStatus.PUBLISHED)
                .build();

        reviewRepository.save(review1);
        reviewRepository.save(review2);

        List<Review> reviews = reviewRepository.findByMessId(mess.getId());
        assertThat(reviews).hasSize(2);

        Optional<Double> avgRating = reviewRepository.findAverageRatingByMessId(mess.getId());
        assertThat(avgRating).isPresent();
        assertThat(avgRating.get()).isEqualTo(4.5);
    }
}
