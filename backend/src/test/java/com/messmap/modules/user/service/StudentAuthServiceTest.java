package com.messmap.modules.user.service;

import com.messmap.common.exception.DuplicateResourceException;
import com.messmap.common.exception.UnauthorizedException;
import com.messmap.modules.user.dto.AuthResponse;
import com.messmap.modules.user.dto.StudentLoginRequest;
import com.messmap.modules.user.dto.StudentRegisterRequest;
import com.messmap.modules.user.entity.DietaryPreference;
import com.messmap.modules.user.entity.Role;
import com.messmap.modules.user.entity.User;
import com.messmap.modules.user.entity.UserStatus;
import com.messmap.modules.user.repository.UserRepository;
import com.messmap.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentAuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private JwtTokenProvider jwtTokenProvider;
    private StudentAuthService studentAuthService;

    private StudentRegisterRequest registerRequest;
    private StudentLoginRequest loginRequest;
    private User studentUser;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(
                "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970",
                86400000L
        );

        studentAuthService = new StudentAuthService(userRepository, passwordEncoder, jwtTokenProvider);

        registerRequest = StudentRegisterRequest.builder()
                .name("Anushka Pawar")
                .email("anushka@example.com")
                .password("securePassword123")
                .phone("+91 9876543210")
                .college("COEP Technological University")
                .hostel("Block C, Room 204")
                .dietaryPreference(DietaryPreference.VEG)
                .build();

        loginRequest = StudentLoginRequest.builder()
                .email("anushka@example.com")
                .password("securePassword123")
                .build();

        studentUser = User.builder()
                .id(1L)
                .name("Anushka Pawar")
                .email("anushka@example.com")
                .password("$2a$10$hashedPasswordHere")
                .phone("+91 9876543210")
                .role(Role.ROLE_STUDENT)
                .status(UserStatus.ACTIVE)
                .college("COEP Technological University")
                .hostel("Block C, Room 204")
                .dietaryPreference(DietaryPreference.VEG)
                .build();
    }

    @Test
    @DisplayName("register should hash password with BCrypt, assign ROLE_STUDENT and ACTIVE status")
    void testRegisterSuccess() {
        when(userRepository.existsByEmail("anushka@example.com")).thenReturn(false);
        when(passwordEncoder.encode("securePassword123")).thenReturn("$2a$10$hashedPasswordHere");
        when(userRepository.save(any(User.class))).thenReturn(studentUser);

        AuthResponse response = studentAuthService.register(registerRequest);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isNotBlank();
        assertThat(jwtTokenProvider.validateToken(response.getToken())).isTrue();
        assertThat(jwtTokenProvider.getEmailFromToken(response.getToken())).isEqualTo("anushka@example.com");
        assertThat(response.getUser().getEmail()).isEqualTo("anushka@example.com");
        assertThat(response.getUser().getRole()).isEqualTo(Role.ROLE_STUDENT);
        assertThat(response.getUser().getStatus()).isEqualTo(UserStatus.ACTIVE);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User savedEntity = userCaptor.getValue();
        assertThat(savedEntity.getPassword()).isEqualTo("$2a$10$hashedPasswordHere");
        assertThat(savedEntity.getPassword()).isNotEqualTo("securePassword123");
        assertThat(savedEntity.getRole()).isEqualTo(Role.ROLE_STUDENT);
        assertThat(savedEntity.getStatus()).isEqualTo(UserStatus.ACTIVE);
    }

    @Test
    @DisplayName("register should throw DuplicateResourceException when email already exists")
    void testRegisterDuplicateEmail() {
        when(userRepository.existsByEmail("anushka@example.com")).thenReturn(true);

        assertThatThrownBy(() -> studentAuthService.register(registerRequest))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("User already exists with email: 'anushka@example.com'");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("login should return signed JWT when credentials are valid")
    void testLoginSuccess() {
        when(userRepository.findByEmail("anushka@example.com")).thenReturn(Optional.of(studentUser));
        when(passwordEncoder.matches("securePassword123", studentUser.getPassword())).thenReturn(true);

        AuthResponse response = studentAuthService.login(loginRequest);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isNotBlank();
        assertThat(jwtTokenProvider.validateToken(response.getToken())).isTrue();
        assertThat(jwtTokenProvider.getEmailFromToken(response.getToken())).isEqualTo("anushka@example.com");
        assertThat(response.getUser().getEmail()).isEqualTo("anushka@example.com");
    }

    @Test
    @DisplayName("login should throw UnauthorizedException with generic message when password is wrong")
    void testLoginWrongPassword() {
        when(userRepository.findByEmail("anushka@example.com")).thenReturn(Optional.of(studentUser));
        when(passwordEncoder.matches("wrongPassword", studentUser.getPassword())).thenReturn(false);

        loginRequest.setPassword("wrongPassword");

        assertThatThrownBy(() -> studentAuthService.login(loginRequest))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Invalid email or password");
    }

    @Test
    @DisplayName("login should throw UnauthorizedException with generic message when email does not exist")
    void testLoginEmailNotFound() {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        loginRequest.setEmail("unknown@example.com");

        assertThatThrownBy(() -> studentAuthService.login(loginRequest))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Invalid email or password");
    }

    @Test
    @DisplayName("login should throw UnauthorizedException when account is suspended")
    void testLoginSuspendedAccount() {
        studentUser.setStatus(UserStatus.SUSPENDED);
        when(userRepository.findByEmail("anushka@example.com")).thenReturn(Optional.of(studentUser));
        when(passwordEncoder.matches("securePassword123", studentUser.getPassword())).thenReturn(true);

        assertThatThrownBy(() -> studentAuthService.login(loginRequest))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Account is not active");
    }
}
