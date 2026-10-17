package com.messmap.modules.user.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.messmap.modules.user.dto.StudentProfileUpdateRequest;
import com.messmap.modules.user.entity.DietaryPreference;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class StudentProfileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User studentUser;
    private String studentToken;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();

        studentUser = User.builder()
                .name("Anushka Pawar")
                .email("anushka.profile@messmap.com")
                .password(passwordEncoder.encode("secretPassword123"))
                .phone("+91 9876543210")
                .college("COEP Technological University")
                .hostel("Block C, Room 204")
                .dietaryPreference(DietaryPreference.VEG)
                .role(Role.ROLE_STUDENT)
                .status(UserStatus.ACTIVE)
                .avatarUrl("https://example.com/avatar.jpg")
                .build();
        studentUser = userRepository.save(studentUser);

        studentToken = "Bearer " + jwtTokenProvider.generateToken(studentUser);
    }

    @Test
    @DisplayName("GET /api/student/profile without token should return HTTP 401 Unauthorized")
    void testGetProfileUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/student/profile")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.status", is(401)))
                .andExpect(jsonPath("$.message", containsString("Full authentication is required")));
    }

    @Test
    @DisplayName("GET /api/student/profile with valid token should return student profile")
    void testGetProfileAuthenticated() throws Exception {
        mockMvc.perform(get("/api/student/profile")
                        .header(HttpHeaders.AUTHORIZATION, studentToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.id", is(studentUser.getId().intValue())))
                .andExpect(jsonPath("$.data.name", is("Anushka Pawar")))
                .andExpect(jsonPath("$.data.email", is("anushka.profile@messmap.com")))
                .andExpect(jsonPath("$.data.phone", is("+91 9876543210")))
                .andExpect(jsonPath("$.data.college", is("COEP Technological University")))
                .andExpect(jsonPath("$.data.dietaryPreference", is("VEG")))
                .andExpect(jsonPath("$.data.role", is("ROLE_STUDENT")))
                .andExpect(jsonPath("$.data.password").doesNotExist());
    }

    @Test
    @DisplayName("GET /api/v1/student/profile route alias should function identically")
    void testGetProfileAliasRoute() throws Exception {
        mockMvc.perform(get("/api/v1/student/profile")
                        .header(HttpHeaders.AUTHORIZATION, studentToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.email", is("anushka.profile@messmap.com")));
    }

    @Test
    @DisplayName("PUT /api/student/profile should update permitted fields and persist to database")
    void testUpdateProfileSuccess() throws Exception {
        StudentProfileUpdateRequest updateRequest = StudentProfileUpdateRequest.builder()
                .name("Anushka S. Pawar")
                .phone("+91 9988776655")
                .college("Pune University Affiliated College")
                .hostel("Campus Hostel 3")
                .dietaryPreference(DietaryPreference.BOTH)
                .avatarUrl("https://example.com/new-avatar.png")
                .build();

        mockMvc.perform(put("/api/student/profile")
                        .header(HttpHeaders.AUTHORIZATION, studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Student profile updated successfully")))
                .andExpect(jsonPath("$.data.name", is("Anushka S. Pawar")))
                .andExpect(jsonPath("$.data.phone", is("+91 9988776655")))
                .andExpect(jsonPath("$.data.college", is("Pune University Affiliated College")))
                .andExpect(jsonPath("$.data.dietaryPreference", is("BOTH")))
                .andExpect(jsonPath("$.data.avatarUrl", is("https://example.com/new-avatar.png")));

        // Verify persistence in database
        User updated = userRepository.findById(studentUser.getId()).orElseThrow();
        assertThat(updated.getName()).isEqualTo("Anushka S. Pawar");
        assertThat(updated.getPhone()).isEqualTo("+91 9988776655");
        assertThat(updated.getCollege()).isEqualTo("Pune University Affiliated College");
        assertThat(updated.getDietaryPreference()).isEqualTo(DietaryPreference.BOTH);
    }

    @Test
    @DisplayName("PUT /api/v1/student/profile route alias should function identically")
    void testUpdateProfileAliasRoute() throws Exception {
        StudentProfileUpdateRequest updateRequest = StudentProfileUpdateRequest.builder()
                .dietaryPreference(DietaryPreference.NON_VEG)
                .build();

        mockMvc.perform(put("/api/v1/student/profile")
                        .header(HttpHeaders.AUTHORIZATION, studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.dietaryPreference", is("NON_VEG")));
    }

    @Test
    @DisplayName("PUT /api/student/profile should prevent tampering with protected fields (role, email, status, id)")
    void testProtectedFieldsCannotBeTampered() throws Exception {
        // Attempt sending raw json with protected fields
        String payloadWithTamperedFields = """
                {
                    "name": "Legitimate Name Update",
                    "email": "hacked@evil.com",
                    "role": "ROLE_ADMIN",
                    "status": "SUSPENDED",
                    "id": 99999
                }
                """;

        mockMvc.perform(put("/api/student/profile")
                        .header(HttpHeaders.AUTHORIZATION, studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payloadWithTamperedFields))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name", is("Legitimate Name Update")))
                .andExpect(jsonPath("$.data.email", is("anushka.profile@messmap.com")))
                .andExpect(jsonPath("$.data.role", is("ROLE_STUDENT")))
                .andExpect(jsonPath("$.data.status", is("ACTIVE")))
                .andExpect(jsonPath("$.data.id", is(studentUser.getId().intValue())));

        User persisted = userRepository.findById(studentUser.getId()).orElseThrow();
        assertThat(persisted.getEmail()).isEqualTo("anushka.profile@messmap.com");
        assertThat(persisted.getRole()).isEqualTo(Role.ROLE_STUDENT);
        assertThat(persisted.getStatus()).isEqualTo(UserStatus.ACTIVE);
    }
}
