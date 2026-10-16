package com.messmap.repository;

import com.messmap.modules.mess.entity.*;
import com.messmap.modules.mess.repository.FacilityRepository;
import com.messmap.modules.mess.repository.MessRepository;
import com.messmap.modules.user.entity.Role;
import com.messmap.modules.user.entity.User;
import com.messmap.modules.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class MessRepositoryTest {

    @Autowired
    private MessRepository messRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FacilityRepository facilityRepository;

    @Test
    @DisplayName("Should persist and retrieve Mess with owner relationship and facilities")
    void shouldPersistAndRetrieveMess() {
        User owner = User.builder()
                .name("Rajesh Sharma")
                .email("rajesh.owner@annapurna.com")
                .password("hashedPassword")
                .role(Role.ROLE_MESS_OWNER)
                .build();
        User savedOwner = userRepository.save(owner);

        Facility wifi = facilityRepository.findByNameIgnoreCase("WiFi")
                .orElseGet(() -> facilityRepository.save(Facility.builder().name("WiFi").icon("wifi").build()));

        Mess mess = Mess.builder()
                .owner(savedOwner)
                .name("Annapurna Pure Veg Mess")
                .description("Authentic home-style food near campus")
                .address("Lane 4, FC Road, Shivajinagar")
                .city("Pune")
                .area("Shivajinagar")
                .state("Maharashtra")
                .pincode("411005")
                .latitude(new BigDecimal("18.5204300"))
                .longitude(new BigDecimal("73.8402100"))
                .foodType(FoodType.PURE_VEG)
                .dailyPrice(new BigDecimal("90.00"))
                .monthlyPrice(new BigDecimal("2600.00"))
                .status(MessStatus.PENDING)
                .operatingStatus(OperatingStatus.OPEN)
                .openingTime("07:30 AM")
                .closingTime("10:30 PM")
                .capacity(60)
                .facilities(Set.of(wifi))
                .build();

        Mess savedMess = messRepository.save(mess);

        assertThat(savedMess.getId()).isNotNull();
        assertThat(savedMess.getCreatedAt()).isNotNull();
        assertThat(savedMess.getStatus()).isEqualTo(MessStatus.PENDING);
        assertThat(savedMess.getFacilities()).hasSize(1);

        List<Mess> pendingMesses = messRepository.findByStatus(MessStatus.PENDING);
        assertThat(pendingMesses).extracting(Mess::getName).contains("Annapurna Pure Veg Mess");

        List<Mess> ownerMesses = messRepository.findByOwnerId(savedOwner.getId());
        assertThat(ownerMesses).hasSize(1);
    }
}
