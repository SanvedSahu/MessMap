package com.messmap.modules.menu.repository;

import com.messmap.modules.menu.entity.MealType;
import com.messmap.modules.menu.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for Menu Items.
 */
@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    List<MenuItem> findByMessId(Long messId);

    List<MenuItem> findByMessIdAndMealType(Long messId, MealType mealType);

    List<MenuItem> findByMessIdAndIsAvailableTrue(Long messId);

    List<MenuItem> findByMessIdAndMealTypeAndIsAvailableTrue(Long messId, MealType mealType);

    long countByMessId(Long messId);
}
