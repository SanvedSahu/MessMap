package com.messmap.modules.mess.repository;

import com.messmap.modules.mess.entity.Facility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for Mess facilities and amenities.
 */
@Repository
public interface FacilityRepository extends JpaRepository<Facility, Long> {

    Optional<Facility> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);
}
