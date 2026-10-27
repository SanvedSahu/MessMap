package com.messmap.modules.mess.service;

import com.messmap.common.exception.BadRequestException;
import com.messmap.modules.mess.dto.UpdateMessProfileRequest;
import com.messmap.modules.mess.entity.Mess;
import com.messmap.modules.mess.entity.MessStatus;
import com.messmap.modules.mess.entity.OperatingStatus;
import com.messmap.modules.mess.repository.FacilityRepository;
import com.messmap.modules.mess.repository.MessRepository;
import com.messmap.modules.notification.service.NotificationService;
import com.messmap.modules.user.entity.Role;
import com.messmap.modules.user.entity.User;
import com.messmap.modules.user.entity.UserStatus;
import com.messmap.modules.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OwnerMessServiceTransitionTest {

    @Mock
    private MessRepository messRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FacilityRepository facilityRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private OwnerMessService ownerMessService;

    private User owner;
    private Mess approvedMess;

    @BeforeEach
    void setUp() {
        owner = User.builder()
                .id(1L)
                .name("Rajesh Sharma")
                .email("rajesh.sharma@annapurnamess.com")
                .role(Role.ROLE_MESS_OWNER)
                .status(UserStatus.ACTIVE)
                .build();

        approvedMess = Mess.builder()
                .id(10L)
                .name("Annapurna Pure Veg Mess")
                .owner(owner)
                .status(MessStatus.APPROVED)
                .operatingStatus(OperatingStatus.CLOSED)
                .city("Pune")
                .address("FC Road")
                .build();
    }

    @Test
    @DisplayName("updateMessProfile on genuine CLOSED -> OPEN transition triggers student notifications")
    void testClosedToOpen_TriggersNotifications() {
        when(messRepository.findByIdWithDetails(10L)).thenReturn(Optional.of(approvedMess));
        when(messRepository.save(any(Mess.class))).thenAnswer(i -> i.getArgument(0));

        UpdateMessProfileRequest request = UpdateMessProfileRequest.builder()
                .operatingStatus(OperatingStatus.OPEN)
                .build();

        ownerMessService.updateMessProfile(1L, 10L, false, request);

        assertThat(approvedMess.getOperatingStatus()).isEqualTo(OperatingStatus.OPEN);
        verify(notificationService, times(1)).createMessOpenedNotifications(approvedMess);
    }

    @Test
    @DisplayName("updateMessProfile on OPEN -> OPEN transition does not trigger notifications")
    void testOpenToOpen_DoesNotTriggerNotifications() {
        approvedMess.setOperatingStatus(OperatingStatus.OPEN);

        when(messRepository.findByIdWithDetails(10L)).thenReturn(Optional.of(approvedMess));
        when(messRepository.save(any(Mess.class))).thenAnswer(i -> i.getArgument(0));

        UpdateMessProfileRequest request = UpdateMessProfileRequest.builder()
                .operatingStatus(OperatingStatus.OPEN)
                .build();

        ownerMessService.updateMessProfile(1L, 10L, false, request);

        verify(notificationService, never()).createMessOpenedNotifications(any());
    }

    @Test
    @DisplayName("updateMessProfile on CLOSED -> CLOSED transition does not trigger notifications")
    void testClosedToClosed_DoesNotTriggerNotifications() {
        approvedMess.setOperatingStatus(OperatingStatus.CLOSED);

        when(messRepository.findByIdWithDetails(10L)).thenReturn(Optional.of(approvedMess));
        when(messRepository.save(any(Mess.class))).thenAnswer(i -> i.getArgument(0));

        UpdateMessProfileRequest request = UpdateMessProfileRequest.builder()
                .operatingStatus(OperatingStatus.CLOSED)
                .build();

        ownerMessService.updateMessProfile(1L, 10L, false, request);

        verify(notificationService, never()).createMessOpenedNotifications(any());
    }

    @Test
    @DisplayName("updateMessProfile on unapproved mess attempting to OPEN throws BadRequestException")
    void testUnapprovedMess_CannotOpen() {
        approvedMess.setStatus(MessStatus.PENDING);

        when(messRepository.findByIdWithDetails(10L)).thenReturn(Optional.of(approvedMess));

        UpdateMessProfileRequest request = UpdateMessProfileRequest.builder()
                .operatingStatus(OperatingStatus.OPEN)
                .build();

        assertThatThrownBy(() -> ownerMessService.updateMessProfile(1L, 10L, false, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("must be approved");

        verify(notificationService, never()).createMessOpenedNotifications(any());
    }
}
