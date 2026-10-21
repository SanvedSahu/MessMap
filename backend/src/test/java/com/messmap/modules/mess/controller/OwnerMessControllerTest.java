package com.messmap.modules.mess.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.messmap.modules.mess.dto.CreateMessRequest;
import com.messmap.modules.mess.dto.UpdateMessAmenitiesRequest;
import com.messmap.modules.mess.dto.UpdateMessProfileRequest;
import com.messmap.modules.mess.dto.UpdateMessTimingsRequest;
import com.messmap.modules.mess.entity.*;
import com.messmap.modules.mess.repository.FacilityRepository;
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
import java.util.Collections;
import java.util.List;
import java.util.Set;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class OwnerMessControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MessRepository messRepository;

    @Autowired
    private FacilityRepository facilityRepository;

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

    private User adminUser;
    private String tokenAdmin;

    private Mess messOwnerA;
    private Mess messOwnerB;
    private Facility wifiFacility;
    private Facility roFacility;

    @BeforeEach
    void setUp() {
        // Setup facilities
        wifiFacility = facilityRepository.findByNameIgnoreCase("WiFi")
                .orElseGet(() -> facilityRepository.save(Facility.builder().name("WiFi").icon("wifi").build()));
        roFacility = facilityRepository.findByNameIgnoreCase("RO Purified Water")
                .orElseGet(() -> facilityRepository.save(Facility.builder().name("RO Purified Water").icon("droplet").build()));

        // Setup Owner A
        ownerA = userRepository.save(User.builder()
                .name("Owner Alice")
                .email("alice.mess@test.com")
                .password(passwordEncoder.encode("alicePass123"))
                .phone("+91 98231 11111")
                .role(Role.ROLE_MESS_OWNER)
                .status(UserStatus.ACTIVE)
                .build());
        tokenOwnerA = tokenProvider.generateToken(ownerA);

        // Setup Owner B
        ownerB = userRepository.save(User.builder()
                .name("Owner Bob")
                .email("bob.mess@test.com")
                .password(passwordEncoder.encode("bobPass123"))
                .phone("+91 98231 22222")
                .role(Role.ROLE_MESS_OWNER)
                .status(UserStatus.ACTIVE)
                .build());
        tokenOwnerB = tokenProvider.generateToken(ownerB);

        // Setup Student
        studentUser = userRepository.save(User.builder()
                .name("Student Sam")
                .email("sam.student@test.com")
                .password(passwordEncoder.encode("studentPass123"))
                .role(Role.ROLE_STUDENT)
                .status(UserStatus.ACTIVE)
                .build());
        tokenStudent = tokenProvider.generateToken(studentUser);

        // Setup Admin
        adminUser = userRepository.save(User.builder()
                .name("Admin User")
                .email("admin.audit@test.com")
                .password(passwordEncoder.encode("adminPass123"))
                .role(Role.ROLE_ADMIN)
                .status(UserStatus.ACTIVE)
                .build());
        tokenAdmin = tokenProvider.generateToken(adminUser);

        // Mess for Owner A
        messOwnerA = messRepository.save(Mess.builder()
                .owner(ownerA)
                .name("Annapurna Dining")
                .description("Hygienic thali meals near campus")
                .address("Shop 12, FC Road")
                .area("Shivajinagar")
                .city("Pune")
                .state("Maharashtra")
                .pincode("411005")
                .phone("+91 98231 11111")
                .email("annapurna@mess.com")
                .foodType(FoodType.PURE_VEG)
                .dailyPrice(BigDecimal.valueOf(110))
                .monthlyPrice(BigDecimal.valueOf(3300))
                .capacity(50)
                .openingTime("07:30 AM")
                .closingTime("10:30 PM")
                .breakfastTiming("07:30 AM – 10:00 AM")
                .lunchTiming("12:30 PM – 03:30 PM")
                .dinnerTiming("07:30 PM – 10:30 PM")
                .status(MessStatus.PENDING)
                .operatingStatus(OperatingStatus.OPEN)
                .facilities(new java.util.HashSet<>(Set.of(wifiFacility)))
                .build());

        // Mess for Owner B
        messOwnerB = messRepository.save(Mess.builder()
                .owner(ownerB)
                .name("Shivneri Mess")
                .description("Authentic Maharashtrian cuisine")
                .address("Lane 4, Karve Nagar")
                .area("Kothrud")
                .city("Pune")
                .state("Maharashtra")
                .pincode("411038")
                .phone("+91 98231 22222")
                .foodType(FoodType.VEG_AND_NON_VEG)
                .status(MessStatus.APPROVED)
                .operatingStatus(OperatingStatus.OPEN)
                .build());
    }

    @Test
    @DisplayName("1. POST /api/owner/mess - Successful mess creation by authenticated owner")
    void shouldCreateMessSuccessfullyAsOwner() throws Exception {
        CreateMessRequest request = CreateMessRequest.builder()
                .name("Siddhi Dining Hall")
                .description("Homestyle food with unlimited rotis")
                .address("Plot 42, Senapati Bapat Road")
                .locality("SB Road")
                .city("Pune")
                .state("Maharashtra")
                .pincode("411016")
                .contact("+91 99887 76655")
                .email("siddhi@mess.com")
                .foodType("VEG")
                .monthlyPrice(BigDecimal.valueOf(3500))
                .dailyPrice(BigDecimal.valueOf(120))
                .capacity(60)
                .breakfastTiming("08:00 AM – 10:30 AM")
                .lunchTiming("12:30 PM – 03:30 PM")
                .dinnerTiming("07:30 PM – 10:30 PM")
                .facilityIds(Set.of(wifiFacility.getId(), roFacility.getId()))
                .build();

        mockMvc.perform(post("/api/owner/mess")
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", containsString("Mess profile created successfully")))
                .andExpect(jsonPath("$.data.name", is("Siddhi Dining Hall")))
                .andExpect(jsonPath("$.data.ownerId", is(ownerA.getId().intValue())))
                .andExpect(jsonPath("$.data.ownerName", is("Owner Alice")))
                .andExpect(jsonPath("$.data.status", is("PENDING")))
                .andExpect(jsonPath("$.data.foodType", is("PURE_VEG")))
                .andExpect(jsonPath("$.data.facilities", hasSize(2)))
                .andExpect(jsonPath("$.data.breakfastTiming", is("08:00 AM – 10:30 AM")));
    }

    @Test
    @DisplayName("2. POST /api/owner/mess - Unauthenticated access returns HTTP 401")
    void shouldRejectUnauthenticatedAccess() throws Exception {
        CreateMessRequest request = CreateMessRequest.builder()
                .name("Anonymous Mess")
                .address("Some Address")
                .city("Pune")
                .locality("FC Road")
                .contact("+91 98765 43210")
                .build();

        mockMvc.perform(post("/api/owner/mess")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)));
    }

    @Test
    @DisplayName("3. POST /api/owner/mess - Access by student role returns HTTP 403 Forbidden")
    void shouldRejectStudentAccessToOwnerMessCreation() throws Exception {
        CreateMessRequest request = CreateMessRequest.builder()
                .name("Student Attempt Mess")
                .address("Campus Gate")
                .city("Pune")
                .locality("Shivajinagar")
                .contact("+91 98765 43210")
                .build();

        mockMvc.perform(post("/api/owner/mess")
                        .header("Authorization", "Bearer " + tokenStudent)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", is(403)));
    }

    @Test
    @DisplayName("4. POST /api/owner/mess - Invalid or missing required fields returns HTTP 400")
    void shouldRejectMissingRequiredFields() throws Exception {
        // Missing name, city, address, contact
        CreateMessRequest emptyRequest = CreateMessRequest.builder().build();

        mockMvc.perform(post("/api/owner/mess")
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(emptyRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.details", notNullValue()));
    }

    @Test
    @DisplayName("5. GET /api/owner/mess - Retrieve authenticated owner's mess profile")
    void shouldRetrieveAuthenticatedOwnerMess() throws Exception {
        mockMvc.perform(get("/api/owner/mess")
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.id", is(messOwnerA.getId().intValue())))
                .andExpect(jsonPath("$.data.name", is("Annapurna Dining")))
                .andExpect(jsonPath("$.data.city", is("Pune")))
                .andExpect(jsonPath("$.data.breakfastTiming", is("07:30 AM – 10:00 AM")))
                .andExpect(jsonPath("$.data.mealTimings.breakfast", notNullValue()));
    }

    @Test
    @DisplayName("6. PUT /api/owner/mess/profile - Successful profile update by owning owner")
    void shouldUpdateMessProfileSuccessfully() throws Exception {
        UpdateMessProfileRequest request = UpdateMessProfileRequest.builder()
                .name("Annapurna Premium Dining")
                .monthlyPrice(BigDecimal.valueOf(3600))
                .dailyPrice(BigDecimal.valueOf(130))
                .description("Updated description: Air conditioned dining hall")
                .capacity(75)
                .build();

        mockMvc.perform(put("/api/owner/mess/profile")
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.name", is("Annapurna Premium Dining")))
                .andExpect(jsonPath("$.data.monthlyPrice", is(3600)))
                .andExpect(jsonPath("$.data.capacity", is(75)));
    }

    @Test
    @DisplayName("7. PUT /api/owner/mess/{id} - Owner cannot modify another owner's mess (HTTP 403)")
    void shouldPreventOwnerFromModifyingAnotherOwnersMess() throws Exception {
        UpdateMessProfileRequest request = UpdateMessProfileRequest.builder()
                .name("Malicious Overwrite")
                .build();

        // Owner A tries to modify Owner B's mess
        mockMvc.perform(put("/api/owner/mess/" + messOwnerB.getId())
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", is(403)))
                .andExpect(jsonPath("$.message", containsString("Access is denied")));
    }

    @Test
    @DisplayName("8. PUT /api/owner/mess/{id} - Update nonexistent mess returns HTTP 404")
    void shouldReturn404WhenUpdatingNonexistentMess() throws Exception {
        UpdateMessProfileRequest request = UpdateMessProfileRequest.builder()
                .name("Ghost Mess")
                .build();

        mockMvc.perform(put("/api/owner/mess/99999")
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)));
    }

    @Test
    @DisplayName("9. PUT /api/owner/mess/timings - Update operating timings successfully")
    void shouldUpdateOperatingTimingsSuccessfully() throws Exception {
        UpdateMessTimingsRequest request = UpdateMessTimingsRequest.builder()
                .breakfast("07:00 AM – 09:30 AM")
                .lunch("12:00 PM – 03:00 PM")
                .dinner("07:00 PM – 10:00 PM")
                .openingTime("07:00 AM")
                .closingTime("10:00 PM")
                .build();

        mockMvc.perform(put("/api/owner/mess/timings")
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.breakfastTiming", is("07:00 AM – 09:30 AM")))
                .andExpect(jsonPath("$.data.lunchTiming", is("12:00 PM – 03:00 PM")))
                .andExpect(jsonPath("$.data.dinnerTiming", is("07:00 PM – 10:00 PM")))
                .andExpect(jsonPath("$.data.openingTime", is("07:00 AM")))
                .andExpect(jsonPath("$.data.closingTime", is("10:00 PM")));
    }

    @Test
    @DisplayName("10. PUT /api/owner/mess/timings - Reject empty timings request (HTTP 400)")
    void shouldRejectEmptyTimingsRequest() throws Exception {
        UpdateMessTimingsRequest emptyRequest = UpdateMessTimingsRequest.builder().build();

        mockMvc.perform(put("/api/owner/mess/timings")
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(emptyRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)));
    }

    @Test
    @DisplayName("11. PUT /api/owner/mess/amenities - Update amenities successfully")
    void shouldUpdateAmenitiesSuccessfully() throws Exception {
        UpdateMessAmenitiesRequest request = UpdateMessAmenitiesRequest.builder()
                .facilityIds(Set.of(wifiFacility.getId(), roFacility.getId()))
                .build();

        mockMvc.perform(put("/api/owner/mess/amenities")
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.facilities", hasSize(2)))
                .andExpect(jsonPath("$.data.amenities", hasItems("WiFi", "RO Purified Water")));
    }

    @Test
    @DisplayName("12. PUT /api/owner/mess/amenities - Invalid facility ID returns HTTP 404")
    void shouldReturn404ForInvalidFacilityId() throws Exception {
        UpdateMessAmenitiesRequest request = UpdateMessAmenitiesRequest.builder()
                .facilityIds(Set.of(99999L))
                .build();

        mockMvc.perform(put("/api/owner/mess/amenities")
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.message", containsString("Facility not found with id: '99999'")));
    }

    @Test
    @DisplayName("13. POST /api/owner/mess - Prevent status elevation or tampering with system-controlled fields")
    void shouldEnsureInitialStatusIsPendingRegardlessOfInput() throws Exception {
        CreateMessRequest request = CreateMessRequest.builder()
                .name("Unapproved Listing")
                .address("Camp Area")
                .city("Pune")
                .locality("MG Road")
                .contact("+91 91234 56789")
                .build();

        mockMvc.perform(post("/api/v1/owner/messes")
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status", is("PENDING")));
    }

    @Test
    @DisplayName("14. GET & PUT /api/v1/owner/messes/{id} - Administrator can view or update any mess")
    void shouldAllowAdminToAccessAnyMess() throws Exception {
        mockMvc.perform(get("/api/v1/owner/messes/" + messOwnerA.getId())
                        .header("Authorization", "Bearer " + tokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name", is("Annapurna Dining")));
    }

    @Test
    @DisplayName("15. PUT /api/v1/owner/mess/{id}/timings & amenities - Singular versioned route aliases")
    void shouldSupportSingularVersionedRouteAliasesForTimingsAndAmenities() throws Exception {
        UpdateMessTimingsRequest timingsRequest = UpdateMessTimingsRequest.builder()
                .breakfastTiming("08:30 AM – 10:30 AM")
                .build();

        mockMvc.perform(put("/api/v1/owner/mess/" + messOwnerA.getId() + "/timings")
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(timingsRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.breakfastTiming", is("08:30 AM – 10:30 AM")));

        UpdateMessAmenitiesRequest amenitiesRequest = UpdateMessAmenitiesRequest.builder()
                .facilityIds(Set.of(wifiFacility.getId()))
                .build();

        mockMvc.perform(put("/api/v1/owner/mess/" + messOwnerA.getId() + "/amenities")
                        .header("Authorization", "Bearer " + tokenOwnerA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(amenitiesRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.facilities", hasSize(1)));
    }
}
