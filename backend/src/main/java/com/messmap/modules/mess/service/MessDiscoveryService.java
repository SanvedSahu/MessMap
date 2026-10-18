package com.messmap.modules.mess.service;

import com.messmap.common.exception.BadRequestException;
import com.messmap.common.exception.ResourceNotFoundException;
import com.messmap.modules.menu.entity.MenuItem;
import com.messmap.modules.menu.repository.MenuItemRepository;
import com.messmap.modules.mess.dto.*;
import com.messmap.modules.mess.entity.FoodType;
import com.messmap.modules.mess.entity.Mess;
import com.messmap.modules.mess.entity.MessImage;
import com.messmap.modules.mess.entity.MessStatus;
import com.messmap.modules.mess.repository.MessImageRepository;
import com.messmap.modules.mess.repository.MessRepository;
import com.messmap.modules.mess.repository.MessSpecification;
import com.messmap.modules.review.entity.ReviewStatus;
import com.messmap.modules.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collections;
import java.util.List;

/**
 * Service orchestrating approved mess discovery, search/filtering, and detailed listing retrieval.
 * Enforces APPROVED-only visibility and prevents N+1 query overhead.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MessDiscoveryService {

    private final MessRepository messRepository;
    private final MessImageRepository messImageRepository;
    private final MenuItemRepository menuItemRepository;
    private final ReviewRepository reviewRepository;

    /**
     * Discovers approved messes matching optional filter criteria.
     *
     * @param filter Filter criteria (search, foodType, locality, city, minPrice, maxPrice)
     * @return List of matching approved messes as summary DTOs
     */
    public List<MessSummaryResponse> getApprovedMesses(MessFilterRequest filter) {
        log.info("Executing approved mess discovery query with filters: {}", filter);

        List<FoodType> allowedFoodTypes = null;
        if (filter != null) {
            allowedFoodTypes = resolveAndValidateFoodType(filter.getFoodType());
            validatePriceRange(filter.getMinPrice(), filter.getMaxPrice());
        }

        Specification<Mess> spec = MessSpecification.withFilters(filter, allowedFoodTypes);
        List<Mess> messes = messRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "name"));

        return messes.stream()
                .map(this::mapToSummaryResponse)
                .toList();
    }

    /**
     * Discovers approved messes with pagination support.
     *
     * @param filter   Filter criteria
     * @param pageable Pagination configuration
     * @return Page of matching approved messes
     */
    public Page<MessSummaryResponse> getApprovedMessesPaged(MessFilterRequest filter, Pageable pageable) {
        log.info("Executing paged approved mess discovery query: page={}, size={}", pageable.getPageNumber(), pageable.getPageSize());

        List<FoodType> allowedFoodTypes = null;
        if (filter != null) {
            allowedFoodTypes = resolveAndValidateFoodType(filter.getFoodType());
            validatePriceRange(filter.getMinPrice(), filter.getMaxPrice());
        }

        Specification<Mess> spec = MessSpecification.withFilters(filter, allowedFoodTypes);
        Page<Mess> page = messRepository.findAll(spec, pageable);

        return page.map(this::mapToSummaryResponse);
    }

    /**
     * Retrieves comprehensive listing details for an approved mess.
     * Nonexistent messes or messes in PENDING, REJECTED, SUSPENDED, or UNDER_REVIEW status produce 404.
     *
     * @param id Mess identifier
     * @return Detailed mess profile including active menus and timings
     */
    public MessDetailResponse getApprovedMessDetails(Long id) {
        log.info("Fetching details for approved mess id={}", id);

        Mess mess = messRepository.findByIdAndStatusWithDetails(id, MessStatus.APPROVED)
                .orElseThrow(() -> {
                    log.warn("Mess not found or not approved with id={}", id);
                    return new ResourceNotFoundException("Mess not found with id: " + id);
                });

        // Fetch active menu items only (is_available = true)
        List<MenuItem> activeMenuItems = menuItemRepository.findByMessIdAndIsAvailableTrue(id);
        List<MenuItemDto> menuItemDtos = activeMenuItems.stream()
                .map(this::mapToMenuItemDto)
                .toList();

        // Fetch review statistics
        Double avgRating = reviewRepository.findAverageRatingByMessId(id).orElse(null);
        if (avgRating != null) {
            avgRating = BigDecimal.valueOf(avgRating)
                    .setScale(1, RoundingMode.HALF_UP)
                    .doubleValue();
        }
        long reviewCount = reviewRepository.countByMessIdAndStatus(id, ReviewStatus.PUBLISHED);

        // Map facilities
        List<FacilityDto> facilities = mess.getFacilities() != null
                ? mess.getFacilities().stream()
                .map(f -> FacilityDto.builder()
                        .id(f.getId())
                        .name(f.getName())
                        .icon(f.getIcon())
                        .build())
                .toList()
                : Collections.emptyList();

        // Fetch images from relationship or image repository
        List<MessImage> imagesList = (mess.getImages() != null && !mess.getImages().isEmpty())
                ? mess.getImages()
                : messImageRepository.findByMessId(id);

        List<MessImageDto> imageDtos = imagesList.stream()
                .map(img -> MessImageDto.builder()
                        .id(img.getId())
                        .imageUrl(img.getImageUrl())
                        .isPrimary(img.getIsPrimary())
                        .caption(img.getCaption())
                        .build())
                .toList();

        List<String> gallery = imagesList.stream()
                .map(MessImage::getImageUrl)
                .toList();

        // Structured meal timings
        MealTimingsDto mealTimings = MealTimingsDto.builder()
                .breakfast(mess.getBreakfastTiming() != null ? mess.getBreakfastTiming() : (mess.getOpeningTime() != null ? mess.getOpeningTime() : "07:30 AM – 10:00 AM"))
                .lunch(mess.getLunchTiming() != null ? mess.getLunchTiming() : "12:15 PM – 03:00 PM")
                .dinner(mess.getDinnerTiming() != null ? mess.getDinnerTiming() : (mess.getClosingTime() != null ? ("07:30 PM – " + mess.getClosingTime()) : "07:30 PM – 10:15 PM"))
                .build();

        return MessDetailResponse.builder()
                .id(mess.getId())
                .name(mess.getName())
                .description(mess.getDescription())
                .phone(mess.getPhone())
                .email(mess.getEmail())
                .address(mess.getAddress())
                .area(mess.getArea())
                .city(mess.getCity())
                .state(mess.getState())
                .pincode(mess.getPincode())
                .latitude(mess.getLatitude())
                .longitude(mess.getLongitude())
                .foodType(mess.getFoodType())
                .dailyPrice(mess.getDailyPrice())
                .monthlyPrice(mess.getMonthlyPrice())
                .status(mess.getStatus().name())
                .operatingStatus(mess.getOperatingStatus())
                .openingTime(mess.getOpeningTime())
                .closingTime(mess.getClosingTime())
                .mealTimings(mealTimings)
                .heroImage(resolveHeroImage(mess, gallery))
                .capacity(mess.getCapacity())
                .ownerName(mess.getOwner() != null ? mess.getOwner().getName() : null)
                .facilities(facilities)
                .images(imageDtos)
                .gallery(gallery)
                .menuItems(menuItemDtos)
                .rating(avgRating)
                .reviewCount((int) reviewCount)
                .build();
    }

    /**
     * Validates and resolves incoming dietary category filters.
     *
     * @param foodTypeStr Input dietary filter string
     * @return Target list of enum values or null if unfiltered
     */
    public List<FoodType> resolveAndValidateFoodType(String foodTypeStr) {
        if (foodTypeStr == null || foodTypeStr.trim().isEmpty() || foodTypeStr.equalsIgnoreCase("ALL")) {
            return null;
        }

        String cleaned = foodTypeStr.trim().toUpperCase();
        switch (cleaned) {
            case "VEG":
                return List.of(FoodType.PURE_VEG, FoodType.JAIN_FRIENDLY);
            case "PURE_VEG":
                return List.of(FoodType.PURE_VEG);
            case "JAIN_FRIENDLY":
            case "JAIN":
                return List.of(FoodType.JAIN_FRIENDLY);
            case "NON_VEG":
            case "NONVEG":
            case "BOTH":
            case "VEG_AND_NON_VEG":
                return List.of(FoodType.VEG_AND_NON_VEG);
            default:
                throw new BadRequestException("Invalid foodType: '" + foodTypeStr +
                        "'. Allowed values are: VEG, NON_VEG, BOTH, PURE_VEG, VEG_AND_NON_VEG, JAIN_FRIENDLY, ALL");
        }
    }

    /**
     * Validates that price constraints are positive and well-formed.
     *
     * @param minPrice Minimum price
     * @param maxPrice Maximum price
     */
    public void validatePriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        if (minPrice != null && minPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("minPrice cannot be negative: " + minPrice);
        }
        if (maxPrice != null && maxPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("maxPrice cannot be negative: " + maxPrice);
        }
        if (minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0) {
            throw new BadRequestException("minPrice (" + minPrice + ") cannot be greater than maxPrice (" + maxPrice + ")");
        }
    }

    private MessSummaryResponse mapToSummaryResponse(Mess mess) {
        List<FacilityDto> facilities = mess.getFacilities() != null
                ? mess.getFacilities().stream()
                .map(f -> FacilityDto.builder()
                        .id(f.getId())
                        .name(f.getName())
                        .icon(f.getIcon())
                        .build())
                .toList()
                : Collections.emptyList();

        List<String> gallery = mess.getImages() != null
                ? mess.getImages().stream()
                .map(MessImage::getImageUrl)
                .toList()
                : Collections.emptyList();

        return MessSummaryResponse.builder()
                .id(mess.getId())
                .name(mess.getName())
                .description(mess.getDescription())
                .phone(mess.getPhone())
                .email(mess.getEmail())
                .address(mess.getAddress())
                .area(mess.getArea())
                .city(mess.getCity())
                .state(mess.getState())
                .pincode(mess.getPincode())
                .latitude(mess.getLatitude())
                .longitude(mess.getLongitude())
                .foodType(mess.getFoodType())
                .dailyPrice(mess.getDailyPrice())
                .monthlyPrice(mess.getMonthlyPrice())
                .status(mess.getStatus().name())
                .operatingStatus(mess.getOperatingStatus())
                .openingTime(mess.getOpeningTime())
                .closingTime(mess.getClosingTime())
                .heroImage(resolveHeroImage(mess, gallery))
                .capacity(mess.getCapacity())
                .facilities(facilities)
                .gallery(gallery)
                .build();
    }

    private MenuItemDto mapToMenuItemDto(MenuItem item) {
        return MenuItemDto.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .mealType(item.getMealType())
                .price(item.getPrice())
                .isAvailable(item.getIsAvailable())
                .dayOfWeek(item.getDayOfWeek())
                .build();
    }

    private String resolveHeroImage(Mess mess, List<String> gallery) {
        if (mess.getHeroImage() != null && !mess.getHeroImage().trim().isEmpty()) {
            return mess.getHeroImage();
        }
        if (gallery != null && !gallery.isEmpty()) {
            return gallery.get(0);
        }
        return null;
    }
}
