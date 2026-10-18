package com.messmap.modules.admin.service;

import com.messmap.common.exception.BadRequestException;
import com.messmap.common.exception.ResourceNotFoundException;
import com.messmap.modules.admin.dto.AdminMessResponse;
import com.messmap.modules.mess.entity.FoodType;
import com.messmap.modules.mess.entity.Mess;
import com.messmap.modules.mess.entity.MessStatus;
import com.messmap.modules.mess.entity.OperatingStatus;
import com.messmap.modules.mess.repository.MessRepository;
import com.messmap.modules.user.entity.Role;
import com.messmap.modules.user.entity.User;
import com.messmap.modules.user.entity.UserStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminMessVerificationServiceTest {

    @Mock
    private MessRepository messRepository;

    @InjectMocks
    private AdminMessVerificationService adminMessVerificationService;

    private User owner;
    private Mess pendingMess;
    private Mess approvedMess;
    private Mess suspendedMess;

    @BeforeEach
    void setUp() {
        owner = User.builder()
                .id(10L)
                .name("Ramesh Patil")
                .email("ramesh@annapurna.com")
                .phone("9876543210")
                .role(Role.ROLE_MESS_OWNER)
                .status(UserStatus.ACTIVE)
                .build();

        pendingMess = Mess.builder()
                .id(1L)
                .name("Annapurna Pure Veg")
                .address("FC Road, Deccan")
                .city("Pune")
                .foodType(FoodType.PURE_VEG)
                .status(MessStatus.PENDING)
                .operatingStatus(OperatingStatus.OPEN)
                .owner(owner)
                .build();

        approvedMess = Mess.builder()
                .id(2L)
                .name("Royal Caterers")
                .address("JM Road")
                .city("Pune")
                .foodType(FoodType.VEG_AND_NON_VEG)
                .status(MessStatus.APPROVED)
                .operatingStatus(OperatingStatus.OPEN)
                .owner(owner)
                .build();

        suspendedMess = Mess.builder()
                .id(3L)
                .name("Quality Dining")
                .address("Kothrud")
                .city("Pune")
                .foodType(FoodType.PURE_VEG)
                .status(MessStatus.SUSPENDED)
                .operatingStatus(OperatingStatus.OPEN)
                .owner(owner)
                .build();
    }

    @Test
    @DisplayName("Should retrieve pending messes")
    void shouldRetrievePendingMesses() {
        when(messRepository.findByStatus(MessStatus.PENDING)).thenReturn(List.of(pendingMess));

        List<AdminMessResponse> results = adminMessVerificationService.getPendingMesses();

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getName()).isEqualTo("Annapurna Pure Veg");
        assertThat(results.get(0).getStatus()).isEqualTo(MessStatus.PENDING);
        assertThat(results.get(0).getOwnerName()).isEqualTo("Ramesh Patil");
        verify(messRepository, times(1)).findByStatus(MessStatus.PENDING);
    }

    @Test
    @DisplayName("Should retrieve all messes when status is null")
    void shouldRetrieveAllMessesWhenStatusIsNull() {
        when(messRepository.findAll()).thenReturn(List.of(pendingMess, approvedMess));

        List<AdminMessResponse> results = adminMessVerificationService.getAllMesses(null);

        assertThat(results).hasSize(2);
        verify(messRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should retrieve filtered messes when status is provided")
    void shouldRetrieveFilteredMessesWhenStatusIsProvided() {
        when(messRepository.findByStatus(MessStatus.APPROVED)).thenReturn(List.of(approvedMess));

        List<AdminMessResponse> results = adminMessVerificationService.getAllMesses(MessStatus.APPROVED);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getStatus()).isEqualTo(MessStatus.APPROVED);
        verify(messRepository, times(1)).findByStatus(MessStatus.APPROVED);
    }

    @Test
    @DisplayName("Should retrieve mess by ID")
    void shouldRetrieveMessById() {
        when(messRepository.findById(1L)).thenReturn(Optional.of(pendingMess));

        AdminMessResponse result = adminMessVerificationService.getMessById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Annapurna Pure Veg");
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when mess does not exist")
    void shouldThrowNotFoundWhenMessDoesNotExist() {
        when(messRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminMessVerificationService.getMessById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Mess not found with id: 999");
    }

    @Test
    @DisplayName("Should successfully approve pending mess")
    void shouldApprovePendingMess() {
        when(messRepository.findById(1L)).thenReturn(Optional.of(pendingMess));
        when(messRepository.save(any(Mess.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AdminMessResponse response = adminMessVerificationService.approveMess(1L);

        assertThat(response.getStatus()).isEqualTo(MessStatus.APPROVED);
        assertThat(response.getRejectionReason()).isNull();
        verify(messRepository, times(1)).save(pendingMess);
    }

    @Test
    @DisplayName("Should throw BadRequestException when approving already approved mess")
    void shouldThrowBadRequestWhenApprovingAlreadyApprovedMess() {
        when(messRepository.findById(2L)).thenReturn(Optional.of(approvedMess));

        assertThatThrownBy(() -> adminMessVerificationService.approveMess(2L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("already approved");
    }

    @Test
    @DisplayName("Should throw BadRequestException when approving suspended mess")
    void shouldThrowBadRequestWhenApprovingSuspendedMess() {
        when(messRepository.findById(3L)).thenReturn(Optional.of(suspendedMess));

        assertThatThrownBy(() -> adminMessVerificationService.approveMess(3L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Only pending messes can be approved");
    }

    @Test
    @DisplayName("Should successfully reject pending mess with reason")
    void shouldRejectPendingMess() {
        when(messRepository.findById(1L)).thenReturn(Optional.of(pendingMess));
        when(messRepository.save(any(Mess.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AdminMessResponse response = adminMessVerificationService.rejectMess(1L, "Incomplete documentation and invalid phone");

        assertThat(response.getStatus()).isEqualTo(MessStatus.REJECTED);
        assertThat(response.getRejectionReason()).isEqualTo("Incomplete documentation and invalid phone");
        verify(messRepository, times(1)).save(pendingMess);
    }

    @Test
    @DisplayName("Should throw BadRequestException when rejecting without reason")
    void shouldThrowBadRequestWhenRejectingWithoutReason() {
        assertThatThrownBy(() -> adminMessVerificationService.rejectMess(1L, "   "))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Rejection reason is required");
    }

    @Test
    @DisplayName("Should throw BadRequestException when rejecting already rejected mess")
    void shouldThrowBadRequestWhenRejectingAlreadyRejectedMess() {
        pendingMess.setStatus(MessStatus.REJECTED);
        when(messRepository.findById(1L)).thenReturn(Optional.of(pendingMess));

        assertThatThrownBy(() -> adminMessVerificationService.rejectMess(1L, "Some reason"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("already rejected");
    }

    @Test
    @DisplayName("Should successfully suspend approved mess with reason")
    void shouldSuspendApprovedMess() {
        when(messRepository.findById(2L)).thenReturn(Optional.of(approvedMess));
        when(messRepository.save(any(Mess.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AdminMessResponse response = adminMessVerificationService.suspendMess(2L, "Repeated hygiene violations");

        assertThat(response.getStatus()).isEqualTo(MessStatus.SUSPENDED);
        assertThat(response.getRejectionReason()).isEqualTo("Repeated hygiene violations");
        verify(messRepository, times(1)).save(approvedMess);
    }

    @Test
    @DisplayName("Should throw BadRequestException when suspending non-approved mess")
    void shouldThrowBadRequestWhenSuspendingNonApprovedMess() {
        when(messRepository.findById(1L)).thenReturn(Optional.of(pendingMess));

        assertThatThrownBy(() -> adminMessVerificationService.suspendMess(1L, "Violation"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Only approved messes can be suspended");
    }

    @Test
    @DisplayName("Should successfully unsuspend suspended mess")
    void shouldUnsuspendSuspendedMess() {
        when(messRepository.findById(3L)).thenReturn(Optional.of(suspendedMess));
        when(messRepository.save(any(Mess.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AdminMessResponse response = adminMessVerificationService.unsuspendMess(3L);

        assertThat(response.getStatus()).isEqualTo(MessStatus.APPROVED);
        assertThat(response.getRejectionReason()).isNull();
        verify(messRepository, times(1)).save(suspendedMess);
    }

    @Test
    @DisplayName("Should throw BadRequestException when unsuspending non-suspended mess")
    void shouldThrowBadRequestWhenUnsuspendingNonSuspendedMess() {
        when(messRepository.findById(2L)).thenReturn(Optional.of(approvedMess));

        assertThatThrownBy(() -> adminMessVerificationService.unsuspendMess(2L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Only suspended messes can be unsuspended");
    }
}
