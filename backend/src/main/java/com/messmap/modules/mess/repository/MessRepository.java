package com.messmap.modules.mess.repository;

import com.messmap.modules.mess.entity.FoodType;
import com.messmap.modules.mess.entity.Mess;
import com.messmap.modules.mess.entity.MessStatus;
import com.messmap.modules.mess.entity.OperatingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for Mess listings with JPA Specification execution support.
 */
@Repository
public interface MessRepository extends JpaRepository<Mess, Long>, JpaSpecificationExecutor<Mess> {

    List<Mess> findByStatus(MessStatus status);

    List<Mess> findByOwnerId(Long ownerId);

    List<Mess> findByStatusAndCityIgnoreCase(MessStatus status, String city);

    List<Mess> findByStatusAndFoodType(MessStatus status, FoodType foodType);

    List<Mess> findByStatusAndOperatingStatus(MessStatus status, OperatingStatus operatingStatus);

    long countByStatus(MessStatus status);

    @Override
    @EntityGraph(attributePaths = {"facilities"})
    List<Mess> findAll(Specification<Mess> spec);

    @Override
    @EntityGraph(attributePaths = {"facilities"})
    List<Mess> findAll(Specification<Mess> spec, Sort sort);

    @Override
    @EntityGraph(attributePaths = {"facilities"})
    Page<Mess> findAll(Specification<Mess> spec, Pageable pageable);

    @EntityGraph(attributePaths = {"facilities", "images"})
    @Query("SELECT m FROM Mess m WHERE m.id = :id AND m.status = :status")
    Optional<Mess> findByIdAndStatusWithDetails(@Param("id") Long id, @Param("status") MessStatus status);

    @EntityGraph(attributePaths = {"facilities", "images"})
    @Query("SELECT m FROM Mess m WHERE m.id = :id")
    Optional<Mess> findByIdWithDetails(@Param("id") Long id);

    @EntityGraph(attributePaths = {"facilities", "images"})
    @Query("SELECT m FROM Mess m WHERE m.owner.id = :ownerId")
    List<Mess> findByOwnerIdWithDetails(@Param("ownerId") Long ownerId);

    Optional<Mess> findFirstByOwnerIdOrderByIdAsc(Long ownerId);
}
