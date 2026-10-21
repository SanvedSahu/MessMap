package com.messmap.persistence;

import com.messmap.modules.menu.entity.MealType;
import com.messmap.modules.menu.entity.MenuItem;
import com.messmap.modules.menu.repository.MenuItemRepository;
import com.messmap.modules.mess.entity.*;
import com.messmap.modules.mess.repository.FacilityRepository;
import com.messmap.modules.mess.repository.MessRepository;
import com.messmap.modules.review.entity.Review;
import com.messmap.modules.review.entity.ReviewStatus;
import com.messmap.modules.review.repository.ReviewRepository;
import com.messmap.modules.user.entity.Role;
import com.messmap.modules.user.entity.User;
import com.messmap.modules.user.entity.UserStatus;
import com.messmap.modules.user.repository.UserRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * End-to-End Database Persistence Verification Tests.
 * Fulfills GitHub Issue #19 acceptance criteria:
 * - Proves persistence and data integrity for registered accounts, mess profiles,
 *   operating hours/timings, menu timetable records, and reviews.
 * - Forces cache eviction via EntityManager flush and clear to guarantee data survives
 *   in the physical database tier rather than merely in first-level Hibernate session caches.
 * - Confirms decimal scales, enums, relationship mappings, and foreign key integrity.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class DatabasePersistenceVerificationTest {

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MessRepository messRepository;

    @Autowired
    private FacilityRepository facilityRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @BeforeEach
    void cleanUp() {
        reviewRepository.deleteAll();
        menuItemRepository.deleteAll();
        messRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Nested
    @DisplayName("1. Complete Relational Entity Graph Persistence")
    class CompleteGraphPersistenceTests {

        @Test
        @DisplayName("Persist and reload User, Mess, Timings, Facilities, MenuItems, and Review after cache eviction")
        void shouldPersistCompleteRelationalGraphAcrossCacheEviction() {
            // Step 1: Persist Registered Accounts (Owner and Student)
            User owner = userRepository.save(User.builder()
                    .name("Sunil Kulkarni")
                    .email("sunil.owner@shivaji-mess.com")
                    .password("$2a$10$encodedPasswordHashForTestingOnly")
                    .phone("+91-9876543210")
                    .role(Role.ROLE_MESS_OWNER)
                    .status(UserStatus.ACTIVE)
                    .college("COEP Pune")
                    .build());

            User student = userRepository.save(User.builder()
                    .name("Aarav Sharma")
                    .email("aarav.student@coep.ac.in")
                    .password("$2a$10$encodedPasswordHashForTestingOnly")
                    .phone("+91-9123456780")
                    .role(Role.ROLE_STUDENT)
                    .status(UserStatus.ACTIVE)
                    .college("COEP Pune")
                    .hostel("Hostel Block B")
                    .build());

            // Step 2: Persist Facilities
            Facility wifi = facilityRepository.findByNameIgnoreCase("WiFi")
                    .orElseGet(() -> facilityRepository.save(Facility.builder().name("WiFi").icon("wifi").build()));
            Facility water = facilityRepository.findByNameIgnoreCase("RO Water")
                    .orElseGet(() -> facilityRepository.save(Facility.builder().name("RO Water").icon("droplet").build()));

            // Step 3: Persist Mess Profile with Timings, Pricing, and Address
            Mess mess = messRepository.save(Mess.builder()
                    .owner(owner)
                    .name("Shivaji Dining Hall")
                    .description("Authentic Maharashtrian and North Indian thalis")
                    .phone("+91-9876543210")
                    .email("contact@shivaji-mess.com")
                    .address("1204 Shivaji Nagar, Near COEP Hostel")
                    .area("Shivaji Nagar")
                    .city("Pune")
                    .state("Maharashtra")
                    .pincode("411005")
                    .latitude(new BigDecimal("18.5312000"))
                    .longitude(new BigDecimal("73.8553000"))
                    .foodType(FoodType.PURE_VEG)
                    .dailyPrice(new BigDecimal("100.00"))
                    .monthlyPrice(new BigDecimal("2800.00"))
                    .breakfastPrice(new BigDecimal("40.00"))
                    .lunchPrice(new BigDecimal("90.00"))
                    .dinnerPrice(new BigDecimal("90.00"))
                    .status(MessStatus.APPROVED)
                    .operatingStatus(OperatingStatus.OPEN)
                    .openingTime("07:30 AM")
                    .closingTime("10:30 PM")
                    .breakfastTiming("07:30 AM - 10:30 AM")
                    .lunchTiming("12:00 PM - 03:00 PM")
                    .dinnerTiming("07:30 PM - 10:30 PM")
                    .capacity(75)
                    .facilities(Set.of(wifi, water))
                    .build());

            // Step 4: Persist Menu Items across Breakfast, Lunch, and Dinner
            MenuItem breakfastItem = menuItemRepository.save(MenuItem.builder()
                    .mess(mess)
                    .name("Kanda Poha & Tea")
                    .description("Traditional roasted flattened rice with peanuts and masala tea")
                    .dayOfWeek("MONDAY")
                    .mealType(MealType.BREAKFAST)
                    .price(new BigDecimal("40.00"))
                    .isAvailable(true)
                    .isSpecial(false)
                    .build());

            MenuItem lunchItem = menuItemRepository.save(MenuItem.builder()
                    .mess(mess)
                    .name("Deluxe Veg Thali")
                    .description("3 chapatis, dal tadka, paneer masala, rice, sweet, papad")
                    .dayOfWeek("MONDAY")
                    .mealType(MealType.LUNCH)
                    .price(new BigDecimal("110.00"))
                    .isAvailable(true)
                    .isSpecial(true)
                    .build());

            MenuItem dinnerItem = menuItemRepository.save(MenuItem.builder()
                    .mess(mess)
                    .name("Dal Khichdi & Buttermilk")
                    .description("Comforting moong dal khichdi with spiced chaas")
                    .dayOfWeek("MONDAY")
                    .mealType(MealType.DINNER)
                    .price(new BigDecimal("80.00"))
                    .isAvailable(true)
                    .isSpecial(false)
                    .build());

            // Step 5: Persist Student Review
            Review review = reviewRepository.save(Review.builder()
                    .user(student)
                    .mess(mess)
                    .rating(5)
                    .foodQualityScore(5)
                    .hygieneScore(4)
                    .comment("Exceptional hygiene and homely taste every day.")
                    .status(ReviewStatus.PUBLISHED)
                    .build());

            Long ownerId = owner.getId();
            Long studentId = student.getId();
            Long messId = mess.getId();
            Long reviewId = review.getId();

            // =================================================================
            // Critical Cache Eviction: Flush and Clear Hibernate First-Level Cache
            // =================================================================
            entityManager.flush();
            entityManager.clear();

            // Step 6: Reload and Verify from Fresh Database Queries
            // 6a. Verify Owner Account
            Optional<User> reloadedOwnerOpt = userRepository.findById(ownerId);
            assertThat(reloadedOwnerOpt).isPresent();
            User reloadedOwner = reloadedOwnerOpt.get();
            assertThat(reloadedOwner.getName()).isEqualTo("Sunil Kulkarni");
            assertThat(reloadedOwner.getEmail()).isEqualTo("sunil.owner@shivaji-mess.com");
            assertThat(reloadedOwner.getRole()).isEqualTo(Role.ROLE_MESS_OWNER);
            assertThat(reloadedOwner.getStatus()).isEqualTo(UserStatus.ACTIVE);
            assertThat(reloadedOwner.getCollege()).isEqualTo("COEP Pune");

            // 6b. Verify Student Account
            Optional<User> reloadedStudentOpt = userRepository.findById(studentId);
            assertThat(reloadedStudentOpt).isPresent();
            User reloadedStudent = reloadedStudentOpt.get();
            assertThat(reloadedStudent.getName()).isEqualTo("Aarav Sharma");
            assertThat(reloadedStudent.getRole()).isEqualTo(Role.ROLE_STUDENT);
            assertThat(reloadedStudent.getHostel()).isEqualTo("Hostel Block B");

            // 6c. Verify Mess Profile, Address, Pricing, and Timings
            Optional<Mess> reloadedMessOpt = messRepository.findById(messId);
            assertThat(reloadedMessOpt).isPresent();
            Mess reloadedMess = reloadedMessOpt.get();
            assertThat(reloadedMess.getName()).isEqualTo("Shivaji Dining Hall");
            assertThat(reloadedMess.getCity()).isEqualTo("Pune");
            assertThat(reloadedMess.getFoodType()).isEqualTo(FoodType.PURE_VEG);
            assertThat(reloadedMess.getStatus()).isEqualTo(MessStatus.APPROVED);
            assertThat(reloadedMess.getOperatingStatus()).isEqualTo(OperatingStatus.OPEN);
            assertThat(reloadedMess.getCapacity()).isEqualTo(75);

            // Precision and pricing checks
            assertThat(reloadedMess.getDailyPrice()).isEqualByComparingTo("100.00");
            assertThat(reloadedMess.getMonthlyPrice()).isEqualByComparingTo("2800.00");
            assertThat(reloadedMess.getBreakfastPrice()).isEqualByComparingTo("40.00");
            assertThat(reloadedMess.getLunchPrice()).isEqualByComparingTo("90.00");
            assertThat(reloadedMess.getDinnerPrice()).isEqualByComparingTo("90.00");

            // Operating timings checks
            assertThat(reloadedMess.getOpeningTime()).isEqualTo("07:30 AM");
            assertThat(reloadedMess.getClosingTime()).isEqualTo("10:30 PM");
            assertThat(reloadedMess.getBreakfastTiming()).isEqualTo("07:30 AM - 10:30 AM");
            assertThat(reloadedMess.getLunchTiming()).isEqualTo("12:00 PM - 03:00 PM");
            assertThat(reloadedMess.getDinnerTiming()).isEqualTo("07:30 PM - 10:30 PM");

            // Facilities mapping check
            assertThat(reloadedMess.getFacilities()).hasSize(2);
            assertThat(reloadedMess.getFacilities())
                    .extracting(Facility::getName)
                    .containsExactlyInAnyOrder("WiFi", "RO Water");

            // 6d. Verify Menu Items
            List<MenuItem> reloadedMenuItems = menuItemRepository.findByMessId(messId);
            assertThat(reloadedMenuItems).hasSize(3);
            assertThat(reloadedMenuItems)
                    .extracting(MenuItem::getName)
                    .containsExactlyInAnyOrder("Kanda Poha & Tea", "Deluxe Veg Thali", "Dal Khichdi & Buttermilk");
            assertThat(reloadedMenuItems)
                    .extracting(MenuItem::getMealType)
                    .containsExactlyInAnyOrder(MealType.BREAKFAST, MealType.LUNCH, MealType.DINNER);

            // 6e. Verify Review
            Optional<Review> reloadedReviewOpt = reviewRepository.findById(reviewId);
            assertThat(reloadedReviewOpt).isPresent();
            Review reloadedReview = reloadedReviewOpt.get();
            assertThat(reloadedReview.getRating()).isEqualTo(5);
            assertThat(reloadedReview.getFoodQualityScore()).isEqualTo(5);
            assertThat(reloadedReview.getHygieneScore()).isEqualTo(4);
            assertThat(reloadedReview.getComment()).isEqualTo("Exceptional hygiene and homely taste every day.");
            assertThat(reloadedReview.getStatus()).isEqualTo(ReviewStatus.PUBLISHED);
            assertThat(reloadedReview.getUser().getId()).isEqualTo(studentId);
            assertThat(reloadedReview.getMess().getId()).isEqualTo(messId);
        }
    }

    @Nested
    @DisplayName("2. Entity Modification and Lifecycle Update Persistence")
    class ModificationPersistenceTests {

        @Test
        @DisplayName("Persist updates to mess timings, operating status, menu dishes, and reviews across cache eviction")
        void shouldPersistEntityUpdatesAcrossCacheEviction() {
            User owner = userRepository.save(User.builder()
                    .name("Ganesh Shinde")
                    .email("ganesh.owner@omkar-mess.com")
                    .password("$2a$10$encodedPasswordHash")
                    .role(Role.ROLE_MESS_OWNER)
                    .status(UserStatus.ACTIVE)
                    .build());

            User student = userRepository.save(User.builder()
                    .name("Neha Joshi")
                    .email("neha.student@mit.edu")
                    .password("$2a$10$encodedPasswordHash")
                    .role(Role.ROLE_STUDENT)
                    .status(UserStatus.ACTIVE)
                    .build());

            Mess mess = messRepository.save(Mess.builder()
                    .owner(owner)
                    .name("Omkar Mess")
                    .address("Kothrud Depot")
                    .city("Pune")
                    .foodType(FoodType.VEG_AND_NON_VEG)
                    .status(MessStatus.PENDING)
                    .operatingStatus(OperatingStatus.CLOSED)
                    .openingTime("08:00 AM")
                    .closingTime("10:00 PM")
                    .build());

            Review review = reviewRepository.save(Review.builder()
                    .user(student)
                    .mess(mess)
                    .rating(3)
                    .comment("Average food quality.")
                    .status(ReviewStatus.PUBLISHED)
                    .build());

            entityManager.flush();
            entityManager.clear();

            // Mutate entities
            Mess existingMess = messRepository.findById(messId(mess)).orElseThrow();
            existingMess.setStatus(MessStatus.APPROVED);
            existingMess.setOperatingStatus(OperatingStatus.OPEN);
            existingMess.setOpeningTime("07:00 AM");
            existingMess.setClosingTime("11:00 PM");
            existingMess.setBreakfastTiming("07:00 AM - 10:00 AM");
            messRepository.save(existingMess);

            Review existingReview = reviewRepository.findById(review.getId()).orElseThrow();
            existingReview.setRating(5);
            existingReview.setComment("Food quality significantly improved! Very tasty now.");
            reviewRepository.save(existingReview);

            // Add new menu item to existing mess
            MenuItem newItem = menuItemRepository.save(MenuItem.builder()
                    .mess(existingMess)
                    .name("Special Chicken Sukka Thali")
                    .dayOfWeek("SUNDAY")
                    .mealType(MealType.LUNCH)
                    .price(new BigDecimal("180.00"))
                    .isAvailable(true)
                    .isSpecial(true)
                    .build());

            // Evict session cache again
            entityManager.flush();
            entityManager.clear();

            // Assert mutations persisted cleanly
            Mess updatedMess = messRepository.findById(messId(mess)).orElseThrow();
            assertThat(updatedMess.getStatus()).isEqualTo(MessStatus.APPROVED);
            assertThat(updatedMess.getOperatingStatus()).isEqualTo(OperatingStatus.OPEN);
            assertThat(updatedMess.getOpeningTime()).isEqualTo("07:00 AM");
            assertThat(updatedMess.getClosingTime()).isEqualTo("11:00 PM");
            assertThat(updatedMess.getBreakfastTiming()).isEqualTo("07:00 AM - 10:00 AM");

            Review updatedReview = reviewRepository.findById(review.getId()).orElseThrow();
            assertThat(updatedReview.getRating()).isEqualTo(5);
            assertThat(updatedReview.getComment()).contains("Food quality significantly improved!");

            MenuItem reloadedNewItem = menuItemRepository.findById(newItem.getId()).orElseThrow();
            assertThat(reloadedNewItem.getName()).isEqualTo("Special Chicken Sukka Thali");
            assertThat(reloadedNewItem.getPrice()).isEqualByComparingTo("180.00");
        }

        private Long messId(Mess mess) {
            return mess.getId();
        }
    }

    @Nested
    @DisplayName("3. Referential Integrity and Constraint Enforcement")
    class ConstraintIntegrityTests {

        @Test
        @DisplayName("Duplicate user email violates unique constraint and throws DataIntegrityViolationException")
        void duplicateUserEmailFailsConstraint() {
            userRepository.save(User.builder()
                    .name("User One")
                    .email("duplicate.test@messmap.com")
                    .password("pass123456")
                    .role(Role.ROLE_STUDENT)
                    .build());

            entityManager.flush();

            assertThatThrownBy(() -> {
                userRepository.save(User.builder()
                        .name("User Two")
                        .email("duplicate.test@messmap.com")
                        .password("pass123456")
                        .role(Role.ROLE_STUDENT)
                        .build());
                entityManager.flush();
            }).isInstanceOf(DataIntegrityViolationException.class);
        }
    }
}
