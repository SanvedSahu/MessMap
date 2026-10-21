package com.messmap.modules.mess.repository;

import com.messmap.modules.mess.entity.SuspensionReviewRequest;
import com.messmap.modules.mess.entity.SuspensionReviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for SuspensionReviewRequest entities.
 */
@Repository
public interface SuspensionReviewRequestRepository extends JpaRepository<SuspensionReviewRequest, Long> {

    List<SuspensionReviewRequest> findByMessIdOrderByCreatedAtDesc(Long messId);

    List<SuspensionReviewRequest> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);

    List<SuspensionReviewRequest> findByStatusOrderByCreatedAtDesc(SuspensionReviewStatus status);

    @Query("SELECT r FROM SuspensionReviewRequest r JOIN FETCH r.mess m JOIN FETCH r.owner o ORDER BY r.createdAt DESC")
    List<SuspensionReviewRequest> findAllWithDetails();

    @Query("SELECT r FROM SuspensionReviewRequest r JOIN FETCH r.mess m JOIN FETCH r.owner o WHERE r.status = :status ORDER BY r.createdAt DESC")
    List<SuspensionReviewRequest> findAllByStatusWithDetails(@Param("status") SuspensionReviewStatus status);

    boolean existsByMessIdAndStatus(Long messId, SuspensionReviewStatus status);

    Optional<SuspensionReviewRequest> findFirstByMessIdAndStatusOrderByCreatedAtDesc(Long messId, SuspensionReviewStatus status);
}
