package com.messmap.repository;

import com.messmap.modules.complaint.entity.Complaint;
import com.messmap.modules.complaint.entity.ComplaintCategory;
import com.messmap.modules.complaint.entity.ComplaintSeverity;
import com.messmap.modules.complaint.entity.ComplaintStatus;
import com.messmap.modules.complaint.repository.ComplaintRepository;
import com.messmap.modules.mess.entity.FoodType;
import com.messmap.modules.mess.entity.Mess;
import com.messmap.modules.mess.repository.MessRepository;
import com.messmap.modules.user.entity.Role;
import com.messmap.modules.user.entity.User;
import com.messmap.modules.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
@ActiveProfiles("test")
class ComplaintRepositoryTest {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private MessRepository messRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("Should persist and retrieve complaint with ticket number and relationship integrity")
    void shouldPersistAndRetrieveComplaint() {
        User owner = userRepository.save(User.builder()
                .name("Mess Owner")
                .email("owner.complaint@messmap.com")
                .password("hash123")
                .role(Role.ROLE_MESS_OWNER)
                .build());

        User student = userRepository.save(User.builder()
                .name("Rahul Verma")
                .email("rahul.v@college.edu")
                .password("hash123")
                .role(Role.ROLE_STUDENT)
                .college("COEP Pune")
                .build());

        Mess mess = messRepository.save(Mess.builder()
                .owner(owner)
                .name("Green Leaf Mess")
                .address("Shivajinagar")
                .city("Pune")
                .foodType(FoodType.PURE_VEG)
                .build());

        Complaint complaint = Complaint.builder()
                .ticketNumber("TKT-2026-001")
                .mess(mess)
                .user(student)
                .subject("Food served cold during dinner")
                .category(ComplaintCategory.FOOD_QUALITY)
                .description("The dinner food served on Friday was completely cold and roti was stale.")
                .severity(ComplaintSeverity.MEDIUM)
                .status(ComplaintStatus.OPEN)
                .build();

        Complaint saved = complaintRepository.save(complaint);
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();

        Optional<Complaint> foundByTicket = complaintRepository.findByTicketNumber("TKT-2026-001");
        assertThat(foundByTicket).isPresent();
        assertThat(foundByTicket.get().getSubject()).isEqualTo("Food served cold during dinner");
        assertThat(foundByTicket.get().getMess().getName()).isEqualTo("Green Leaf Mess");
        assertThat(foundByTicket.get().getUser().getName()).isEqualTo("Rahul Verma");

        List<Complaint> openComplaints = complaintRepository.findByStatus(ComplaintStatus.OPEN);
        assertThat(openComplaints).hasSize(1);

        long openCount = complaintRepository.countByStatus(ComplaintStatus.OPEN);
        assertThat(openCount).isEqualTo(1);
    }

    @Test
    @DisplayName("Should enforce unique ticket_number constraint")
    void shouldEnforceUniqueTicketNumber() {
        User owner = userRepository.save(User.builder()
                .name("Mess Owner 2")
                .email("owner2.complaint@messmap.com")
                .password("hash123")
                .role(Role.ROLE_MESS_OWNER)
                .build());

        User student = userRepository.save(User.builder()
                .name("Priya Sharma")
                .email("priya.s@college.edu")
                .password("hash123")
                .role(Role.ROLE_STUDENT)
                .build());

        Mess mess = messRepository.save(Mess.builder()
                .owner(owner)
                .name("Annapurna Mess")
                .address("FC Road")
                .city("Pune")
                .foodType(FoodType.PURE_VEG)
                .build());

        complaintRepository.save(Complaint.builder()
                .ticketNumber("TKT-DUP-100")
                .mess(mess)
                .user(student)
                .subject("First complaint")
                .category(ComplaintCategory.HYGIENE_AND_CLEANLINESS)
                .description("First description")
                .severity(ComplaintSeverity.LOW)
                .status(ComplaintStatus.OPEN)
                .build());

        Complaint duplicate = Complaint.builder()
                .ticketNumber("TKT-DUP-100")
                .mess(mess)
                .user(student)
                .subject("Second complaint with same ticket number")
                .category(ComplaintCategory.HYGIENE_AND_CLEANLINESS)
                .description("Second description")
                .severity(ComplaintSeverity.HIGH)
                .status(ComplaintStatus.OPEN)
                .build();

        assertThatThrownBy(() -> complaintRepository.saveAndFlush(duplicate))
                .isInstanceOf(DataIntegrityViolationException.class);
    }
}
