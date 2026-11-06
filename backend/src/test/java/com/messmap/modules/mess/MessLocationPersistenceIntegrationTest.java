package com.messmap.modules.mess;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.messmap.modules.mess.dto.CreateMessRequest;
import com.messmap.modules.mess.entity.Mess;
import com.messmap.modules.mess.entity.MessStatus;
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
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class MessLocationPersistenceIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MessRepository messRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    private User owner;
    private String ownerToken;

    @BeforeEach
    void setUp() {
        owner = userRepository.save(User.builder()
                .name("Location Test Owner")
                .email("location.owner." + System.nanoTime() + "@test.com")
                .password(passwordEncoder.encode("SecurePass123!"))
                .role(Role.ROLE_MESS_OWNER)
                .status(UserStatus.ACTIVE)
                .phone("9876543210")
                .build());
        ownerToken = tokenProvider.generateToken(owner);
    }

    @Test
    @DisplayName("Owner creates mess with valid coordinates: coordinates persist in DB and appear in nearby search")
    void testCreateMess_PersistsCoordinates_AndResolvesInNearbySearch() throws Exception {
        // 1. Owner registers mess with coordinates near Fergusson College (18.523600, 73.841800)
        BigDecimal expectedLat = new BigDecimal("18.523600");
        BigDecimal expectedLng = new BigDecimal("73.841800");

        CreateMessRequest createRequest = CreateMessRequest.builder()
                .name("FC Road Dining Hall")
                .description("Authentic student meals near Fergusson College")
                .address("Shop 12, FC Road, Shivajinagar")
                .area("Shivajinagar")
                .city("Pune")
                .pincode("411004")
                .phone("9876543210")
                .foodType("VEG")
                .dailyPrice(BigDecimal.valueOf(110))
                .monthlyPrice(BigDecimal.valueOf(3200))
                .latitude(expectedLat)
                .longitude(expectedLng)
                .build();

        MvcResult result = mockMvc.perform(post("/api/v1/owner/mess")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.latitude").value(18.5236))
                .andExpect(jsonPath("$.data.longitude").value(73.8418))
                .andExpect(jsonPath("$.data.area").value("Shivajinagar"))
                .andExpect(jsonPath("$.data.pincode").value("411004"))
                .andReturn();

        long createdMessId = objectMapper.readTree(result.getResponse().getContentAsString())
                .path("data").path("id").asLong();

        // 2. Direct database verification
        Mess persistedMess = messRepository.findById(createdMessId).orElseThrow();
        assertThat(persistedMess.getLatitude()).isEqualByComparingTo(expectedLat);
        assertThat(persistedMess.getLongitude()).isEqualByComparingTo(expectedLng);
        assertThat(persistedMess.getArea()).isEqualTo("Shivajinagar");
        assertThat(persistedMess.getPincode()).isEqualTo("411004");
        assertThat(persistedMess.getAddress()).isEqualTo("Shop 12, FC Road, Shivajinagar");

        // 3. Mark approved so it appears in public student nearby discovery
        persistedMess.setStatus(MessStatus.APPROVED);
        messRepository.save(persistedMess);

        // 4. Student searches nearby from COEP (18.5298, 73.8565) within 3.0 km radius
        // Haversine distance between FC Road and COEP is ~ 1.7 km -> should be found!
        mockMvc.perform(get("/api/v1/messes/nearby")
                        .param("latitude", "18.5298")
                        .param("longitude", "73.8565")
                        .param("radiusKm", "3.0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data[?(@.id == " + createdMessId + ")].name")
                        .value(hasItem("FC Road Dining Hall")))
                .andExpect(jsonPath("$.data[?(@.id == " + createdMessId + ")].distanceKm")
                        .value(hasItem(lessThan(3.0))));

        // 5. Searching with very small radius (0.2 km) from COEP excludes the FC Road mess
        mockMvc.perform(get("/api/v1/messes/nearby")
                        .param("latitude", "18.5298")
                        .param("longitude", "73.8565")
                        .param("radiusKm", "0.2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[?(@.id == " + createdMessId + ")]").doesNotExist());
    }

    @Test
    @DisplayName("Nearby search rejects invalid coordinates (out of range, NaN) with 400 Bad Request")
    void testNearbySearch_RejectsInvalidCoordinates() throws Exception {
        // Latitude > 90
        mockMvc.perform(get("/api/v1/messes/nearby")
                        .param("latitude", "95.0")
                        .param("longitude", "73.8565"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(containsString("Valid latitude")));

        // Longitude < -180
        mockMvc.perform(get("/api/v1/messes/nearby")
                        .param("latitude", "18.5204")
                        .param("longitude", "-185.0"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(containsString("Valid longitude")));

        // Missing longitude
        mockMvc.perform(get("/api/v1/messes/nearby")
                        .param("latitude", "18.5204"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }
}
