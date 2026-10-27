package com.messmap.modules.mess.controller;

import com.messmap.modules.menu.entity.MealType;
import com.messmap.modules.menu.entity.MenuItem;
import com.messmap.modules.menu.repository.MenuItemRepository;
import com.messmap.modules.mess.entity.*;
import com.messmap.modules.mess.repository.FacilityRepository;
import com.messmap.modules.mess.repository.MessImageRepository;
import com.messmap.modules.mess.repository.MessRepository;
import com.messmap.modules.review.entity.Review;
import com.messmap.modules.review.entity.ReviewStatus;
import com.messmap.modules.review.repository.ReviewRepository;
import com.messmap.modules.user.entity.Role;
import com.messmap.modules.user.entity.User;
import com.messmap.modules.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class MessControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MessRepository messRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FacilityRepository facilityRepository;

    @Autowired
    private MessImageRepository messImageRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    private User testOwner;
    private Facility wifiFacility;
    private Facility acFacility;
    private Mess approvedVegMessPune;
    private Mess approvedNonVegMessPune;
    private Mess approvedJainMessMumbai;
    private Mess pendingMess;
    private Mess rejectedMess;
    private Mess suspendedMess;

    @BeforeEach
    void setUp() {
        reviewRepository.deleteAll();
        menuItemRepository.deleteAll();
        messImageRepository.deleteAll();
        messRepository.deleteAll();
        userRepository.deleteAll();

        testOwner = userRepository.save(User.builder()
                .name("Ramesh Shinde")
                .email("ramesh.owner@messmap.com")
                .password("$2a$10$hashedOwnerPasswordSecret123456789")
                .phone("+91 9811223344")
                .role(Role.ROLE_MESS_OWNER)
                .build());

        wifiFacility = facilityRepository.findByNameIgnoreCase("WiFi")
                .orElseGet(() -> facilityRepository.save(Facility.builder().name("WiFi").icon("wifi").build()));
        acFacility = facilityRepository.findByNameIgnoreCase("AC Dining")
                .orElseGet(() -> facilityRepository.save(Facility.builder().name("AC Dining").icon("wind").build()));

        // 1. Approved Pure Veg Mess in Pune (Monthly: 2500, Daily: 80)
        approvedVegMessPune = messRepository.save(Mess.builder()
                .owner(testOwner)
                .name("Annapurna Pure Veg Mess")
                .description("Pure vegetarian home style food near FC Road")
                .phone("+91 9822110011")
                .email("annapurna@pune.com")
                .address("Lane 4, FC Road, Shivajinagar")
                .area("Shivajinagar")
                .city("Pune")
                .state("Maharashtra")
                .pincode("411005")
                .latitude(new BigDecimal("18.5204300"))
                .longitude(new BigDecimal("73.8402100"))
                .foodType(FoodType.PURE_VEG)
                .dailyPrice(new BigDecimal("80.00"))
                .monthlyPrice(new BigDecimal("2500.00"))
                .status(MessStatus.APPROVED)
                .operatingStatus(OperatingStatus.OPEN)
                .openingTime("07:30 AM")
                .closingTime("10:30 PM")
                .heroImage("https://images.unsplash.com/photo-annapurna.jpg")
                .capacity(80)
                .facilities(new HashSet<>(Set.of(wifiFacility, acFacility)))
                .build());

        // 2. Approved Non-Veg Mess in Pune (Monthly: 3500, Daily: 120)
        approvedNonVegMessPune = messRepository.save(Mess.builder()
                .owner(testOwner)
                .name("Maratha Special Dining")
                .description("Special veg and non-veg thali with chicken and fish")
                .phone("+91 9822110022")
                .email("maratha@pune.com")
                .address("Near Kothrud Depot, Paud Road")
                .area("Kothrud")
                .city("Pune")
                .state("Maharashtra")
                .pincode("411038")
                .latitude(new BigDecimal("18.5074000"))
                .longitude(new BigDecimal("73.8077000"))
                .foodType(FoodType.VEG_AND_NON_VEG)
                .dailyPrice(new BigDecimal("120.00"))
                .monthlyPrice(new BigDecimal("3500.00"))
                .status(MessStatus.APPROVED)
                .operatingStatus(OperatingStatus.OPEN)
                .openingTime("08:00 AM")
                .closingTime("11:00 PM")
                .heroImage("https://images.unsplash.com/photo-maratha.jpg")
                .capacity(120)
                .facilities(new HashSet<>(Set.of(wifiFacility)))
                .build());

        // 3. Approved Jain Friendly Mess in Mumbai (Monthly: 4000, Daily: 140)
        approvedJainMessMumbai = messRepository.save(Mess.builder()
                .owner(testOwner)
                .name("Shree Mahavir Jain Mess")
                .description("Strictly Jain and sattvic meals without onion and garlic")
                .phone("+91 9822110033")
                .email("mahavir@mumbai.com")
                .address("Dadar West, Near Flower Market")
                .area("Dadar")
                .city("Mumbai")
                .state("Maharashtra")
                .pincode("400028")
                .latitude(new BigDecimal("19.0178000"))
                .longitude(new BigDecimal("72.8478000"))
                .foodType(FoodType.JAIN_FRIENDLY)
                .dailyPrice(new BigDecimal("140.00"))
                .monthlyPrice(new BigDecimal("4000.00"))
                .status(MessStatus.APPROVED)
                .operatingStatus(OperatingStatus.OPEN)
                .openingTime("07:00 AM")
                .closingTime("09:30 PM")
                .heroImage("https://images.unsplash.com/photo-mahavir.jpg")
                .capacity(60)
                .facilities(new HashSet<>(Set.of(wifiFacility)))
                .build());

        // 4. Pending Mess (Should NEVER be returned)
        pendingMess = messRepository.save(Mess.builder()
                .owner(testOwner)
                .name("New Corner Mess (Pending)")
                .description("Pending verification")
                .address("Camp, Pune")
                .city("Pune")
                .foodType(FoodType.PURE_VEG)
                .status(MessStatus.PENDING)
                .build());

        // 5. Rejected Mess (Should NEVER be returned)
        rejectedMess = messRepository.save(Mess.builder()
                .owner(testOwner)
                .name("Disqualified Mess (Rejected)")
                .description("Hygiene issues")
                .address("Hadapsar, Pune")
                .city("Pune")
                .foodType(FoodType.VEG_AND_NON_VEG)
                .status(MessStatus.REJECTED)
                .rejectionReason("Failed hygiene inspection")
                .build());

        // 6. Suspended Mess (Should NEVER be returned)
        suspendedMess = messRepository.save(Mess.builder()
                .owner(testOwner)
                .name("Violator Mess (Suspended)")
                .description("Suspended for violations")
                .address("Viman Nagar, Pune")
                .city("Pune")
                .foodType(FoodType.PURE_VEG)
                .status(MessStatus.SUSPENDED)
                .build());

        // Add gallery images to Annapurna
        MessImage img1 = messImageRepository.save(MessImage.builder()
                .mess(approvedVegMessPune)
                .imageUrl("https://images.unsplash.com/photo-gallery1.jpg")
                .isPrimary(true)
                .caption("Dining Hall")
                .build());
        approvedVegMessPune.getImages().add(img1);

        MessImage img2 = messImageRepository.save(MessImage.builder()
                .mess(approvedVegMessPune)
                .imageUrl("https://images.unsplash.com/photo-gallery2.jpg")
                .isPrimary(false)
                .caption("Kitchen Cleanliness")
                .build());
        approvedVegMessPune.getImages().add(img2);

        // Add menu items to Annapurna: 2 active, 1 inactive
        menuItemRepository.save(MenuItem.builder()
                .mess(approvedVegMessPune)
                .name("Paneer Butter Masala Thali")
                .description("Special thali with 3 rotis, paneer sabji, dal, and jeera rice")
                .mealType(MealType.LUNCH)
                .price(new BigDecimal("120.00"))
                .isAvailable(true)
                .dayOfWeek("Daily")
                .build());

        menuItemRepository.save(MenuItem.builder()
                .mess(approvedVegMessPune)
                .name("Poha & Chai Breakfast")
                .description("Kanda poha garnished with fresh coriander and sev")
                .mealType(MealType.BREAKFAST)
                .price(new BigDecimal("40.00"))
                .isAvailable(true)
                .dayOfWeek("Daily")
                .build());

        menuItemRepository.save(MenuItem.builder()
                .mess(approvedVegMessPune)
                .name("Seasonal Mango Kheer (Inactive)")
                .description("Special mango dessert unavailable in winter")
                .mealType(MealType.SPECIAL)
                .price(new BigDecimal("50.00"))
                .isAvailable(false) // Inactive item!
                .dayOfWeek("Sunday")
                .build());

        // Add a published review to Annapurna
        reviewRepository.save(Review.builder()
                .user(testOwner)
                .mess(approvedVegMessPune)
                .rating(5)
                .comment("Excellent food and clean dining hall!")
                .status(ReviewStatus.PUBLISHED)
                .build());
    }

    // =========================================================================
    // TASK 2 TESTS: GET /api/messes (Discovery & Filtering)
    // =========================================================================

    @Test
    @DisplayName("GET /api/messes should return only APPROVED messes and exclude PENDING, REJECTED, SUSPENDED")
    void testDiscoveryApprovedOnlyVisibility() throws Exception {
        mockMvc.perform(get("/api/messes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(3)))
                .andExpect(jsonPath("$.data[*].status", everyItem(is("APPROVED"))))
                .andExpect(jsonPath("$.data[*].name", containsInAnyOrder(
                        "Annapurna Pure Veg Mess",
                        "Maratha Special Dining",
                        "Shree Mahavir Jain Mess"
                )))
                .andExpect(jsonPath("$.data[*].name", not(hasItem("New Corner Mess (Pending)"))))
                .andExpect(jsonPath("$.data[*].name", not(hasItem("Disqualified Mess (Rejected)"))))
                .andExpect(jsonPath("$.data[*].name", not(hasItem("Violator Mess (Suspended)"))));
    }

    @Test
    @DisplayName("GET /api/v1/messes alias route should function identically")
    void testDiscoveryAliasRoute() throws Exception {
        mockMvc.perform(get("/api/v1/messes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(3)));
    }

    @Test
    @DisplayName("GET /api/messes?search=annapurna should match mess name case-insensitively")
    void testSearchByNameCaseInsensitive() throws Exception {
        mockMvc.perform(get("/api/messes").param("search", "ANNAPURNA"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].name", is("Annapurna Pure Veg Mess")));
    }

    @Test
    @DisplayName("GET /api/messes?search=shivajinagar should match locality via search parameter")
    void testSearchByLocalityKeyword() throws Exception {
        mockMvc.perform(get("/api/messes").param("search", "shivajinagar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].name", is("Annapurna Pure Veg Mess")));
    }

    @Test
    @DisplayName("GET /api/messes?locality=Kothrud should filter by specific locality")
    void testFilterByLocality() throws Exception {
        mockMvc.perform(get("/api/messes").param("locality", "kothrud"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].name", is("Maratha Special Dining")));
    }

    @Test
    @DisplayName("GET /api/messes?city=pune should filter messes by city case-insensitively")
    void testFilterByCity() throws Exception {
        mockMvc.perform(get("/api/messes").param("city", "pune"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[*].name", containsInAnyOrder(
                        "Annapurna Pure Veg Mess",
                        "Maratha Special Dining"
                )));
    }

    @Test
    @DisplayName("GET /api/messes?foodType=VEG should return PURE_VEG and JAIN_FRIENDLY messes")
    void testFilterByFoodTypeVeg() throws Exception {
        mockMvc.perform(get("/api/messes").param("foodType", "VEG"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[*].name", containsInAnyOrder(
                        "Annapurna Pure Veg Mess",
                        "Shree Mahavir Jain Mess"
                )));
    }

    @Test
    @DisplayName("GET /api/messes?foodType=NON_VEG should return VEG_AND_NON_VEG messes")
    void testFilterByFoodTypeNonVeg() throws Exception {
        mockMvc.perform(get("/api/messes").param("foodType", "NON_VEG"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].name", is("Maratha Special Dining")));
    }

    @Test
    @DisplayName("GET /api/messes?foodType=BOTH should return VEG_AND_NON_VEG messes")
    void testFilterByFoodTypeBoth() throws Exception {
        mockMvc.perform(get("/api/messes").param("foodType", "BOTH"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].name", is("Maratha Special Dining")));
    }

    @Test
    @DisplayName("GET /api/messes with minPrice filter should exclude cheaper messes")
    void testFilterByMinPrice() throws Exception {
        mockMvc.perform(get("/api/messes").param("minPrice", "3000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[*].name", containsInAnyOrder(
                        "Maratha Special Dining",
                        "Shree Mahavir Jain Mess"
                )));
    }

    @Test
    @DisplayName("GET /api/messes with maxPrice filter should exclude more expensive messes")
    void testFilterByMaxPrice() throws Exception {
        mockMvc.perform(get("/api/messes").param("maxPrice", "3000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].name", is("Annapurna Pure Veg Mess")));
    }

    @Test
    @DisplayName("GET /api/messes with minPrice and maxPrice range should filter correctly")
    void testFilterByPriceRange() throws Exception {
        mockMvc.perform(get("/api/messes")
                        .param("minPrice", "2000")
                        .param("maxPrice", "3000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].name", is("Annapurna Pure Veg Mess")));
    }

    @Test
    @DisplayName("GET /api/messes with multiple combined filters should apply conjunction (AND) correctly")
    void testCombinedFilters() throws Exception {
        mockMvc.perform(get("/api/messes")
                        .param("city", "Pune")
                        .param("foodType", "VEG")
                        .param("locality", "Shivajinagar")
                        .param("minPrice", "2000")
                        .param("maxPrice", "3000")
                        .param("search", "Annapurna"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].name", is("Annapurna Pure Veg Mess")));
    }

    @Test
    @DisplayName("GET /api/messes with invalid foodType should return HTTP 400 Bad Request")
    void testInvalidFoodTypeReturns400() throws Exception {
        mockMvc.perform(get("/api/messes").param("foodType", "INVALID_FOOD_CATEGORY"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.message", containsString("Invalid foodType")));
    }

    @Test
    @DisplayName("GET /api/messes with negative minPrice should return HTTP 400 Bad Request")
    void testNegativeMinPriceReturns400() throws Exception {
        mockMvc.perform(get("/api/messes").param("minPrice", "-100"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.message", containsString("minPrice cannot be negative")));
    }

    @Test
    @DisplayName("GET /api/messes with inverted price range (minPrice > maxPrice) should return HTTP 400")
    void testInvertedPriceRangeReturns400() throws Exception {
        mockMvc.perform(get("/api/messes")
                        .param("minPrice", "4000")
                        .param("maxPrice", "2000"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.message", containsString("minPrice (4000) cannot be greater than maxPrice (2000)")));
    }

    @Test
    @DisplayName("GET /api/messes with pagination parameters should return paged results")
    void testPaginationParameters() throws Exception {
        mockMvc.perform(get("/api/messes")
                        .param("page", "0")
                        .param("size", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(2)));
    }

    // =========================================================================
    // TASK 3 TESTS: GET /api/messes/{id} (Listing Details)
    // =========================================================================

    @Test
    @DisplayName("GET /api/messes/{id} should return complete listing details for APPROVED mess")
    void testGetApprovedMessDetailsSuccess() throws Exception {
        mockMvc.perform(get("/api/messes/{id}", approvedVegMessPune.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.id", is(approvedVegMessPune.getId().intValue())))
                .andExpect(jsonPath("$.data.name", is("Annapurna Pure Veg Mess")))
                .andExpect(jsonPath("$.data.address", is("Lane 4, FC Road, Shivajinagar")))
                .andExpect(jsonPath("$.data.area", is("Shivajinagar")))
                .andExpect(jsonPath("$.data.city", is("Pune")))
                .andExpect(jsonPath("$.data.state", is("Maharashtra")))
                .andExpect(jsonPath("$.data.pincode", is("411005")))
                .andExpect(jsonPath("$.data.phone", is("+91 9822110011")))
                .andExpect(jsonPath("$.data.email", is("annapurna@pune.com")))
                .andExpect(jsonPath("$.data.foodType", is("PURE_VEG")))
                .andExpect(jsonPath("$.data.dailyPrice", is(80.0)))
                .andExpect(jsonPath("$.data.monthlyPrice", is(2500.0)))
                .andExpect(jsonPath("$.data.status", is("APPROVED")))
                .andExpect(jsonPath("$.data.operatingStatus", is("OPEN")))
                .andExpect(jsonPath("$.data.openingTime", is("07:30 AM")))
                .andExpect(jsonPath("$.data.closingTime", is("10:30 PM")))
                .andExpect(jsonPath("$.data.mealTimings.breakfast", is("07:30 AM")))
                .andExpect(jsonPath("$.data.mealTimings.lunch", is("12:15 PM – 03:00 PM")))
                .andExpect(jsonPath("$.data.mealTimings.dinner", is("07:30 PM – 10:30 PM")))
                .andExpect(jsonPath("$.data.facilities", hasSize(2)))
                .andExpect(jsonPath("$.data.images", hasSize(2)))
                .andExpect(jsonPath("$.data.gallery", hasSize(2)))
                .andExpect(jsonPath("$.data.rating", is(5.0)))
                .andExpect(jsonPath("$.data.reviewCount", is(1)));
    }

    @Test
    @DisplayName("GET /api/v1/messes/{id} alias route should function identically")
    void testGetMessDetailsAliasRoute() throws Exception {
        mockMvc.perform(get("/api/v1/messes/{id}", approvedVegMessPune.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.id", is(approvedVegMessPune.getId().intValue())));
    }

    @Test
    @DisplayName("GET /api/messes/{id} should include ONLY active menu items (isAvailable=true)")
    void testActiveMenuItemsOnly() throws Exception {
        mockMvc.perform(get("/api/messes/{id}", approvedVegMessPune.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.menuItems", hasSize(2)))
                .andExpect(jsonPath("$.data.menuItems[*].name", containsInAnyOrder(
                        "Paneer Butter Masala Thali",
                        "Poha & Chai Breakfast"
                )))
                .andExpect(jsonPath("$.data.menuItems[*].name", not(hasItem("Seasonal Mango Kheer (Inactive)"))));
    }

    @Test
    @DisplayName("GET /api/messes/{id} should NOT expose sensitive owner or internal credentials")
    void testSensitiveInformationNotExposed() throws Exception {
        mockMvc.perform(get("/api/messes/{id}", approvedVegMessPune.getId()))
                .andExpect(status().isOk())
                // Safe public information
                .andExpect(jsonPath("$.data.ownerName", is("Ramesh Shinde")))
                // Ensure sensitive owner credentials and internals are completely absent
                .andExpect(jsonPath("$.data.owner").doesNotExist())
                .andExpect(jsonPath("$.data.password").doesNotExist())
                .andExpect(jsonPath("$.data.ownerPassword").doesNotExist())
                .andExpect(jsonPath("$.data.ownerRole").doesNotExist())
                .andExpect(jsonPath("$.data.rejectionReason").doesNotExist());
    }

    @Test
    @DisplayName("GET /api/messes/{id} for nonexistent mess ID should return HTTP 404 Not Found")
    void testGetNonexistentMessReturns404() throws Exception {
        mockMvc.perform(get("/api/messes/{id}", 999999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.message", containsString("Mess not found with id: 999999")));
    }

    @Test
    @DisplayName("GET /api/messes/{id} for PENDING mess should return HTTP 404 Not Found")
    void testGetPendingMessReturns404() throws Exception {
        mockMvc.perform(get("/api/messes/{id}", pendingMess.getId()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.status", is(404)));
    }

    @Test
    @DisplayName("GET /api/messes/{id} for REJECTED mess should return HTTP 404 Not Found")
    void testGetRejectedMessReturns404() throws Exception {
        mockMvc.perform(get("/api/messes/{id}", rejectedMess.getId()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.status", is(404)));
    }

    @Test
    @DisplayName("GET /api/messes/{id} for SUSPENDED mess should return HTTP 404 Not Found")
    void testGetSuspendedMessReturns404() throws Exception {
        mockMvc.perform(get("/api/messes/{id}", suspendedMess.getId()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.status", is(404)));
    }

    @Test
    @DisplayName("GET /api/messes/{id} for invalid non-numeric ID like MESS-103 should return HTTP 400 Bad Request")
    void testGetInvalidMessIdTypeReturns400() throws Exception {
        mockMvc.perform(get("/api/messes/{id}", "MESS-103"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.message", containsString("Invalid parameter 'id': 'MESS-103' is not a valid Long")));
    }

    @Test
    @DisplayName("GET /api/messes/nearby: should return approved messes ordered by distance within radius")
    void testNearbyMesses_OrdersByDistanceAndFiltersByRadius() throws Exception {
        // Origin at FC Road, Shivajinagar (18.5204, 73.8402)
        // 1. With radius = 2.0 km: only Annapurna (~0.01 km) should be returned, Maratha (~3.7 km) & Mahavir (~120 km) excluded
        mockMvc.perform(get("/api/messes/nearby")
                        .param("latitude", "18.5204")
                        .param("longitude", "73.8402")
                        .param("radiusKm", "2.0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id", is(approvedVegMessPune.getId().intValue())))
                .andExpect(jsonPath("$.data[0].name", is("Annapurna Pure Veg Mess")))
                .andExpect(jsonPath("$.data[0].distanceKm", notNullValue()));

        // 2. With radius = 5.0 km: both Annapurna and Maratha returned, ordered by distance ascending
        mockMvc.perform(get("/api/messes/nearby")
                        .param("latitude", "18.5204")
                        .param("longitude", "73.8402")
                        .param("radiusKm", "5.0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[0].id", is(approvedVegMessPune.getId().intValue())))
                .andExpect(jsonPath("$.data[1].id", is(approvedNonVegMessPune.getId().intValue())));
    }

    @Test
    @DisplayName("GET /api/messes/nearby: should exclude pending, rejected, and suspended messes")
    void testNearbyMesses_ExcludesUnapprovedMesses() throws Exception {
        // Check that pendingMess, rejectedMess, suspendedMess located in Pune are never included in nearby results
        mockMvc.perform(get("/api/messes/nearby")
                        .param("latitude", "18.5204")
                        .param("longitude", "73.8402")
                        .param("radiusKm", "50.0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data[*].id", not(hasItem(pendingMess.getId().intValue()))))
                .andExpect(jsonPath("$.data[*].id", not(hasItem(rejectedMess.getId().intValue()))))
                .andExpect(jsonPath("$.data[*].id", not(hasItem(suspendedMess.getId().intValue()))));
    }

    @Test
    @DisplayName("GET /api/messes/nearby: should return 400 Bad Request for invalid coordinates")
    void testNearbyMesses_InvalidCoordinates_Returns400() throws Exception {
        // Latitude out of range
        mockMvc.perform(get("/api/messes/nearby")
                        .param("latitude", "95.0")
                        .param("longitude", "73.8402"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.message", containsString("Valid latitude")));

        // Longitude out of range
        mockMvc.perform(get("/api/messes/nearby")
                        .param("latitude", "18.5204")
                        .param("longitude", "195.0"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.message", containsString("Valid longitude")));
    }

    @Test
    @DisplayName("GET /api/messes/nearby: should return 400 Bad Request for invalid radius")
    void testNearbyMesses_InvalidRadius_Returns400() throws Exception {
        mockMvc.perform(get("/api/messes/nearby")
                        .param("latitude", "18.5204")
                        .param("longitude", "73.8402")
                        .param("radiusKm", "-2.0"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.message", containsString("Radius must be greater than 0")));
    }

    @Test
    @DisplayName("GET /api/messes/nearby: should combine nearby distance filter with foodType filter")
    void testNearbyMesses_WithFoodTypeFilter() throws Exception {
        mockMvc.perform(get("/api/messes/nearby")
                        .param("latitude", "18.5204")
                        .param("longitude", "73.8402")
                        .param("radiusKm", "5.0")
                        .param("foodType", "VEG"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id", is(approvedVegMessPune.getId().intValue())));
    }

    @Test
    @DisplayName("GET /api/v1/messes/nearby: should resolve correctly via versioned v1 route alias")
    void testNearbyMesses_V1Route_ResolvesCorrectly() throws Exception {
        mockMvc.perform(get("/api/v1/messes/nearby")
                        .param("latitude", "18.5204")
                        .param("longitude", "73.8402")
                        .param("radiusKm", "2.0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id", is(approvedVegMessPune.getId().intValue())))
                .andExpect(jsonPath("$.data[0].name", is("Annapurna Pure Veg Mess")))
                .andExpect(jsonPath("$.data[0].distanceKm", notNullValue()));
    }
}
