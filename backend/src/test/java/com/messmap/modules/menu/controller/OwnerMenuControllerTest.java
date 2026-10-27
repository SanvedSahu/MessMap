package com.messmap.modules.menu.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.messmap.modules.menu.dto.CreateMenuItemRequest;
import com.messmap.modules.menu.dto.UpdateMenuItemRequest;
import com.messmap.modules.menu.dto.UpdateMessPricingRequest;
import com.messmap.modules.menu.entity.MealType;
import com.messmap.modules.menu.entity.MenuItem;
import com.messmap.modules.menu.repository.MenuItemRepository;
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
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class OwnerMenuControllerTest {

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

    private User ownerA;
    private String tokenOwnerA;

    private User ownerB;
    private String tokenOwnerB;

    private User studentUser;
    private String tokenStudent;

    private Mess messOwnerA;
    private Mess messOwnerB;

    @BeforeEach
    void setUp() {
        // Create Owner A
        ownerA = userRepository.save(User.builder()
                .name("Owner Alice")
                .email("alice.menu@messmap.com")
                .password(passwordEncoder.encode("alicePass123"))
                .phone("+91 98231 11111")
                .role(Role.ROLE_MESS_OWNER)
                .status(UserStatus.ACTIVE)
                .build());
        tokenOwnerA = tokenProvider.generateToken(ownerA);

        // Create Mess for Owner A
        messOwnerA = messRepository.save(Mess.builder()
                .owner(ownerA)
                .name("Alice Delight Mess")
                .address("123 College Road")
                .area("FC Road")
                .city("Pune")
                .foodType(FoodType.PURE_VEG)
                .status(MessStatus.APPROVED)
                .operatingStatus(OperatingStatus.OPEN)
                .breakfastPrice(new BigDecimal("40.00"))
                .lunchPrice(new BigDecimal("80.00"))
                .dinnerPrice(new BigDecimal("90.00"))
                .dailyPrice(new BigDecimal("160.00"))
                .monthlyPrice(new BigDecimal("3200.00"))
                .build());

        // Create Owner B
        ownerB = userRepository.save(User.builder()
                .name("Owner Bob")
                .email("bob.menu@messmap.com")
                .password(passwordEncoder.encode("bobPass123"))
                .phone("+91 98231 22222")
                .role(Role.ROLE_MESS_OWNER)
                .status(UserStatus.ACTIVE)
                .build());
        tokenOwnerB = tokenProvider.generateToken(ownerB);

        // Create Mess for Owner B
        messOwnerB = messRepository.save(Mess.builder()
                .owner(ownerB)
                .name("Bob Kitchen")
                .address("456 Station Road")
                .area("JM Road")
                .city("Pune")
                .foodType(FoodType.VEG_AND_NON_VEG)
                .status(MessStatus.APPROVED)
                .operatingStatus(OperatingStatus.OPEN)
                .breakfastPrice(new BigDecimal("50.00"))
                .lunchPrice(new BigDecimal("100.00"))
                .dinnerPrice(new BigDecimal("110.00"))
                .dailyPrice(new BigDecimal("200.00"))
                .monthlyPrice(new BigDecimal("4000.00"))
                .build());

        // Create Student User
        studentUser = userRepository.save(User.builder()
                .name("Student Charlie")
                .email("charlie.student@messmap.com")
                .password(passwordEncoder.encode("studentPass123"))
                .role(Role.ROLE_STUDENT)
                .status(UserStatus.ACTIVE)
                .build());
        tokenStudent = tokenProvider.generateToken(studentUser);
    }

    @Test
    @DisplayName("GET /api/owner/mess/menu - Should retrieve owner menu grouped by day and meal type")
    void shouldRetrieveOwnerMenuSuccessfully_GroupedByDayAndMealType() throws Exception {
        // Seed items for Owner A
        menuItemRepository.save(MenuItem.builder()
                .mess(messOwnerA)
                .name("Poha & Jalebi")
                .description("Hot poha with sweet jalebi")
                .mealType(MealType.BREAKFAST)
                .dayOfWeek("MONDAY")
                .price(new BigDecimal("40.00"))
                .isAvailable(true)
                .isSpecial(false)
                .build());

        menuItemRepository.save(MenuItem.builder()
                .mess(messOwnerA)
                .name("Paneer Masala Thali")
                .description("Special deluxe thali")
                .mealType(MealType.LUNCH)
                .dayOfWeek("MONDAY")
                .price(new BigDecimal("120.00"))
                .isAvailable(true)
                .isSpecial(true)
                .build());

        menuItemRepository.save(MenuItem.builder()
                .mess(messOwnerA)
                .name("Dal Khichdi & Papad")
                .description("Light dinner")
                .mealType(MealType.DINNER)
                .dayOfWeek("TUESDAY")
                .price(new BigDecimal("80.00"))
                .isAvailable(true)
                .isSpecial(false)
                .build());

        // Test non-versioned route
        mockMvc.perform(get("/api/owner/mess/menu")
                        .header("Authorization", "Bearer " + tokenOwnerA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.messId").value(messOwnerA.getId()))
                .andExpect(jsonPath("$.data.messName").value("Alice Delight Mess"))
                .andExpect(jsonPath("$.data.pricing.breakfastPrice").value(40.0))
                .andExpect(jsonPath("$.data.pricing.lunchPrice").value(80.0))
                .andExpect(jsonPath("$.data.pricing.dinnerPrice").value(90.0))
                .andExpect(jsonPath("$.data.pricing.monthlyPrice").value(3200.0))
                .andExpect(jsonPath("$.data.groupedMenu.MONDAY.BREAKFAST[0].name").value("Poha & Jalebi"))
                .andExpect(jsonPath("$.data.groupedMenu.MONDAY.LUNCH[0].name").value("Paneer Masala Thali"))
                .andExpect(jsonPath("$.data.groupedMenu.MONDAY.LUNCH[0].isSpecial").value(true))
                .andExpect(jsonPath("$.data.groupedMenu.TUESDAY.DINNER[0].name").value("Dal Khichdi & Papad"))
                .andExpect(jsonPath("$.data.items", hasSize(3)));

        // Test versioned alias /api/v1/owner/mess/menu
        mockMvc.perform(get("/api/v1/owner/mess/menu")
                        .header("Authorization", "Bearer " + tokenOwnerA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.messId").value(messOwnerA.getId()));
    }

    @Test
    @DisplayName("POST /api/owner/mess/menu/items - Should add a dish to owner's menu")
    void shouldCreateMenuItemSuccessfully() throws Exception {
        CreateMenuItemRequest request = CreateMenuItemRequest.builder()
                .dishName("Chole Bhature")
                .description("2 crispy bhature with spiced chole")
                .mealType(MealType.LUNCH)
                .dayOfWeek("SUNDAY")
                .price(new BigDecimal("90.00"))
                .isAvailable(true)
                .isSpecial(true)
                .build();

        mockMvc.perform(post("/api/owner/mess/menu/items")
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").isNumber())
                .andExpect(jsonPath("$.data.name").value("Chole Bhature"))
                .andExpect(jsonPath("$.data.dishName").value("Chole Bhature"))
                .andExpect(jsonPath("$.data.mealType").value("LUNCH"))
                .andExpect(jsonPath("$.data.dayOfWeek").value("SUNDAY"))
                .andExpect(jsonPath("$.data.isSpecial").value(true))
                .andExpect(jsonPath("$.data.price").value(90.0));
    }

    @Test
    @DisplayName("POST /api/owner/mess/menu/items - Should add a snack dish to owner's menu")
    void shouldCreateMenuItemSuccessfully_WithSnacksMealType() throws Exception {
        CreateMenuItemRequest request = CreateMenuItemRequest.builder()
                .dishName("Samosa & Masala Chai")
                .description("Crispy aloo samosa with ginger chai")
                .mealType(MealType.SNACKS)
                .dayOfWeek("MONDAY")
                .price(new BigDecimal("30.00"))
                .isAvailable(true)
                .isSpecial(false)
                .build();

        mockMvc.perform(post("/api/owner/mess/menu/items")
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").isNumber())
                .andExpect(jsonPath("$.data.name").value("Samosa & Masala Chai"))
                .andExpect(jsonPath("$.data.mealType").value("SNACKS"));
    }

    @Test
    @DisplayName("POST /api/owner/mess/menu/items - Should reject cross-owner creation with 403 Forbidden")
    void shouldForbidCrossOwnerItemCreate() throws Exception {
        CreateMenuItemRequest request = CreateMenuItemRequest.builder()
                .messId(messOwnerA.getId())
                .dishName("Unauthorized Item")
                .mealType(MealType.LUNCH)
                .dayOfWeek("MONDAY")
                .price(new BigDecimal("50.00"))
                .build();

        mockMvc.perform(post("/api/owner/mess/menu/items")
                        .header("Authorization", "Bearer " + tokenOwnerB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("POST /api/owner/mess/menu/items - Persisted item remains retrievable in subsequent GET requests")
    void shouldPersistAndRetrieveCreatedMenuItemAcrossRequests() throws Exception {
        CreateMenuItemRequest request = CreateMenuItemRequest.builder()
                .dishName("Persistence Test Dish 847")
                .description("Freshly cooked")
                .mealType(MealType.LUNCH)
                .dayOfWeek("MONDAY")
                .price(new BigDecimal("120.00"))
                .isAvailable(true)
                .build();

        org.springframework.test.web.servlet.MvcResult createResult = mockMvc.perform(post("/api/owner/mess/menu/items")
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andReturn();

        com.fasterxml.jackson.databind.JsonNode root = objectMapper.readTree(createResult.getResponse().getContentAsString());
        long createdId = root.get("data").get("id").asLong();

        // Simulate subsequent page load / refresh
        mockMvc.perform(get("/api/owner/mess/menu")
                        .header("Authorization", "Bearer " + tokenOwnerA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.items[?(@.id == " + createdId + ")].name").value("Persistence Test Dish 847"));
    }

    @Test
    @DisplayName("PUT /api/owner/mess/menu/items/{id} - Should update an existing dish")
    void shouldUpdateMenuItemSuccessfully() throws Exception {
        MenuItem item = menuItemRepository.save(MenuItem.builder()
                .mess(messOwnerA)
                .name("Veg Biryani")
                .mealType(MealType.LUNCH)
                .dayOfWeek("FRIDAY")
                .price(new BigDecimal("100.00"))
                .isAvailable(true)
                .isSpecial(false)
                .build());

        UpdateMenuItemRequest updateReq = UpdateMenuItemRequest.builder()
                .dishName("Shahi Veg Biryani Special")
                .price(new BigDecimal("130.00"))
                .isSpecial(true)
                .build();

        mockMvc.perform(put("/api/owner/mess/menu/items/" + item.getId())
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(item.getId()))
                .andExpect(jsonPath("$.data.name").value("Shahi Veg Biryani Special"))
                .andExpect(jsonPath("$.data.price").value(130.0))
                .andExpect(jsonPath("$.data.isSpecial").value(true));
    }

    @Test
    @DisplayName("DELETE /api/owner/mess/menu/items/{id} - Should delete a dish")
    void shouldDeleteMenuItemSuccessfully() throws Exception {
        MenuItem item = menuItemRepository.save(MenuItem.builder()
                .mess(messOwnerA)
                .name("Aloo Paratha")
                .mealType(MealType.BREAKFAST)
                .dayOfWeek("WEDNESDAY")
                .price(new BigDecimal("50.00"))
                .isAvailable(true)
                .build());

        mockMvc.perform(delete("/api/owner/mess/menu/items/" + item.getId())
                        .header("Authorization", "Bearer " + tokenOwnerA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        mockMvc.perform(get("/api/owner/mess/menu")
                        .header("Authorization", "Bearer " + tokenOwnerA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items", empty()));
    }

    @Test
    @DisplayName("PUT /api/owner/mess/pricing - Should update meal and monthly-pass pricing")
    void shouldUpdateMessPricingSuccessfully() throws Exception {
        UpdateMessPricingRequest request = UpdateMessPricingRequest.builder()
                .breakfastPrice(new BigDecimal("45.00"))
                .lunchPrice(new BigDecimal("85.00"))
                .dinnerPrice(new BigDecimal("95.00"))
                .dailyPrice(new BigDecimal("180.00"))
                .monthlyPrice(new BigDecimal("3500.00"))
                .build();

        mockMvc.perform(put("/api/owner/mess/pricing")
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.breakfastPrice").value(45.0))
                .andExpect(jsonPath("$.data.lunchPrice").value(85.0))
                .andExpect(jsonPath("$.data.dinnerPrice").value(95.0))
                .andExpect(jsonPath("$.data.dailyPrice").value(180.0))
                .andExpect(jsonPath("$.data.monthlyPrice").value(3500.0));
    }

    @Test
    @DisplayName("POST /api/owner/mess/menu/items - Should reject invalid weekday with 400 Bad Request")
    void shouldRejectInvalidWeekday() throws Exception {
        CreateMenuItemRequest request = CreateMenuItemRequest.builder()
                .dishName("Idli Sambar")
                .mealType(MealType.BREAKFAST)
                .dayOfWeek("Funday")
                .price(new BigDecimal("35.00"))
                .build();

        mockMvc.perform(post("/api/owner/mess/menu/items")
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("POST /api/owner/mess/menu/items - Should reject blank dish name with 400 Bad Request")
    void shouldRejectBlankDishName() throws Exception {
        CreateMenuItemRequest request = CreateMenuItemRequest.builder()
                .dishName("   ")
                .mealType(MealType.BREAKFAST)
                .dayOfWeek("MONDAY")
                .price(new BigDecimal("35.00"))
                .build();

        mockMvc.perform(post("/api/owner/mess/menu/items")
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("POST /api/owner/mess/menu/items - Should reject negative price with 400 Bad Request")
    void shouldRejectNegativePrice() throws Exception {
        CreateMenuItemRequest request = CreateMenuItemRequest.builder()
                .dishName("Masala Dosa")
                .mealType(MealType.BREAKFAST)
                .dayOfWeek("SATURDAY")
                .price(new BigDecimal("-10.00"))
                .build();

        mockMvc.perform(post("/api/owner/mess/menu/items")
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("POST /api/owner/mess/menu/items - Should reject MealType.SPECIAL with 400 directing owner to isSpecial=true")
    void shouldRejectSpecialMealTypeOnCreate() throws Exception {
        CreateMenuItemRequest request = CreateMenuItemRequest.builder()
                .dishName("Sunday Festive Special Thali")
                .mealType(MealType.SPECIAL)
                .dayOfWeek("SUNDAY")
                .price(new BigDecimal("150.00"))
                .build();

        mockMvc.perform(post("/api/owner/mess/menu/items")
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(containsString("Meal type must be BREAKFAST, LUNCH, or DINNER")));
    }

    @Test
    @DisplayName("PUT /api/owner/mess/menu/items/{id} - Should reject MealType.SPECIAL on update with 400")
    void shouldRejectSpecialMealTypeOnUpdate() throws Exception {
        MenuItem item = menuItemRepository.save(MenuItem.builder()
                .mess(messOwnerA)
                .name("Normal Lunch")
                .mealType(MealType.LUNCH)
                .dayOfWeek("MONDAY")
                .price(new BigDecimal("80.00"))
                .build());

        UpdateMenuItemRequest updateReq = UpdateMenuItemRequest.builder()
                .mealType(MealType.SPECIAL)
                .build();

        mockMvc.perform(put("/api/owner/mess/menu/items/" + item.getId())
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(containsString("Meal type must be BREAKFAST, LUNCH, or DINNER")));
    }

    @Test
    @DisplayName("GET /api/owner/mess/menu - Should tolerate and read legacy SPECIAL meal items without error")
    void shouldReadLegacySpecialMenuItemInOwnerMenu() throws Exception {
        // Save a legacy item directly in the repository with MealType.SPECIAL
        menuItemRepository.save(MenuItem.builder()
                .mess(messOwnerA)
                .name("Legacy Seasonal Kheer")
                .mealType(MealType.SPECIAL)
                .dayOfWeek("SUNDAY")
                .price(new BigDecimal("60.00"))
                .isAvailable(true)
                .build());

        mockMvc.perform(get("/api/owner/mess/menu")
                        .header("Authorization", "Bearer " + tokenOwnerA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.groupedMenu.SUNDAY.SPECIAL[0].name").value("Legacy Seasonal Kheer"))
                .andExpect(jsonPath("$.data.items[?(@.name == 'Legacy Seasonal Kheer')]").exists());
    }

    @Test
    @DisplayName("PUT /api/owner/mess/pricing - Should reject negative pricing with 400 Bad Request")
    void shouldRejectNegativePricing() throws Exception {
        UpdateMessPricingRequest request = UpdateMessPricingRequest.builder()
                .breakfastPrice(new BigDecimal("-5.00"))
                .build();

        mockMvc.perform(put("/api/owner/mess/pricing")
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("PUT /api/owner/mess/menu/items/{id} - Should return 404 when menu item does not exist")
    void shouldReturn404WhenMenuItemNotFound() throws Exception {
        UpdateMenuItemRequest request = UpdateMenuItemRequest.builder()
                .dishName("Nonexistent Dish")
                .build();

        mockMvc.perform(put("/api/owner/mess/menu/items/999999")
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("PUT /api/owner/mess/menu/items/{id} - Should reject cross-owner modification with 403 Forbidden")
    void shouldForbidCrossOwnerItemUpdate() throws Exception {
        MenuItem itemOwnerA = menuItemRepository.save(MenuItem.builder()
                .mess(messOwnerA)
                .name("Alice Puri Bhaji")
                .mealType(MealType.BREAKFAST)
                .dayOfWeek("SUNDAY")
                .price(new BigDecimal("50.00"))
                .isAvailable(true)
                .build());

        UpdateMenuItemRequest hijackAttempt = UpdateMenuItemRequest.builder()
                .dishName("Bob Tampered Dish")
                .price(new BigDecimal("20.00"))
                .build();

        mockMvc.perform(put("/api/owner/mess/menu/items/" + itemOwnerA.getId())
                        .header("Authorization", "Bearer " + tokenOwnerB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(hijackAttempt)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("DELETE /api/owner/mess/menu/items/{id} - Should reject cross-owner deletion with 403 Forbidden")
    void shouldForbidCrossOwnerItemDelete() throws Exception {
        MenuItem itemOwnerA = menuItemRepository.save(MenuItem.builder()
                .mess(messOwnerA)
                .name("Alice Protected Item")
                .mealType(MealType.LUNCH)
                .dayOfWeek("MONDAY")
                .price(new BigDecimal("70.00"))
                .isAvailable(true)
                .build());

        mockMvc.perform(delete("/api/owner/mess/menu/items/" + itemOwnerA.getId())
                        .header("Authorization", "Bearer " + tokenOwnerB))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Security - Should reject student access to owner menu endpoints with 403 Forbidden")
    void shouldForbidStudentAccessToOwnerMenu() throws Exception {
        mockMvc.perform(get("/api/owner/mess/menu")
                        .header("Authorization", "Bearer " + tokenStudent))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));

        mockMvc.perform(post("/api/owner/mess/menu/items")
                        .header("Authorization", "Bearer " + tokenStudent)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Integration with Issue #8 - Student discovery reflects updated menu and pricing immediately")
    void shouldReflectUpdatedMenuAndPricingInStudentDiscovery() throws Exception {
        // Owner updates pricing
        UpdateMessPricingRequest pricingReq = UpdateMessPricingRequest.builder()
                .breakfastPrice(new BigDecimal("42.00"))
                .lunchPrice(new BigDecimal("82.00"))
                .dinnerPrice(new BigDecimal("92.00"))
                .monthlyPrice(new BigDecimal("3250.00"))
                .build();

        mockMvc.perform(put("/api/owner/mess/pricing")
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(pricingReq)))
                .andExpect(status().isOk());

        // Owner adds dish
        CreateMenuItemRequest itemReq = CreateMenuItemRequest.builder()
                .dishName("Fresh Veg Pulao")
                .mealType(MealType.LUNCH)
                .dayOfWeek("THURSDAY")
                .price(new BigDecimal("95.00"))
                .isSpecial(true)
                .build();

        mockMvc.perform(post("/api/owner/mess/menu/items")
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(itemReq)))
                .andExpect(status().isCreated());

        // Student discovery endpoint (Issue #8)
        mockMvc.perform(get("/api/messes/" + messOwnerA.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(messOwnerA.getId()))
                .andExpect(jsonPath("$.data.breakfastPrice").value(42.0))
                .andExpect(jsonPath("$.data.lunchPrice").value(82.0))
                .andExpect(jsonPath("$.data.dinnerPrice").value(92.0))
                .andExpect(jsonPath("$.data.monthlyPrice").value(3250.0))
                .andExpect(jsonPath("$.data.menuItems[0].name").value("Fresh Veg Pulao"))
                .andExpect(jsonPath("$.data.menuItems[0].isSpecial").value(true));
    }
}
