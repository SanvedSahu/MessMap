package com.messmap.modules.favorite.repository;

import com.messmap.modules.favorite.entity.Favorite;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for student favorites.
 */
@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    @EntityGraph(attributePaths = {"mess", "mess.facilities"})
    List<Favorite> findByUserId(Long userId);

    @EntityGraph(attributePaths = {"mess", "mess.facilities"})
    List<Favorite> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Favorite> findByUserIdAndMessId(Long userId, Long messId);

    boolean existsByUserIdAndMessId(Long userId, Long messId);

    void deleteByUserIdAndMessId(Long userId, Long messId);

    long countByMessId(Long messId);

    @EntityGraph(attributePaths = {"user"})
    List<Favorite> findByMessId(Long messId);
}
