package com.messmap.modules.admin.service;

import com.messmap.modules.admin.dto.AdminDashboardMetricsResponse;
import com.messmap.modules.mess.entity.MessStatus;
import com.messmap.modules.mess.repository.MessRepository;
import com.messmap.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service aggregating live platform metrics and analytics for administrative reporting.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminMetricsService {

    private final UserRepository userRepository;
    private final MessRepository messRepository;

    /**
     * Aggregates live platform counts directly from MySQL tables using Spring Data JPA repositories.
     *
     * @return AdminDashboardMetricsResponse containing user and mess counts
     */
    public AdminDashboardMetricsResponse getDashboardMetrics() {
        log.info("Aggregating live admin dashboard metrics from database");

        long totalUsers = userRepository.count();
        long activeMesses = messRepository.countByStatus(MessStatus.APPROVED);
        long pendingMesses = messRepository.countByStatus(MessStatus.PENDING);
        long suspendedMesses = messRepository.countByStatus(MessStatus.SUSPENDED);
        long totalMesses = messRepository.count();

        log.debug("Live metrics aggregated - Users: {}, Approved Messes: {}, Pending: {}, Suspended: {}, Total Messes: {}",
                totalUsers, activeMesses, pendingMesses, suspendedMesses, totalMesses);

        return AdminDashboardMetricsResponse.builder()
                .totalUsers(totalUsers)
                .activeMesses(activeMesses)
                .pendingVerification(pendingMesses)
                .suspendedMesses(suspendedMesses)
                .totalMesses(totalMesses)
                .build();
    }
}
