package com.messmap.modules.admin.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Aggregated analytics and overview metrics for the Admin Dashboard.
 * Powers overview metric cards with live database counts.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AdminDashboardMetricsResponse {

    /**
     * Total registered users across all roles (Students, Mess Owners, Admins).
     */
    private long totalUsers;

    /**
     * Total number of approved / active messes verified on the platform.
     */
    private long activeMesses;

    /**
     * Total number of pending mess verification requests awaiting administrative review.
     */
    private long pendingVerification;

    /**
     * Total number of suspended messes flagged for non-compliance.
     */
    private long suspendedMesses;

    /**
     * Total registered messes in the system across all statuses.
     */
    private long totalMesses;

    /**
     * Alias for activeMesses matching alternate client schema naming.
     */
    public long getApprovedMesses() {
        return activeMesses;
    }

    /**
     * Alias for pendingVerification matching alternate client schema naming.
     */
    public long getPendingMesses() {
        return pendingVerification;
    }
}
