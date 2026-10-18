package com.messmap.modules.complaint.repository;

import com.messmap.modules.complaint.entity.Complaint;
import com.messmap.modules.complaint.entity.ComplaintCategory;
import com.messmap.modules.complaint.entity.ComplaintSeverity;
import com.messmap.modules.complaint.entity.ComplaintStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for Student Complaints and grievances.
 */
@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    Optional<Complaint> findByTicketNumber(String ticketNumber);

    List<Complaint> findByMessId(Long messId);

    List<Complaint> findByMessIdAndStatus(Long messId, ComplaintStatus status);

    List<Complaint> findByUserId(Long userId);

    List<Complaint> findByStatus(ComplaintStatus status);

    List<Complaint> findByCategory(ComplaintCategory category);

    List<Complaint> findBySeverity(ComplaintSeverity severity);

    long countByStatus(ComplaintStatus status);

    long countByMessId(Long messId);

    long countByMessIdAndStatus(Long messId, ComplaintStatus status);

    boolean existsByTicketNumber(String ticketNumber);
}
