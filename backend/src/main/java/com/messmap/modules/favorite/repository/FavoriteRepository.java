package com.messmap.modules.favorite.repository;

import com.messmap.modules.favorite.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for student favorites.
 */
@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    List<Favorite> findByUserId(Long userId);

    Optional<Favorite> findByUserIdAndMessId(Long userId, Long messId);

    boolean existsByUserIdAndMessId(Long userId, Long messId);

    void deleteByUserIdAndMessId(Long userId, Long messId);

    long countByMessId(Long messId);
}
