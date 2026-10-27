package com.messmap.modules.enquiry.repository;

import com.messmap.modules.enquiry.entity.Enquiry;
import com.messmap.modules.enquiry.entity.EnquiryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for customer enquiries.
 */
@Repository
public interface EnquiryRepository extends JpaRepository<Enquiry, Long> {

    @Query("SELECT e FROM Enquiry e JOIN FETCH e.mess JOIN FETCH e.student WHERE e.student.id = :studentId ORDER BY e.createdAt DESC")
    List<Enquiry> findByStudentIdOrderByCreatedAtDesc(@Param("studentId") Long studentId);

    @Query("SELECT e FROM Enquiry e JOIN FETCH e.mess JOIN FETCH e.student WHERE e.mess.id = :messId ORDER BY e.createdAt DESC")
    List<Enquiry> findByMessIdOrderByCreatedAtDesc(@Param("messId") Long messId);

    @Query("SELECT e FROM Enquiry e JOIN FETCH e.mess JOIN FETCH e.student WHERE e.mess.id = :messId AND e.status = :status ORDER BY e.createdAt DESC")
    List<Enquiry> findByMessIdAndStatusOrderByCreatedAtDesc(@Param("messId") Long messId, @Param("status") EnquiryStatus status);

    @Query("SELECT e FROM Enquiry e JOIN FETCH e.mess mess JOIN FETCH mess.owner JOIN FETCH e.student WHERE e.id = :id")
    Optional<Enquiry> findByIdWithMessAndOwner(@Param("id") Long id);

    long countByMessIdAndStatus(Long messId, EnquiryStatus status);

    long countByMessId(Long messId);
}
