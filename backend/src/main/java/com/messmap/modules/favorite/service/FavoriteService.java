package com.messmap.modules.favorite.service;

import com.messmap.common.exception.ResourceNotFoundException;
import com.messmap.modules.favorite.dto.FavoriteResponse;
import com.messmap.modules.favorite.entity.Favorite;
import com.messmap.modules.favorite.repository.FavoriteRepository;
import com.messmap.modules.mess.dto.FacilityDto;
import com.messmap.modules.mess.dto.MessSummaryResponse;
import com.messmap.modules.mess.entity.Mess;
import com.messmap.modules.mess.entity.MessImage;
import com.messmap.modules.mess.entity.MessStatus;
import com.messmap.modules.mess.repository.MessRepository;
import com.messmap.modules.review.entity.ReviewStatus;
import com.messmap.modules.review.repository.ReviewRepository;
import com.messmap.modules.user.entity.User;
import com.messmap.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

/**
 * Service managing student mess favorites and bookmarks.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final MessRepository messRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;

    /**
     * Add an approved mess to the student's favorites list.
     * Handled idempotently: if already favorited, returns existing favorite without error.
     *
     * @param userId Authenticated student user ID
     * @param messId Mess primary key
     * @return AddFavoriteResult containing FavoriteResponse and boolean created flag
     */
    public AddFavoriteResult addFavorite(Long userId, Long messId) {
        log.info("Adding mess id={} to favorites for user id={}", messId, userId);

        Mess mess = messRepository.findById(messId)
                .orElseThrow(() -> new ResourceNotFoundException("Mess not found with id: " + messId));

        if (mess.getStatus() != MessStatus.APPROVED) {
            log.warn("Attempt to favorite unapproved mess id={} with status={}", messId, mess.getStatus());
            throw new ResourceNotFoundException("Mess not found with id: " + messId);
        }

        Optional<Favorite> existing = favoriteRepository.findByUserIdAndMessId(userId, messId);
        if (existing.isPresent()) {
            log.info("Mess id={} already in favorites for user id={}", messId, userId);
            return new AddFavoriteResult(mapToResponse(existing.get()), false);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Favorite favorite = Favorite.builder()
                .user(user)
                .mess(mess)
                .build();

        Favorite saved = favoriteRepository.save(favorite);
        log.info("Saved new favorite id={} for user id={} and mess id={}", saved.getId(), userId, messId);
        return new AddFavoriteResult(mapToResponse(saved), true);
    }

    /**
     * Remove a mess from student's favorites list.
     * Idempotent: succeeds whether the favorite previously existed or not.
     *
     * @param userId Authenticated student user ID
     * @param messId Mess primary key
     */
    public void removeFavorite(Long userId, Long messId) {
        log.info("Removing mess id={} from favorites for user id={}", messId, userId);
        favoriteRepository.deleteByUserIdAndMessId(userId, messId);
    }

    /**
     * Retrieve all approved bookmarked messes for the authenticated student.
     *
     * @param userId Authenticated student user ID
     * @return List of student's favorite messes
     */
    @Transactional(readOnly = true)
    public List<FavoriteResponse> getStudentFavorites(Long userId) {
        log.info("Retrieving favorite messes for user id={}", userId);

        List<Favorite> favorites = favoriteRepository.findByUserIdOrderByCreatedAtDesc(userId);

        return favorites.stream()
                .filter(f -> f.getMess() != null && f.getMess().getStatus() == MessStatus.APPROVED)
                .map(this::mapToResponse)
                .toList();
    }

    public record AddFavoriteResult(FavoriteResponse response, boolean created) {}

    private FavoriteResponse mapToResponse(Favorite favorite) {
        Mess mess = favorite.getMess();

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

        Double avgRating = reviewRepository.findAverageRatingByMessId(mess.getId()).orElse(null);
        if (avgRating != null) {
            avgRating = BigDecimal.valueOf(avgRating)
                    .setScale(1, RoundingMode.HALF_UP)
                    .doubleValue();
        }
        long reviewCount = reviewRepository.countByMessIdAndStatus(mess.getId(), ReviewStatus.PUBLISHED);

        String heroImage = (mess.getHeroImage() != null && !mess.getHeroImage().trim().isEmpty())
                ? mess.getHeroImage()
                : (!gallery.isEmpty() ? gallery.get(0) : null);

        MessSummaryResponse summary = MessSummaryResponse.builder()
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
                .heroImage(heroImage)
                .capacity(mess.getCapacity())
                .facilities(facilities)
                .gallery(gallery)
                .rating(avgRating)
                .reviewCount((int) reviewCount)
                .build();

        return FavoriteResponse.builder()
                .favoriteId(favorite.getId())
                .favoritedAt(favorite.getCreatedAt())
                .id(mess.getId())
                .messId(mess.getId())
                .name(mess.getName())
                .messName(mess.getName())
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
                .heroImage(heroImage)
                .capacity(mess.getCapacity())
                .facilities(facilities)
                .gallery(gallery)
                .rating(avgRating)
                .reviewCount((int) reviewCount)
                .mess(summary)
                .build();
    }
}
