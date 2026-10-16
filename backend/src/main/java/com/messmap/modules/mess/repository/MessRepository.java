package com.messmap.modules.mess.repository;

import com.messmap.modules.mess.entity.FoodType;
import com.messmap.modules.mess.entity.Mess;
import com.messmap.modules.mess.entity.MessStatus;
import com.messmap.modules.mess.entity.OperatingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for Mess listings.
 */
@Repository
public interface MessRepository extends JpaRepository<Mess, Long> {

    List<Mess> findByStatus(MessStatus status);

    List<Mess> findByOwnerId(Long ownerId);

    List<Mess> findByStatusAndCityIgnoreCase(MessStatus status, String city);

    List<Mess> findByStatusAndFoodType(MessStatus status, FoodType foodType);

    List<Mess> findByStatusAndOperatingStatus(MessStatus status, OperatingStatus operatingStatus);

    long countByStatus(MessStatus status);
}
