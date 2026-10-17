package com.messmap.modules.user.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.messmap.modules.user.dto.StudentLoginRequest;
import com.messmap.modules.user.dto.StudentRegisterRequest;
import com.messmap.modules.user.entity.DietaryPreference;
import com.messmap.modules.user.entity.Role;
import com.messmap.modules.user.entity.User;
import com.messmap.modules.user.entity.UserStatus;
import com.messmap.modules.user.repository.UserRepository;
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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class StudentAuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void cleanDatabase() {
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("POST /api/auth/student/register should register new student, return HTTP 201 and JWT token")
    void testRegisterStudentSuccess() throws Exception {
        StudentRegisterRequest request = StudentRegisterRequest.builder()
                .name("Anushka Pawar")
                .email("anushka.student@messmap.com")
                .password("securePass123")
                .phone("+91 9876543210")
                .college("COEP Pune")
                .hostel("Block A")
                .dietaryPreference(DietaryPreference.VEG)
                .build();

        mockMvc.perform(post("/api/auth/student/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Student registered successfully")))
                .andExpect(jsonPath("$.data.token", notNullValue()))
                .andExpect(jsonPath("$.data.tokenType", is("Bearer")))
                .andExpect(jsonPath("$.data.user.id", notNullValue()))
                .andExpect(jsonPath("$.data.user.name", is("Anushka Pawar")))
                .andExpect(jsonPath("$.data.user.email", is("anushka.student@messmap.com")))
                .andExpect(jsonPath("$.data.user.role", is("ROLE_STUDENT")))
                .andExpect(jsonPath("$.data.user.status", is("ACTIVE")))
                .andExpect(jsonPath("$.data.user.dietaryPreference", is("VEG")))
                .andExpect(jsonPath("$.data.user.password").doesNotExist());
    }

    @Test
    @DisplayName("POST /api/v1/auth/student/register route alias should function identically")
    void testRegisterStudentAliasRouteSuccess() throws Exception {
        StudentRegisterRequest request = StudentRegisterRequest.builder()
                .name("Rahul Patil")
                .email("rahul.patil@messmap.com")
                .password("securePass123")
                .phone("+91 9822334455")
                .college("COEP Pune")
                .hostel("Block B")
                .dietaryPreference(DietaryPreference.NON_VEG)
                .build();

        mockMvc.perform(post("/api/v1/auth/student/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.token", notNullValue()))
                .andExpect(jsonPath("$.data.user.email", is("rahul.patil@messmap.com")))
                .andExpect(jsonPath("$.data.user.role", is("ROLE_STUDENT")));
    }

    @Test
    @DisplayName("POST /api/auth/student/register with existing email should return HTTP 409 Conflict")
    void testRegisterDuplicateEmail() throws Exception {
        User existing = User.builder()
                .name("Existing Student")
                .email("duplicate@messmap.com")
                .password(passwordEncoder.encode("existingPass123"))
                .role(Role.ROLE_STUDENT)
                .status(UserStatus.ACTIVE)
                .build();
        userRepository.save(existing);

        StudentRegisterRequest request = StudentRegisterRequest.builder()
                .name("New Attempt")
                .email("duplicate@messmap.com")
                .password("password123")
                .build();

        mockMvc.perform(post("/api/auth/student/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.status", is(409)))
                .andExpect(jsonPath("$.message", containsString("User already exists with email: 'duplicate@messmap.com'")));
    }

    @Test
    @DisplayName("POST /api/auth/student/register with invalid data should return HTTP 400 Bad Request")
    void testRegisterValidationErrors() throws Exception {
        StudentRegisterRequest invalidRequest = StudentRegisterRequest.builder()
                .name("")
                .email("not-an-email")
                .password("123") // too short (< 6 chars)
                .build();

        mockMvc.perform(post("/api/auth/student/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.details", hasSize(greaterThanOrEqualTo(3))));
    }

    @Test
    @DisplayName("POST /api/auth/student/login should authenticate credentials and return HTTP 200 with JWT")
    void testLoginStudentSuccess() throws Exception {
        User student = User.builder()
                .name("Test Student")
                .email("login.student@messmap.com")
                .password(passwordEncoder.encode("correctPassword123"))
                .role(Role.ROLE_STUDENT)
                .status(UserStatus.ACTIVE)
                .dietaryPreference(DietaryPreference.BOTH)
                .build();
        userRepository.save(student);

        StudentLoginRequest loginReq = StudentLoginRequest.builder()
                .email("login.student@messmap.com")
                .password("correctPassword123")
                .build();

        mockMvc.perform(post("/api/auth/student/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Login successful")))
                .andExpect(jsonPath("$.data.token", notNullValue()))
                .andExpect(jsonPath("$.data.user.email", is("login.student@messmap.com")))
                .andExpect(jsonPath("$.data.user.role", is("ROLE_STUDENT")))
                .andExpect(jsonPath("$.data.user.password").doesNotExist());
    }

    @Test
    @DisplayName("POST /api/v1/auth/student/login route alias should function identically")
    void testLoginStudentAliasRouteSuccess() throws Exception {
        User student = User.builder()
                .name("Alias Student")
                .email("alias.student@messmap.com")
                .password(passwordEncoder.encode("correctPassword123"))
                .role(Role.ROLE_STUDENT)
                .status(UserStatus.ACTIVE)
                .build();
        userRepository.save(student);

        StudentLoginRequest loginReq = StudentLoginRequest.builder()
                .email("alias.student@messmap.com")
                .password("correctPassword123")
                .build();

        mockMvc.perform(post("/api/v1/auth/student/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.token", notNullValue()));
    }

    @Test
    @DisplayName("POST /api/auth/student/login with wrong password should return HTTP 401 with generic message")
    void testLoginWrongPassword() throws Exception {
        User student = User.builder()
                .name("Test Student")
                .email("student@messmap.com")
                .password(passwordEncoder.encode("correctPassword123"))
                .role(Role.ROLE_STUDENT)
                .status(UserStatus.ACTIVE)
                .build();
        userRepository.save(student);

        StudentLoginRequest loginReq = StudentLoginRequest.builder()
                .email("student@messmap.com")
                .password("wrongPassword")
                .build();

        mockMvc.perform(post("/api/auth/student/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Invalid email or password")));
    }

    @Test
    @DisplayName("POST /api/auth/student/login with unregistered email should return HTTP 401 with generic message")
    void testLoginUnregisteredEmail() throws Exception {
        StudentLoginRequest loginReq = StudentLoginRequest.builder()
                .email("nonexistent@messmap.com")
                .password("anyPassword123")
                .build();

        mockMvc.perform(post("/api/auth/student/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Invalid email or password")));
    }
}
