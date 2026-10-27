package com.messmap.modules.admin.service;

import com.messmap.common.dto.PagedResponse;
import com.messmap.common.exception.BadRequestException;
import com.messmap.common.exception.ResourceNotFoundException;
import com.messmap.modules.admin.dto.AdminUserResponse;
import com.messmap.modules.user.entity.Role;
import com.messmap.modules.user.entity.User;
import com.messmap.modules.user.entity.UserStatus;
import com.messmap.modules.user.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextImpl;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminUserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AdminUserService adminUserService;

    private User adminUser;
    private User studentUser;
    private User ownerUser;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @BeforeEach
    void setUp() {
        adminUser = User.builder()
                .id(1L)
                .name("Super Admin")
                .email("admin@messmap.com")
                .password("hashedPassword")
                .role(Role.ROLE_ADMIN)
                .status(UserStatus.ACTIVE)
                .phone("9999999999")
                .build();

        studentUser = User.builder()
                .id(2L)
                .name("Student User")
                .email("student@messmap.com")
                .password("hashedPassword")
                .role(Role.ROLE_STUDENT)
                .status(UserStatus.ACTIVE)
                .phone("8888888888")
                .build();

        ownerUser = User.builder()
                .id(3L)
                .name("Mess Owner")
                .email("owner@messmap.com")
                .password("hashedPassword")
                .role(Role.ROLE_MESS_OWNER)
                .status(UserStatus.SUSPENDED)
                .phone("7777777777")
                .build();
    }

    @Test
    @DisplayName("Should return all users paginated when filters are null")
    void shouldReturnAllUsersPaginated() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<User> page = new PageImpl<>(List.of(adminUser, studentUser), pageable, 2);
        when(userRepository.findAll(pageable)).thenReturn(page);

        PagedResponse<AdminUserResponse> result = adminUserService.getUsers(null, null, pageable);

        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getTotalElements()).isEqualTo(2);
        assertThat(result.getContent().get(0).getEmail()).isEqualTo("admin@messmap.com");
        verify(userRepository, times(1)).findAll(pageable);
    }

    @Test
    @DisplayName("Should return users filtered by role")
    void shouldReturnUsersFilteredByRole() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<User> page = new PageImpl<>(List.of(studentUser), pageable, 1);
        when(userRepository.findByRole(Role.ROLE_STUDENT, pageable)).thenReturn(page);

        PagedResponse<AdminUserResponse> result = adminUserService.getUsers(Role.ROLE_STUDENT, null, pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getRole()).isEqualTo(Role.ROLE_STUDENT);
        verify(userRepository, times(1)).findByRole(Role.ROLE_STUDENT, pageable);
    }

    @Test
    @DisplayName("Should return users filtered by status")
    void shouldReturnUsersFilteredByStatus() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<User> page = new PageImpl<>(List.of(ownerUser), pageable, 1);
        when(userRepository.findByStatus(UserStatus.SUSPENDED, pageable)).thenReturn(page);

        PagedResponse<AdminUserResponse> result = adminUserService.getUsers(null, UserStatus.SUSPENDED, pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getStatus()).isEqualTo(UserStatus.SUSPENDED);
        verify(userRepository, times(1)).findByStatus(UserStatus.SUSPENDED, pageable);
    }

    @Test
    @DisplayName("Should return users filtered by both role and status")
    void shouldReturnUsersFilteredByRoleAndStatus() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<User> page = new PageImpl<>(List.of(ownerUser), pageable, 1);
        when(userRepository.findByRoleAndStatus(Role.ROLE_MESS_OWNER, UserStatus.SUSPENDED, pageable)).thenReturn(page);

        PagedResponse<AdminUserResponse> result = adminUserService.getUsers(Role.ROLE_MESS_OWNER, UserStatus.SUSPENDED, pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getEmail()).isEqualTo("owner@messmap.com");
        verify(userRepository, times(1)).findByRoleAndStatus(Role.ROLE_MESS_OWNER, UserStatus.SUSPENDED, pageable);
    }

    @Test
    @DisplayName("Should return user details by ID")
    void shouldReturnUserById() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(studentUser));

        AdminUserResponse response = adminUserService.getUserById(2L);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(2L);
        assertThat(response.getName()).isEqualTo("Student User");
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when user does not exist")
    void shouldThrowNotFoundWhenUserDoesNotExist() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminUserService.getUserById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found with id: 999");
    }

    @Test
    @DisplayName("Should update user status successfully")
    void shouldUpdateUserStatusSuccessfully() {
        SecurityContextHolder.setContext(new SecurityContextImpl(new UsernamePasswordAuthenticationToken(
                "admin@messmap.com", "cred", List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        )));

        when(userRepository.findById(2L)).thenReturn(Optional.of(studentUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AdminUserResponse response = adminUserService.updateUserStatus(2L, UserStatus.SUSPENDED, "Terms violation");

        assertThat(response.getStatus()).isEqualTo(UserStatus.SUSPENDED);
        verify(userRepository, times(1)).save(studentUser);
    }

    @Test
    @DisplayName("Should throw BadRequestException when admin attempts to deactivate self")
    void shouldThrowBadRequestWhenAdminDeactivatesSelf() {
        SecurityContextHolder.setContext(new SecurityContextImpl(new UsernamePasswordAuthenticationToken(
                "admin@messmap.com", "cred", List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        )));

        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));

        assertThatThrownBy(() -> adminUserService.updateUserStatus(1L, UserStatus.SUSPENDED, "Self-suspension"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("cannot deactivate or suspend their own account");
    }

    @Test
    @DisplayName("Should throw BadRequestException when attempting to deactivate the only admin")
    void shouldThrowBadRequestWhenDeactivatingOnlyAdmin() {
        SecurityContextHolder.setContext(new SecurityContextImpl(new UsernamePasswordAuthenticationToken(
                "other.admin@messmap.com", "cred", List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        )));

        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));
        when(userRepository.countByRole(Role.ROLE_ADMIN)).thenReturn(1L);

        assertThatThrownBy(() -> adminUserService.updateUserStatus(1L, UserStatus.SUSPENDED, "Deactivating root admin"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Cannot deactivate the only administrator account");
    }
}
