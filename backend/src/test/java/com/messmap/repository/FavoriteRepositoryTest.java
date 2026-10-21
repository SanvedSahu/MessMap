package com.messmap.repository;

import com.messmap.modules.favorite.entity.Favorite;
import com.messmap.modules.favorite.repository.FavoriteRepository;
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
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
@ActiveProfiles("test")
class FavoriteRepositoryTest {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private MessRepository messRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("Should save favorite and enforce unique user-mess constraint")
    void shouldPersistFavoriteAndEnforceUniqueConstraint() {
        User owner = userRepository.save(User.builder()
                .name("Fav Owner")
                .email("fav.owner@messmap.com")
                .password("hash")
                .role(Role.ROLE_MESS_OWNER)
                .build());

        User student = userRepository.save(User.builder()
                .name("Fav Student")
                .email("fav.student@messmap.com")
                .password("hash")
                .role(Role.ROLE_STUDENT)
                .build());

        Mess mess = messRepository.save(Mess.builder()
                .owner(owner)
                .name("Star Mess")
                .address("Near College Gate")
                .city("Pune")
                .foodType(FoodType.PURE_VEG)
                .build());

        Favorite favorite = Favorite.builder()
                .user(student)
                .mess(mess)
                .build();
        favoriteRepository.saveAndFlush(favorite);

        List<Favorite> favorites = favoriteRepository.findByUserId(student.getId());
        assertThat(favorites).hasSize(1);
        assertThat(favorites.get(0).getMess().getName()).isEqualTo("Star Mess");
        assertThat(favorites.get(0).getCreatedAt()).isNotNull();

        // Enforce unique constraint
        Favorite duplicate = Favorite.builder()
                .user(student)
                .mess(mess)
                .build();

        assertThatThrownBy(() -> favoriteRepository.saveAndFlush(duplicate))
                .isInstanceOf(DataIntegrityViolationException.class);
    }
}
