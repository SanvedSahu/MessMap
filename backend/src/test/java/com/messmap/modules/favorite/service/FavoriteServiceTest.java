package com.messmap.modules.favorite.service;

import com.messmap.common.exception.ResourceNotFoundException;
import com.messmap.modules.favorite.dto.FavoriteResponse;
import com.messmap.modules.favorite.entity.Favorite;
import com.messmap.modules.favorite.repository.FavoriteRepository;
import com.messmap.modules.mess.entity.FoodType;
import com.messmap.modules.mess.entity.Mess;
import com.messmap.modules.mess.entity.MessStatus;
import com.messmap.modules.mess.entity.OperatingStatus;
import com.messmap.modules.mess.repository.MessRepository;
import com.messmap.modules.review.repository.ReviewRepository;
import com.messmap.modules.user.entity.Role;
import com.messmap.modules.user.entity.User;
import com.messmap.modules.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FavoriteServiceTest {

    @Mock
    private FavoriteRepository favoriteRepository;

    @Mock
    private MessRepository messRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @InjectMocks
    private FavoriteService favoriteService;

    private User testUser;
    private Mess approvedMess;
    private Mess pendingMess;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .name("Test Student")
                .email("student@messmap.com")
                .role(Role.ROLE_STUDENT)
                .build();

        approvedMess = Mess.builder()
                .id(10L)
                .name("Shree Krishna Mess")
                .status(MessStatus.APPROVED)
                .foodType(FoodType.PURE_VEG)
                .dailyPrice(new BigDecimal("80.00"))
                .monthlyPrice(new BigDecimal("2500.00"))
                .city("Pune")
                .address("JM Road")
                .operatingStatus(OperatingStatus.OPEN)
                .build();

        pendingMess = Mess.builder()
                .id(20L)
                .name("Pending Mess")
                .status(MessStatus.PENDING)
                .build();
    }

    @Test
    @DisplayName("addFavorite should successfully persist favorite and return created=true")
    void testAddFavoriteSuccess() {
        when(messRepository.findById(10L)).thenReturn(Optional.of(approvedMess));
        when(favoriteRepository.findByUserIdAndMessId(1L, 10L)).thenReturn(Optional.empty());
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        Favorite savedFavorite = Favorite.builder()
                .id(100L)
                .user(testUser)
                .mess(approvedMess)
                .createdAt(LocalDateTime.now())
                .build();
        when(favoriteRepository.save(any(Favorite.class))).thenReturn(savedFavorite);

        FavoriteService.AddFavoriteResult result = favoriteService.addFavorite(1L, 10L);

        assertThat(result.created()).isTrue();
        assertThat(result.response()).isNotNull();
        assertThat(result.response().getFavoriteId()).isEqualTo(100L);
        assertThat(result.response().getMessId()).isEqualTo(10L);
        assertThat(result.response().getName()).isEqualTo("Shree Krishna Mess");
        verify(favoriteRepository, times(1)).save(any(Favorite.class));
    }

    @Test
    @DisplayName("addFavorite should return created=false when already favorited (idempotent)")
    void testAddFavoriteAlreadyExists() {
        Favorite existingFavorite = Favorite.builder()
                .id(100L)
                .user(testUser)
                .mess(approvedMess)
                .createdAt(LocalDateTime.now())
                .build();

        when(messRepository.findById(10L)).thenReturn(Optional.of(approvedMess));
        when(favoriteRepository.findByUserIdAndMessId(1L, 10L)).thenReturn(Optional.of(existingFavorite));

        FavoriteService.AddFavoriteResult result = favoriteService.addFavorite(1L, 10L);

        assertThat(result.created()).isFalse();
        assertThat(result.response().getFavoriteId()).isEqualTo(100L);
        verify(favoriteRepository, never()).save(any(Favorite.class));
    }

    @Test
    @DisplayName("addFavorite should throw ResourceNotFoundException for nonexistent mess ID")
    void testAddFavoriteNonexistentMess() {
        when(messRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> favoriteService.addFavorite(1L, 99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Mess not found with id: 99");
    }

    @Test
    @DisplayName("addFavorite should throw ResourceNotFoundException for unapproved mess")
    void testAddFavoriteUnapprovedMess() {
        when(messRepository.findById(20L)).thenReturn(Optional.of(pendingMess));

        assertThatThrownBy(() -> favoriteService.addFavorite(1L, 20L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Mess not found with id: 20");
    }

    @Test
    @DisplayName("removeFavorite should call repository deleteByUserIdAndMessId")
    void testRemoveFavorite() {
        favoriteService.removeFavorite(1L, 10L);
        verify(favoriteRepository, times(1)).deleteByUserIdAndMessId(1L, 10L);
    }

    @Test
    @DisplayName("getStudentFavorites should return only approved messes for student")
    void testGetStudentFavorites() {
        Favorite fav1 = Favorite.builder()
                .id(101L)
                .user(testUser)
                .mess(approvedMess)
                .createdAt(LocalDateTime.now())
                .build();

        Favorite fav2 = Favorite.builder()
                .id(102L)
                .user(testUser)
                .mess(pendingMess) // unapproved!
                .createdAt(LocalDateTime.now())
                .build();

        when(favoriteRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(fav1, fav2));

        List<FavoriteResponse> responses = favoriteService.getStudentFavorites(1L);

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getMessId()).isEqualTo(10L);
        assertThat(responses.get(0).getName()).isEqualTo("Shree Krishna Mess");
    }
}
