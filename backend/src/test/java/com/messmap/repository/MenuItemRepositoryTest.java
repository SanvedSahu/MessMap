package com.messmap.repository;

import com.messmap.modules.menu.entity.MealType;
import com.messmap.modules.menu.entity.MenuItem;
import com.messmap.modules.menu.repository.MenuItemRepository;
import com.messmap.modules.mess.entity.FoodType;
import com.messmap.modules.mess.entity.Mess;
import com.messmap.modules.mess.repository.MessRepository;
import com.messmap.modules.user.entity.Role;
import com.messmap.modules.user.entity.User;
import com.messmap.modules.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class MenuItemRepositoryTest {

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private MessRepository messRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("Should persist and query menu items with dayOfWeek, mealType, isSpecial, and price precision")
    void shouldPersistAndRetrieveMenuItems() {
        User owner = userRepository.save(User.builder()
                .name("Menu Owner")
                .email("menu.owner@messmap.com")
                .password("hashedPassword")
                .role(Role.ROLE_MESS_OWNER)
                .build());

        Mess mess = messRepository.save(Mess.builder()
                .owner(owner)
                .name("Shree Ganesh Mess")
                .address("JM Road")
                .city("Pune")
                .foodType(FoodType.PURE_VEG)
                .breakfastPrice(new BigDecimal("40.00"))
                .lunchPrice(new BigDecimal("80.00"))
                .dinnerPrice(new BigDecimal("90.00"))
                .dailyPrice(new BigDecimal("170.00"))
                .monthlyPrice(new BigDecimal("3200.00"))
                .build());

        MenuItem item1 = MenuItem.builder()
                .mess(mess)
                .name("Paneer Butter Masala Thali")
                .description("Served with 3 chapatis, dal, rice, sweet")
                .mealType(MealType.LUNCH)
                .dayOfWeek("MONDAY")
                .price(new BigDecimal("120.00"))
                .isAvailable(true)
                .isSpecial(true)
                .build();

        MenuItem item2 = MenuItem.builder()
                .mess(mess)
                .name("Poha & Chai")
                .description("Morning breakfast special")
                .mealType(MealType.BREAKFAST)
                .dayOfWeek("MONDAY")
                .price(new BigDecimal("40.00"))
                .isAvailable(true)
                .isSpecial(false)
                .build();

        MenuItem saved1 = menuItemRepository.save(item1);
        MenuItem saved2 = menuItemRepository.save(item2);

        List<MenuItem> allItems = menuItemRepository.findByMessId(mess.getId());
        assertThat(allItems).hasSize(2);

        List<MenuItem> lunchItems = menuItemRepository.findByMessIdAndMealType(mess.getId(), MealType.LUNCH);
        assertThat(lunchItems).hasSize(1);
        assertThat(lunchItems.get(0).getName()).isEqualTo("Paneer Butter Masala Thali");
        assertThat(lunchItems.get(0).getIsSpecial()).isTrue();
        assertThat(lunchItems.get(0).getDayOfWeek()).isEqualTo("MONDAY");

        // Verify join query with owner
        Optional<MenuItem> fetchedWithMess = menuItemRepository.findByIdWithMessAndOwner(saved1.getId());
        assertThat(fetchedWithMess).isPresent();
        assertThat(fetchedWithMess.get().getMess().getName()).isEqualTo("Shree Ganesh Mess");
        assertThat(fetchedWithMess.get().getMess().getOwner().getEmail()).isEqualTo("menu.owner@messmap.com");

        // Verify mess pricing persistence across reads
        Mess reloadedMess = messRepository.findById(mess.getId()).orElseThrow();
        assertThat(reloadedMess.getBreakfastPrice()).isEqualByComparingTo("40.00");
        assertThat(reloadedMess.getLunchPrice()).isEqualByComparingTo("80.00");
        assertThat(reloadedMess.getDinnerPrice()).isEqualByComparingTo("90.00");
        assertThat(reloadedMess.getMonthlyPrice()).isEqualByComparingTo("3200.00");
    }
}
