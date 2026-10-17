package com.messmap.modules.admin.service;

import com.messmap.modules.admin.dto.AdminDashboardMetricsResponse;
import com.messmap.modules.mess.entity.MessStatus;
import com.messmap.modules.mess.repository.MessRepository;
import com.messmap.modules.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminMetricsServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private MessRepository messRepository;

    @InjectMocks
    private AdminMetricsService adminMetricsService;

    @Test
    @DisplayName("Should aggregate live metrics correctly from UserRepository and MessRepository")
    void shouldAggregateDashboardMetricsCorrectly() {
        // Arrange
        when(userRepository.count()).thenReturn(150L);
        when(messRepository.countByStatus(MessStatus.APPROVED)).thenReturn(42L);
        when(messRepository.countByStatus(MessStatus.PENDING)).thenReturn(8L);
        when(messRepository.countByStatus(MessStatus.SUSPENDED)).thenReturn(3L);
        when(messRepository.count()).thenReturn(55L);

        // Act
        AdminDashboardMetricsResponse response = adminMetricsService.getDashboardMetrics();

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getTotalUsers()).isEqualTo(150L);
        assertThat(response.getActiveMesses()).isEqualTo(42L);
        assertThat(response.getApprovedMesses()).isEqualTo(42L);
        assertThat(response.getPendingVerification()).isEqualTo(8L);
        assertThat(response.getPendingMesses()).isEqualTo(8L);
        assertThat(response.getSuspendedMesses()).isEqualTo(3L);
        assertThat(response.getTotalMesses()).isEqualTo(55L);

        // Verify repository interactions
        verify(userRepository, times(1)).count();
        verify(messRepository, times(1)).countByStatus(MessStatus.APPROVED);
        verify(messRepository, times(1)).countByStatus(MessStatus.PENDING);
        verify(messRepository, times(1)).countByStatus(MessStatus.SUSPENDED);
        verify(messRepository, times(1)).count();
    }
}
