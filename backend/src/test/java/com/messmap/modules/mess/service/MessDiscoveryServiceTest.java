package com.messmap.modules.mess.service;

import com.messmap.common.exception.BadRequestException;
import com.messmap.common.exception.ResourceNotFoundException;
import com.messmap.modules.menu.entity.MealType;
import com.messmap.modules.menu.entity.MenuItem;
import com.messmap.modules.menu.repository.MenuItemRepository;
import com.messmap.modules.mess.dto.MessDetailResponse;
import com.messmap.modules.mess.dto.MessFilterRequest;
import com.messmap.modules.mess.dto.MessSummaryResponse;
import com.messmap.modules.mess.entity.FoodType;
import com.messmap.modules.mess.entity.Mess;
import com.messmap.modules.mess.entity.MessStatus;
import com.messmap.modules.mess.entity.OperatingStatus;
import com.messmap.modules.mess.repository.MessImageRepository;
import com.messmap.modules.mess.repository.MessRepository;
import com.messmap.modules.review.entity.ReviewStatus;
import com.messmap.modules.review.repository.ReviewRepository;
import com.messmap.modules.user.entity.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MessDiscoveryServiceTest {

    @Mock
    private MessRepository messRepository;

    @Mock
    private MessImageRepository messImageRepository;

    @Mock
    private MenuItemRepository menuItemRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @InjectMocks
    private MessDiscoveryService messDiscoveryService;

    @Test
    @DisplayName("resolveAndValidateFoodType should return correct enums for all valid categories")
    void testResolveAndValidateFoodTypeSuccess() {
        assertThat(messDiscoveryService.resolveAndValidateFoodType("VEG"))
                .containsExactlyInAnyOrder(FoodType.PURE_VEG, FoodType.JAIN_FRIENDLY);
        assertThat(messDiscoveryService.resolveAndValidateFoodType("pure_veg"))
                .containsExactly(FoodType.PURE_VEG);
        assertThat(messDiscoveryService.resolveAndValidateFoodType("NON_VEG"))
                .containsExactly(FoodType.VEG_AND_NON_VEG);
        assertThat(messDiscoveryService.resolveAndValidateFoodType("BOTH"))
                .containsExactly(FoodType.VEG_AND_NON_VEG);
        assertThat(messDiscoveryService.resolveAndValidateFoodType("JAIN_FRIENDLY"))
                .containsExactly(FoodType.JAIN_FRIENDLY);
        assertThat(messDiscoveryService.resolveAndValidateFoodType("ALL"))
                .isNull();
        assertThat(messDiscoveryService.resolveAndValidateFoodType(null))
                .isNull();
        assertThat(messDiscoveryService.resolveAndValidateFoodType("   "))
                .isNull();
    }

    @Test
    @DisplayName("resolveAndValidateFoodType should throw BadRequestException for unknown dietary input")
    void testResolveAndValidateFoodTypeInvalid() {
        assertThatThrownBy(() -> messDiscoveryService.resolveAndValidateFoodType("SEAFOOD_ONLY"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid foodType: 'SEAFOOD_ONLY'");
    }

    @Test
    @DisplayName("validatePriceRange should throw BadRequestException when minPrice is negative")
    void testValidatePriceRangeNegativeMinPrice() {
        assertThatThrownBy(() -> messDiscoveryService.validatePriceRange(new BigDecimal("-10.00"), new BigDecimal("100.00")))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("minPrice cannot be negative");
    }

    @Test
    @DisplayName("validatePriceRange should throw BadRequestException when maxPrice is negative")
    void testValidatePriceRangeNegativeMaxPrice() {
        assertThatThrownBy(() -> messDiscoveryService.validatePriceRange(new BigDecimal("10.00"), new BigDecimal("-50.00")))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("maxPrice cannot be negative");
    }

    @Test
    @DisplayName("validatePriceRange should throw BadRequestException when minPrice > maxPrice")
    void testValidatePriceRangeInverted() {
        assertThatThrownBy(() -> messDiscoveryService.validatePriceRange(new BigDecimal("500.00"), new BigDecimal("200.00")))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("cannot be greater than maxPrice");
    }

    @Test
    @DisplayName("getApprovedMessDetails should throw ResourceNotFoundException for nonexistent mess ID")
    void testGetApprovedMessDetailsNotFound() {
        when(messRepository.findByIdAndStatusWithDetails(99L, MessStatus.APPROVED))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> messDiscoveryService.getApprovedMessDetails(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Mess not found with id: 99");
    }

    @Test
    @DisplayName("getApprovedMessDetails should map active menu items and review statistics correctly")
    void testGetApprovedMessDetailsSuccess() {
        User owner = User.builder().name("Suresh Joshi").build();
        Mess mess = Mess.builder()
                .id(1L)
                .name("Shree Ganesh Mess")
                .owner(owner)
                .status(MessStatus.APPROVED)
                .foodType(FoodType.PURE_VEG)
                .city("Pune")
                .address("JM Road")
                .operatingStatus(OperatingStatus.OPEN)
                .build();

        MenuItem activeDish = MenuItem.builder()
                .id(10L)
                .name("Dal Tadka")
                .mealType(MealType.LUNCH)
                .isAvailable(true)
                .build();

        when(messRepository.findByIdAndStatusWithDetails(1L, MessStatus.APPROVED))
                .thenReturn(Optional.of(mess));
        when(menuItemRepository.findByMessIdAndIsAvailableTrue(1L))
                .thenReturn(List.of(activeDish));
        when(reviewRepository.findAverageRatingByMessId(1L))
                .thenReturn(Optional.of(4.65));
        when(reviewRepository.countByMessIdAndStatus(1L, ReviewStatus.PUBLISHED))
                .thenReturn(12L);

        MessDetailResponse response = messDiscoveryService.getApprovedMessDetails(1L);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getName()).isEqualTo("Shree Ganesh Mess");
        assertThat(response.getOwnerName()).isEqualTo("Suresh Joshi");
        assertThat(response.getRating()).isEqualTo(4.7);
        assertThat(response.getReviewCount()).isEqualTo(12);
        assertThat(response.getMenuItems()).hasSize(1);
        assertThat(response.getMenuItems().get(0).getName()).isEqualTo("Dal Tadka");
    }

    @Test
    @DisplayName("getApprovedMesses should query repository with Specification and map to summaries")
    void testGetApprovedMesses() {
        Mess mess = Mess.builder()
                .id(2L)
                .name("Campus Kitchen")
                .status(MessStatus.APPROVED)
                .foodType(FoodType.VEG_AND_NON_VEG)
                .city("Pune")
                .address("Law College Road")
                .operatingStatus(OperatingStatus.OPEN)
                .build();

        when(messRepository.findAll(any(Specification.class), any(Sort.class)))
                .thenReturn(List.of(mess));

        MessFilterRequest filter = MessFilterRequest.builder().city("Pune").build();
        List<MessSummaryResponse> result = messDiscoveryService.getApprovedMesses(filter);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Campus Kitchen");
    }
}
