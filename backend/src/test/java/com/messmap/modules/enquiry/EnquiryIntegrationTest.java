package com.messmap.modules.enquiry;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.messmap.modules.enquiry.dto.CreateEnquiryRequest;
import com.messmap.modules.enquiry.dto.ReplyEnquiryRequest;
import com.messmap.modules.enquiry.entity.Enquiry;
import com.messmap.modules.enquiry.entity.EnquiryStatus;
import com.messmap.modules.enquiry.repository.EnquiryRepository;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class EnquiryIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MessRepository messRepository;

    @Autowired
    private EnquiryRepository enquiryRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User student1;
    private String student1Token;

    private User student2;
    private String student2Token;

    private User ownerA;
    private String ownerAToken;

    private User ownerB;
    private String ownerBToken;

    private Mess messA;
    private Mess messB;

    @BeforeEach
    void setUp() {
        enquiryRepository.deleteAll();

        // Student 1
        student1 = userRepository.save(User.builder()
                .name("Aditya Sharma")
                .email("aditya.sharma@test.com")
                .password(passwordEncoder.encode("Password@123"))
                .role(Role.ROLE_STUDENT)
                .status(UserStatus.ACTIVE)
                .phone("+91 98111 22233")
                .college("COEP Pune")
                .build());
        student1Token = "Bearer " + jwtTokenProvider.generateToken(student1);

        // Student 2
        student2 = userRepository.save(User.builder()
                .name("Pooja Nair")
                .email("pooja.nair@test.com")
                .password(passwordEncoder.encode("Password@123"))
                .role(Role.ROLE_STUDENT)
                .status(UserStatus.ACTIVE)
                .phone("+91 98444 55566")
                .college("PICT Pune")
                .build());
        student2Token = "Bearer " + jwtTokenProvider.generateToken(student2);

        // Owner A with Mess A
        ownerA = userRepository.save(User.builder()
                .name("Rajesh Sharma")
                .email("owner.a@test.com")
                .password(passwordEncoder.encode("Password@123"))
                .role(Role.ROLE_MESS_OWNER)
                .status(UserStatus.ACTIVE)
                .phone("+91 98222 33344")
                .build());
        ownerAToken = "Bearer " + jwtTokenProvider.generateToken(ownerA);

        messA = messRepository.save(Mess.builder()
                .name("Annapurna Mess")
                .description("Quality homely food")
                .address("123 FC Road")
                .area("Shivajinagar")
                .city("Pune")
                .pincode("411005")
                .latitude(BigDecimal.valueOf(18.5204))
                .longitude(BigDecimal.valueOf(73.8567))
                .foodType(FoodType.PURE_VEG)
                .monthlyPrice(BigDecimal.valueOf(3200))
                .dailyPrice(BigDecimal.valueOf(110))
                .owner(ownerA)
                .status(MessStatus.APPROVED)
                .operatingStatus(OperatingStatus.OPEN)
                .build());

        // Owner B with Mess B
        ownerB = userRepository.save(User.builder()
                .name("Suresh Joshi")
                .email("owner.b@test.com")
                .password(passwordEncoder.encode("Password@123"))
                .role(Role.ROLE_MESS_OWNER)
                .status(UserStatus.ACTIVE)
                .phone("+91 98777 88899")
                .build());
        ownerBToken = "Bearer " + jwtTokenProvider.generateToken(ownerB);

        messB = messRepository.save(Mess.builder()
                .name("Swami Samarth Mess")
                .description("Authentic Maharashtrian Thali")
                .address("456 JM Road")
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
    }

    @Test
    @DisplayName("Student submits enquiry to a mess -> 201 Created and persisted")
    void testStudentSubmitsEnquirySuccess() throws Exception {
        CreateEnquiryRequest request = CreateEnquiryRequest.builder()
                .messId(messA.getId())
                .category("Monthly Meal Plan")
                .message("Do you provide 2 installments for semester subscription?")
                .planType("Monthly (2 Meals)")
                .studentPhone("+91 98111 22233")
                .build();

        mockMvc.perform(post("/api/student/enquiries")
                        .header(HttpHeaders.AUTHORIZATION, student1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.messId", is(messA.getId().intValue())))
                .andExpect(jsonPath("$.data.messName", is("Annapurna Mess")))
                .andExpect(jsonPath("$.data.studentName", is("Aditya Sharma")))
                .andExpect(jsonPath("$.data.category", is("Monthly Meal Plan")))
                .andExpect(jsonPath("$.data.status", is("NEW")));

        assertThat(enquiryRepository.count()).isEqualTo(1);
        Enquiry saved = enquiryRepository.findAll().get(0);
        assertThat(saved.getMess().getId()).isEqualTo(messA.getId());
        assertThat(saved.getStudent().getId()).isEqualTo(student1.getId());
        assertThat(saved.getStatus()).isEqualTo(EnquiryStatus.NEW);
    }

    @Test
    @DisplayName("Student cannot submit enquiry without authentication")
    void testStudentSubmitsEnquiryUnauthorized() throws Exception {
        CreateEnquiryRequest request = CreateEnquiryRequest.builder()
                .messId(messA.getId())
                .category("Trial Meal")
                .message("Can I taste food?")
                .build();

        mockMvc.perform(post("/api/student/enquiries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Student enquiry with invalid mess id -> 404 Not Found")
    void testStudentSubmitsEnquiryInvalidMess() throws Exception {
        CreateEnquiryRequest request = CreateEnquiryRequest.builder()
                .messId(999999L)
                .category("Trial Meal")
                .message("Can I taste food?")
                .build();

        mockMvc.perform(post("/api/student/enquiries")
                        .header(HttpHeaders.AUTHORIZATION, student1Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Owner A sees enquiries for Mess A, but Owner B does not see Mess A's enquiries")
    void testOwnerEnquiryIsolation() throws Exception {
        // Create an enquiry for Mess A by Student 1
        Enquiry enqA = enquiryRepository.save(Enquiry.builder()
                .mess(messA)
                .student(student1)
                .studentName(student1.getName())
                .studentEmail(student1.getEmail())
                .category("Trial Meal")
                .message("Looking for 1 day trial")
                .studentPhone("+91 98111 22233")
                .status(EnquiryStatus.NEW)
                .build());

        // Create an enquiry for Mess B by Student 2
        Enquiry enqB = enquiryRepository.save(Enquiry.builder()
                .mess(messB)
                .student(student2)
                .studentName(student2.getName())
                .studentEmail(student2.getEmail())
                .category("Tiffin Service")
                .message("Need dinner tiffin delivered to hostel")
                .studentPhone("+91 98444 55566")
                .status(EnquiryStatus.NEW)
                .build());

        // Owner A requests their enquiries -> should see enqA only
        mockMvc.perform(get("/api/owner/mess/enquiries")
                        .header(HttpHeaders.AUTHORIZATION, ownerAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id", is(enqA.getId().intValue())))
                .andExpect(jsonPath("$.data[0].messName", is("Annapurna Mess")))
                .andExpect(jsonPath("$.data[0].studentName", is("Aditya Sharma")));

        // Owner B requests their enquiries -> should see enqB only
        mockMvc.perform(get("/api/owner/mess/enquiries")
                        .header(HttpHeaders.AUTHORIZATION, ownerBToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id", is(enqB.getId().intValue())))
                .andExpect(jsonPath("$.data[0].messName", is("Swami Samarth Mess")))
                .andExpect(jsonPath("$.data[0].studentName", is("Pooja Nair")));
    }

    @Test
    @DisplayName("Owner A replies to enquiry -> status updated to REPLIED with replyNotes")
    void testOwnerRepliesToEnquirySuccess() throws Exception {
        Enquiry enqA = enquiryRepository.save(Enquiry.builder()
                .mess(messA)
                .student(student1)
                .studentName(student1.getName())
                .category("Trial Meal")
                .message("Can I come today at 1 PM?")
                .status(EnquiryStatus.NEW)
                .build());

        ReplyEnquiryRequest replyRequest = ReplyEnquiryRequest.builder()
                .replyNotes("Yes, please come today between 12:30 PM and 2 PM.")
                .build();

        mockMvc.perform(put("/api/owner/mess/enquiries/" + enqA.getId() + "/reply")
                        .header(HttpHeaders.AUTHORIZATION, ownerAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(replyRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.status", is("REPLIED")))
                .andExpect(jsonPath("$.data.replyNotes", is("Yes, please come today between 12:30 PM and 2 PM.")));

        Enquiry reloaded = enquiryRepository.findById(enqA.getId()).orElseThrow();
        assertThat(reloaded.getStatus()).isEqualTo(EnquiryStatus.REPLIED);
        assertThat(reloaded.getReplyNotes()).isEqualTo("Yes, please come today between 12:30 PM and 2 PM.");
    }

    @Test
    @DisplayName("Owner B cannot reply to an enquiry belonging to Mess A -> 403 Forbidden")
    void testOwnerCannotReplyToUnrelatedEnquiry() throws Exception {
        Enquiry enqA = enquiryRepository.save(Enquiry.builder()
                .mess(messA)
                .student(student1)
                .studentName(student1.getName())
                .category("Monthly Meal Plan")
                .message("Is Sunday feast included?")
                .status(EnquiryStatus.NEW)
                .build());

        ReplyEnquiryRequest replyRequest = ReplyEnquiryRequest.builder()
                .replyNotes("Unauthorized reply attempt")
                .build();

        mockMvc.perform(put("/api/owner/mess/enquiries/" + enqA.getId() + "/reply")
                        .header(HttpHeaders.AUTHORIZATION, ownerBToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(replyRequest)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Student can view their own submitted enquiries and cannot see other students' enquiries")
    void testStudentViewsOwnEnquiriesIsolation() throws Exception {
        Enquiry enq1 = enquiryRepository.save(Enquiry.builder()
                .mess(messA)
                .student(student1)
                .studentName(student1.getName())
                .category("Trial Meal")
                .message("Student 1 enquiry")
                .status(EnquiryStatus.NEW)
                .build());

        Enquiry enq2 = enquiryRepository.save(Enquiry.builder()
                .mess(messB)
                .student(student2)
                .studentName(student2.getName())
                .category("Tiffin Service")
                .message("Student 2 enquiry")
                .status(EnquiryStatus.NEW)
                .build());

        // Student 1 checks
        mockMvc.perform(get("/api/student/enquiries")
                        .header(HttpHeaders.AUTHORIZATION, student1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id", is(enq1.getId().intValue())))
                .andExpect(jsonPath("$.data[0].message", is("Student 1 enquiry")));

        // Student 2 checks
        mockMvc.perform(get("/api/student/enquiries")
                        .header(HttpHeaders.AUTHORIZATION, student2Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id", is(enq2.getId().intValue())))
                .andExpect(jsonPath("$.data[0].message", is("Student 2 enquiry")));
    }
}
