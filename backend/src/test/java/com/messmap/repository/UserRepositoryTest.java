package com.messmap.repository;

import com.messmap.modules.user.entity.Role;
import com.messmap.modules.user.entity.User;
import com.messmap.modules.user.entity.UserStatus;
import com.messmap.modules.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Test
    @DisplayName("Should persist and retrieve user with BCrypt hashed password and role")
    void shouldPersistAndRetrieveUser() {
        User user = User.builder()
                .name("Rahul Patil")
                .email("rahul.patil@coep.ac.in")
                .password(passwordEncoder.encode("studentPass123"))
                .phone("9876543210")
                .role(Role.ROLE_STUDENT)
                .status(UserStatus.ACTIVE)
                .college("COEP Technological University")
                .hostel("Hostel Block B")
                .build();

        User saved = userRepository.save(user);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();

        Optional<User> fetched = userRepository.findByEmail("rahul.patil@coep.ac.in");
        assertThat(fetched).isPresent();
        assertThat(fetched.get().getName()).isEqualTo("Rahul Patil");
        assertThat(fetched.get().getRole()).isEqualTo(Role.ROLE_STUDENT);
        assertThat(passwordEncoder.matches("studentPass123", fetched.get().getPassword())).isTrue();
    }

    @Test
    @DisplayName("Should enforce email uniqueness constraint")
    void shouldEnforceUniqueEmailConstraint() {
        User user1 = User.builder()
                .name("Admin User 1")
                .email("duplicate@messmap.com")
                .password("hash1")
                .role(Role.ROLE_ADMIN)
                .build();
        userRepository.saveAndFlush(user1);

        User user2 = User.builder()
                .name("Admin User 2")
                .email("duplicate@messmap.com")
                .password("hash2")
                .role(Role.ROLE_ADMIN)
                .build();

        assertThatThrownBy(() -> userRepository.saveAndFlush(user2))
                .isInstanceOf(DataIntegrityViolationException.class);
    }
}
