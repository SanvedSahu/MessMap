package com.messmap.modules.mess.controller;

import com.messmap.common.dto.ApiResponse;
import com.messmap.common.exception.BadRequestException;
import com.messmap.modules.mess.dto.MessDetailResponse;
import com.messmap.modules.mess.dto.MessFilterRequest;
import com.messmap.modules.mess.dto.MessSummaryResponse;
import com.messmap.modules.mess.service.MessDiscoveryService;
import com.messmap.modules.menu.dto.DailyMealResponse;
import com.messmap.modules.menu.dto.WeeklyMenuResponse;
import com.messmap.modules.menu.service.OwnerMenuService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Public REST controller for mess discovery, search/filtering, and detailed listing retrieval.
 * Supports both standard (/api/messes) and versioned (/api/v1/messes) route patterns.
 */
@Slf4j
@RestController
@RequiredArgsConstructor
public class MessController {

    private final MessDiscoveryService messDiscoveryService;
    private final OwnerMenuService ownerMenuService;

    /**
     * Search and discover approved messes with optional multi-criteria filters.
     * Accessible via GET /api/messes and GET /api/v1/messes.
     *
     * @param search   Search keyword for mess name, area, or address
     * @param foodType Dietary filter (VEG, NON_VEG, BOTH, PURE_VEG, VEG_AND_NON_VEG, JAIN_FRIENDLY)
     * @param locality Locality filter for area or street
     * @param city     City name (case-insensitive)
     * @param minPrice Minimum monthly or daily price
     * @param maxPrice Maximum monthly or daily price
     * @param page     Optional 0-indexed page number
     * @param size     Optional page size
     * @return Standardized ApiResponse wrapping list of approved messes
     */
    @GetMapping({"/api/messes", "/api/v1/messes"})
    public ResponseEntity<ApiResponse<List<MessSummaryResponse>>> getMesses(
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "foodType", required = false) String foodType,
            @RequestParam(name = "locality", required = false) String locality,
            @RequestParam(name = "city", required = false) String city,
            @RequestParam(name = "minPrice", required = false) BigDecimal minPrice,
            @RequestParam(name = "maxPrice", required = false) BigDecimal maxPrice,
            @RequestParam(name = "includeClosed", required = false) Boolean includeClosed,
            @RequestParam(name = "page", required = false) Integer page,
            @RequestParam(name = "size", required = false) Integer size
    ) {
        log.info("GET /api/messes: search='{}', foodType='{}', locality='{}', city='{}', minPrice={}, maxPrice={}, includeClosed={}, page={}, size={}",
                search, foodType, locality, city, minPrice, maxPrice, includeClosed, page, size);

        MessFilterRequest filter = MessFilterRequest.builder()
                .search(search)
                .foodType(foodType)
                .locality(locality)
                .city(city)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .includeClosed(includeClosed)
                .build();

        if (page != null || size != null) {
            int pageNumber = page != null ? page : 0;
            int pageSize = size != null ? size : 20;

            if (pageNumber < 0) {
                throw new BadRequestException("Page index cannot be negative");
            }
            if (pageSize <= 0) {
                throw new BadRequestException("Page size must be greater than zero");
            }

            Page<MessSummaryResponse> pagedResult = messDiscoveryService.getApprovedMessesPaged(
                    filter,
                    PageRequest.of(pageNumber, pageSize, Sort.by(Sort.Direction.ASC, "name"))
            );

            return ResponseEntity.ok(ApiResponse.success(
                    "Approved messes retrieved successfully (Page " + (pageNumber + 1) + " of " + pagedResult.getTotalPages() + ")",
                    pagedResult.getContent()
            ));
        }

        List<MessSummaryResponse> messes = messDiscoveryService.getApprovedMesses(filter);
        return ResponseEntity.ok(ApiResponse.success("Approved messes retrieved successfully", messes));
    }

    /**
     * Discover nearby approved messes based on student device latitude, longitude, and radius.
     * Routes: GET /api/messes/nearby, GET /api/v1/messes/nearby
     *
     * @param latitude   Search origin latitude (-90 to 90)
     * @param longitude  Search origin longitude (-180 to 180)
     * @param radiusKm   Search radius in kilometers (default 5.0, must be > 0 and <= 100)
     * @param search     Optional keyword search
     * @param foodType   Optional dietary filter
     * @param minPrice   Optional minimum price
     * @param maxPrice   Optional maximum price
     * @param includeClosed Optional flag to include closed messes
     * @return List of nearby messes ordered by distance from nearest to farthest
     */
    @GetMapping({"/api/messes/nearby", "/api/v1/messes/nearby"})
    public ResponseEntity<ApiResponse<List<MessSummaryResponse>>> getNearbyMesses(
            @RequestParam(name = "latitude") Double latitude,
            @RequestParam(name = "longitude") Double longitude,
            @RequestParam(name = "radiusKm", required = false, defaultValue = "5.0") Double radiusKm,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "foodType", required = false) String foodType,
            @RequestParam(name = "minPrice", required = false) BigDecimal minPrice,
            @RequestParam(name = "maxPrice", required = false) BigDecimal maxPrice,
            @RequestParam(name = "includeClosed", required = false) Boolean includeClosed
    ) {
        log.info("GET /api/messes/nearby: lat={}, lng={}, radiusKm={}, search='{}', foodType='{}'",
                latitude, longitude, radiusKm, search, foodType);

        MessFilterRequest filter = MessFilterRequest.builder()
                .search(search)
                .foodType(foodType)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .includeClosed(includeClosed)
                .build();

        List<MessSummaryResponse> nearbyMesses = messDiscoveryService.getNearbyApprovedMesses(
                latitude, longitude, radiusKm, filter
        );

        return ResponseEntity.ok(ApiResponse.success(
                "Nearby approved messes retrieved successfully (" + nearbyMesses.size() + " found within " + (radiusKm != null ? radiusKm : 5.0) + " km)",
                nearbyMesses
        ));
    }

    /**
     * Retrieve full profile details and active menu items for a specific approved mess.
     * Accessible via GET /api/messes/{id} and GET /api/v1/messes/{id}.
     * Returns 404 for nonexistent messes and unapproved (PENDING, REJECTED, SUSPENDED) messes.
     *
     * @param id Mess primary key
     * @return Detailed mess profile
     */
    @GetMapping({"/api/messes/{id}", "/api/v1/messes/{id}"})
    public ResponseEntity<ApiResponse<MessDetailResponse>> getMessById(@PathVariable("id") Long id) {
        log.info("GET /api/messes/{}", id);
        MessDetailResponse messDetails = messDiscoveryService.getApprovedMessDetails(id);
        return ResponseEntity.ok(ApiResponse.success("Mess details retrieved successfully", messDetails));
    }

    /**
     * Retrieve daily meal menu for a specific approved mess.
     * Accessible via GET /api/messes/{id}/daily-menu and GET /api/v1/messes/{id}/daily-menu.
     *
     * @param id  Mess primary key
     * @param day Optional day of week (MONDAY..SUNDAY), defaults to today or MONDAY
     * @return DailyMealResponse with breakfast, lunch, and dinner
     */
    @GetMapping({"/api/messes/{id}/daily-menu", "/api/v1/messes/{id}/daily-menu"})
    public ResponseEntity<ApiResponse<DailyMealResponse>> getMessDailyMenu(
            @PathVariable("id") Long id,
            @RequestParam(name = "day", required = false) String day
    ) {
        log.info("GET /api/messes/{}/daily-menu?day={}", id, day);
        DailyMealResponse response = ownerMenuService.getMessDailyMenu(id, day);
        return ResponseEntity.ok(ApiResponse.success("Daily menu retrieved successfully", response));
    }

    /**
     * Retrieve 7-day weekly menu schedule for a specific approved mess.
     * Accessible via GET /api/messes/{id}/weekly-menu and GET /api/v1/messes/{id}/weekly-menu.
     *
     * @param id Mess primary key
     * @return WeeklyMenuResponse with all 7 days
     */
    @GetMapping({"/api/messes/{id}/weekly-menu", "/api/v1/messes/{id}/weekly-menu"})
    public ResponseEntity<ApiResponse<WeeklyMenuResponse>> getMessWeeklyMenu(@PathVariable("id") Long id) {
        log.info("GET /api/messes/{}/weekly-menu", id);
        WeeklyMenuResponse response = ownerMenuService.getMessWeeklyMenu(id);
        return ResponseEntity.ok(ApiResponse.success("Weekly menu retrieved successfully", response));
    }
}
