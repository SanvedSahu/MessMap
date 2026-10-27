package com.messmap.modules.menu;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.messmap.modules.menu.dto.UpdateDailyMealRequest;
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
class DailyMealMenuIntegrationTest {

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
    private JwtTokenProvider jwtTokenProvider;

    private User ownerA;
    private String ownerAToken;

    private User ownerB;
    private String ownerBToken;

    private User student;
    private String studentToken;

    private Mess messA;
    private Mess messB;

    @BeforeEach
    void setUp() {
        menuItemRepository.deleteAll();

        // Owner A & Mess A
        ownerA = userRepository.save(User.builder()
                .name("Rajesh Sharma")
                .email("owner.daily.a@test.com")
                .password(passwordEncoder.encode("Password@123"))
                .role(Role.ROLE_MESS_OWNER)
                .status(UserStatus.ACTIVE)
                .phone("+91 98111 00001")
                .build());
        ownerAToken = "Bearer " + jwtTokenProvider.generateToken(ownerA);

        messA = messRepository.save(Mess.builder()
                .name("Annapurna Pure Veg Mess")
                .description("Authentic Maharashtrian & North Indian food")
                .address("FC Road, Shivajinagar")
                .area("Shivajinagar")
                .city("Pune")
                .pincode("411005")
                .latitude(BigDecimal.valueOf(18.5204))
                .longitude(BigDecimal.valueOf(73.8567))
                .foodType(FoodType.PURE_VEG)
                .monthlyPrice(BigDecimal.valueOf(3000))
                .dailyPrice(BigDecimal.valueOf(100))
                .owner(ownerA)
                .status(MessStatus.APPROVED)
                .operatingStatus(OperatingStatus.OPEN)
                .build());

        // Owner B & Mess B
        ownerB = userRepository.save(User.builder()
                .name("Vikram Kadam")
                .email("owner.daily.b@test.com")
                .password(passwordEncoder.encode("Password@123"))
                .role(Role.ROLE_MESS_OWNER)
                .status(UserStatus.ACTIVE)
                .phone("+91 98111 00002")
                .build());
        ownerBToken = "Bearer " + jwtTokenProvider.generateToken(ownerB);

        messB = messRepository.save(Mess.builder()
                .name("Sahyadri Dining Hall")
                .description("Special Kolhapuri Misal and Feast")
                .address("JM Road, Deccan")
                .area("Deccan")
                .city("Pune")
                .pincode("411004")
                .latitude(BigDecimal.valueOf(18.5167))
                .longitude(BigDecimal.valueOf(73.8417))
                .foodType(FoodType.VEG_AND_NON_VEG)
                .monthlyPrice(BigDecimal.valueOf(3500))
                .dailyPrice(BigDecimal.valueOf(120))
                .owner(ownerB)
                .status(MessStatus.APPROVED)
                .operatingStatus(OperatingStatus.OPEN)
                .build());

        // Student
        student = userRepository.save(User.builder()
                .name("Sanket More")
                .email("student.daily@test.com")
                .password(passwordEncoder.encode("Password@123"))
                .role(Role.ROLE_STUDENT)
                .status(UserStatus.ACTIVE)
                .phone("+91 98111 00003")
                .college("COEP Pune")
                .build());
        studentToken = "Bearer " + jwtTokenProvider.generateToken(student);
    }

    @Test
    @DisplayName("Case 1: An owner can create a daily meal menu (Monday breakfast & lunch)")
    void testOwnerCanCreateDailyMealMenu() throws Exception {
        UpdateDailyMealRequest breakfastReq = UpdateDailyMealRequest.builder()
                .messId(messA.getId())
                .dayOfWeek("Monday")
                .mealType(MealType.BREAKFAST)
                .dishes("Poha, Sprouts, Masala Tea")
                .build();

        mockMvc.perform(put("/api/owner/mess/daily-menu")
                        .header(HttpHeaders.AUTHORIZATION, ownerAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(breakfastReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.breakfast", is("Poha, Sprouts, Masala Tea")));

        UpdateDailyMealRequest lunchReq = UpdateDailyMealRequest.builder()
                .messId(messA.getId())
                .dayOfWeek("Monday")
                .mealType(MealType.LUNCH)
                .dishes("Dal Makhani, Shahi Paneer, Jeera Rice, Hot Phulkas")
                .build();

        mockMvc.perform(put("/api/owner/mess/daily-menu")
                        .header(HttpHeaders.AUTHORIZATION, ownerAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(lunchReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.breakfast", is("Poha, Sprouts, Masala Tea")))
                .andExpect(jsonPath("$.data.lunch", is("Dal Makhani, Shahi Paneer, Jeera Rice, Hot Phulkas")));

        List<MenuItem> items = menuItemRepository.findByMessId(messA.getId());
        assertThat(items).hasSize(2);
    }

    @Test
    @DisplayName("Case 2: An owner can update an existing daily meal menu without duplicate records")
    void testOwnerCanUpdateExistingDailyMealMenu() throws Exception {
        // Initial create
        UpdateDailyMealRequest initialReq = UpdateDailyMealRequest.builder()
                .messId(messA.getId())
                .dayOfWeek("MONDAY")
                .mealType(MealType.LUNCH)
                .dishes("Chole Bhature")
                .build();

        mockMvc.perform(put("/api/owner/mess/daily-menu")
                        .header(HttpHeaders.AUTHORIZATION, ownerAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(initialReq)))
                .andExpect(status().isOk());

        // Update the lunch
        UpdateDailyMealRequest updatedReq = UpdateDailyMealRequest.builder()
                .messId(messA.getId())
                .dayOfWeek("MONDAY")
                .mealType(MealType.LUNCH)
                .dishes("Paneer Masala, Dal Tadka, Steamed Rice, 4 Phulkas")
                .build();

        mockMvc.perform(put("/api/owner/mess/daily-menu")
                        .header(HttpHeaders.AUTHORIZATION, ownerAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.lunch", is("Paneer Masala, Dal Tadka, Steamed Rice, 4 Phulkas")));

        // Verify only 1 record exists in repository
        List<MenuItem> items = menuItemRepository.findByMessIdAndDayOfWeekIgnoreCase(messA.getId(), "MONDAY");
        assertThat(items).hasSize(1);
        assertThat(items.get(0).getName()).isEqualTo("Paneer Masala, Dal Tadka, Steamed Rice, 4 Phulkas");
    }

    @Test
    @DisplayName("Case 3: A student can retrieve the correct menu for a selected mess and day")
    void testStudentRetrievesDailyMenu() throws Exception {
        // Create Tuesday dinner for Mess A
        menuItemRepository.save(MenuItem.builder()
                .mess(messA)
                .dayOfWeek("TUESDAY")
                .mealType(MealType.DINNER)
                .name("Shev Bhaji, Dal Fry, Jeera Rice, Chapati")
                .isAvailable(true)
                .build());

        mockMvc.perform(get("/api/messes/" + messA.getId() + "/daily-menu?day=TUESDAY")
                        .header(HttpHeaders.AUTHORIZATION, studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.messId", is(messA.getId().intValue())))
                .andExpect(jsonPath("$.data.dayOfWeek", is("TUESDAY")))
                .andExpect(jsonPath("$.data.dinner", is("Shev Bhaji, Dal Fry, Jeera Rice, Chapati")));
    }

    @Test
    @DisplayName("Case 4: Two messes return different menus when their saved data differs")
    void testTwoMessesReturnDifferentMenus() throws Exception {
        // Mess A Wednesday lunch
        menuItemRepository.save(MenuItem.builder()
                .mess(messA)
                .dayOfWeek("WEDNESDAY")
                .mealType(MealType.LUNCH)
                .name("Kadhi Pakora, Aloo Jeera, Rice, Phulkas")
                .isAvailable(true)
                .build());

        // Mess B Wednesday lunch
        menuItemRepository.save(MenuItem.builder()
                .mess(messB)
                .dayOfWeek("WEDNESDAY")
                .mealType(MealType.LUNCH)
                .name("Chicken Curry, Kolhapuri Tambda Rassa, Bhakri")
                .isAvailable(true)
                .build());

        // Mess A response
        mockMvc.perform(get("/api/messes/" + messA.getId() + "/daily-menu?day=WEDNESDAY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.lunch", is("Kadhi Pakora, Aloo Jeera, Rice, Phulkas")));

        // Mess B response
        mockMvc.perform(get("/api/messes/" + messB.getId() + "/daily-menu?day=WEDNESDAY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.lunch", is("Chicken Curry, Kolhapuri Tambda Rassa, Bhakri")));
    }

    @Test
    @DisplayName("Case 5: An empty meal returns null/empty without inventing or borrowing dishes")
    void testEmptyMealReturnsNull() throws Exception {
        // Mess A has only breakfast on Thursday
        menuItemRepository.save(MenuItem.builder()
                .mess(messA)
                .dayOfWeek("THURSDAY")
                .mealType(MealType.BREAKFAST)
                .name("Idli Sambhar")
                .isAvailable(true)
                .build());

        mockMvc.perform(get("/api/messes/" + messA.getId() + "/daily-menu?day=THURSDAY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.breakfast", is("Idli Sambhar")))
                .andExpect(jsonPath("$.data.lunch").value(nullValue()))
                .andExpect(jsonPath("$.data.dinner").value(nullValue()));
    }

    @Test
    @DisplayName("Case 6: An owner cannot update a menu for an unrelated mess -> 403 Forbidden")
    void testOwnerCannotUpdateUnrelatedMessMenu() throws Exception {
        UpdateDailyMealRequest request = UpdateDailyMealRequest.builder()
                .messId(messB.getId()) // Owner A attempts to update Mess B
                .dayOfWeek("FRIDAY")
                .mealType(MealType.LUNCH)
                .dishes("Hacked dishes")
                .build();

        mockMvc.perform(put("/api/owner/mess/daily-menu")
                        .header(HttpHeaders.AUTHORIZATION, ownerAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Case 7: Invalid day or blank meal is rejected with 400 Bad Request")
    void testInvalidDayOrDishesRejected() throws Exception {
        UpdateDailyMealRequest invalidDayReq = UpdateDailyMealRequest.builder()
                .messId(messA.getId())
                .dayOfWeek("INVALID_DAY")
                .mealType(MealType.LUNCH)
                .dishes("Valid Dishes")
                .build();

        mockMvc.perform(put("/api/owner/mess/daily-menu")
                        .header(HttpHeaders.AUTHORIZATION, ownerAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidDayReq)))
                .andExpect(status().isBadRequest());

        UpdateDailyMealRequest blankDishesReq = UpdateDailyMealRequest.builder()
                .messId(messA.getId())
                .dayOfWeek("FRIDAY")
                .mealType(MealType.LUNCH)
                .dishes("   ")
                .build();

        mockMvc.perform(put("/api/owner/mess/daily-menu")
                        .header(HttpHeaders.AUTHORIZATION, ownerAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(blankDishesReq)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Case 8: Menu changes persist and are returned correctly after a fresh retrieval")
    void testMenuChangesPersistAcrossRetrievals() throws Exception {
        UpdateDailyMealRequest saturdayDinner = UpdateDailyMealRequest.builder()
                .messId(messA.getId())
                .dayOfWeek("SATURDAY")
                .mealType(MealType.DINNER)
                .dishes("Pav Bhaji, Pulao, Gulab Jamun")
                .build();

        mockMvc.perform(put("/api/owner/mess/daily-menu")
                        .header(HttpHeaders.AUTHORIZATION, ownerAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(saturdayDinner)))
                .andExpect(status().isOk());

        // Perform clean GET by unauthenticated public/student
        mockMvc.perform(get("/api/messes/" + messA.getId() + "/daily-menu?day=SATURDAY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.dinner", is("Pav Bhaji, Pulao, Gulab Jamun")));
    }

    @Test
    @DisplayName("Case 9: Public weekly menu endpoint returns all 7 days for the requested mess")
    void testWeeklyMenuReturnsFullSchedule() throws Exception {
        mockMvc.perform(get("/api/messes/" + messA.getId() + "/weekly-menu"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.messId", is(messA.getId().intValue())))
                .andExpect(jsonPath("$.data.weeklySchedule", hasSize(7)))
                .andExpect(jsonPath("$.data.scheduleByDay.MONDAY").exists())
                .andExpect(jsonPath("$.data.scheduleByDay.SUNDAY").exists());
    }
}
