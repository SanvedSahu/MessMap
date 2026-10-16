package com.messmap.modules.review.repository;

import com.messmap.modules.review.entity.Review;
import com.messmap.modules.review.entity.ReviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for Mess reviews and ratings.
 */
@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByMessId(Long messId);

    List<Review> findByMessIdAndStatus(Long messId, ReviewStatus status);

    List<Review> findByUserId(Long userId);

    long countByMessIdAndStatus(Long messId, ReviewStatus status);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.mess.id = :messId AND r.status = 'PUBLISHED'")
    Optional<Double> findAverageRatingByMessId(@Param("messId") Long messId);
}
