package com.messmap.modules.menu.controller;

import com.messmap.common.dto.ApiResponse;
import com.messmap.modules.menu.dto.*;
import com.messmap.modules.menu.service.OwnerMenuService;
import com.messmap.modules.mess.dto.MenuItemDto;
import com.messmap.modules.user.entity.Role;
import com.messmap.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for authenticated Mess Owner daily & weekly menu management and pricing APIs.
 * Supports Issue #14 endpoints with both direct and /v1 versioned aliases.
 * Enforces role-based access control and strict server-side ownership authorization.
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@PreAuthorize("hasRole('MESS_OWNER') or hasRole('ADMIN')")
public class OwnerMenuController {

    private final OwnerMenuService ownerMenuService;

    /**
     * Retrieve the owner's menu grouped by day and meal type.
     * Routes: GET /api/owner/mess/menu, GET /api/v1/owner/mess/menu,
     *         GET /api/owner/mess/{id}/menu, GET /api/v1/owner/mess/{id}/menu
     */
    @GetMapping({
            "/api/owner/mess/menu",
            "/api/v1/owner/mess/menu",
            "/api/owner/mess/{id}/menu",
            "/api/v1/owner/mess/{id}/menu"
    })
    public ResponseEntity<ApiResponse<OwnerMenuResponse>> getOwnerMenu(
            @PathVariable(value = "id", required = false) Long pathMessId,
            @RequestParam(value = "messId", required = false) Long queryMessId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Long targetMessId = pathMessId != null ? pathMessId : queryMessId;
        boolean isAdmin = userPrincipal.getRole() == Role.ROLE_ADMIN;
        log.info("GET owner mess menu: ownerId={}, targetMessId={}, isAdmin={}", userPrincipal.getId(), targetMessId, isAdmin);

        OwnerMenuResponse response = ownerMenuService.getOwnerMenu(userPrincipal.getId(), targetMessId, isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Menu retrieved successfully", response));
    }

    /**
     * Add a dish to the owner's mess menu.
     * Routes: POST /api/owner/mess/menu/items, POST /api/v1/owner/mess/menu/items,
     *         POST /api/owner/mess/{id}/menu/items, POST /api/v1/owner/mess/{id}/menu/items
     */
    @PostMapping({
            "/api/owner/mess/menu/items",
            "/api/v1/owner/mess/menu/items",
            "/api/owner/mess/{id}/menu/items",
            "/api/v1/owner/mess/{id}/menu/items"
    })
    public ResponseEntity<ApiResponse<MenuItemDto>> addMenuItem(
            @PathVariable(value = "id", required = false) Long pathMessId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateMenuItemRequest request
    ) {
        if (pathMessId != null && request.getMessId() == null) {
            request.setMessId(pathMessId);
        }
        boolean isAdmin = userPrincipal.getRole() == Role.ROLE_ADMIN;
        log.info("POST owner menu item: ownerId={}, messId={}", userPrincipal.getId(), request.getMessId());

        MenuItemDto response = ownerMenuService.createMenuItem(userPrincipal.getId(), request, isAdmin);
        return new ResponseEntity<>(
                ApiResponse.success("Menu item created successfully", response),
                HttpStatus.CREATED
        );
    }

    /**
     * Update an existing dish in the owner's mess menu.
     * Routes: PUT /api/owner/mess/menu/items/{id}, PUT /api/v1/owner/mess/menu/items/{id}
     */
    @PutMapping({
            "/api/owner/mess/menu/items/{id}",
            "/api/v1/owner/mess/menu/items/{id}"
    })
    public ResponseEntity<ApiResponse<MenuItemDto>> updateMenuItem(
            @PathVariable("id") Long menuItemId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody UpdateMenuItemRequest request
    ) {
        boolean isAdmin = userPrincipal.getRole() == Role.ROLE_ADMIN;
        log.info("PUT owner menu item: ownerId={}, menuItemId={}, isAdmin={}", userPrincipal.getId(), menuItemId, isAdmin);

        MenuItemDto response = ownerMenuService.updateMenuItem(userPrincipal.getId(), menuItemId, request, isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Menu item updated successfully", response));
    }

    /**
     * Delete an existing dish from the owner's mess menu.
     * Routes: DELETE /api/owner/mess/menu/items/{id}, DELETE /api/v1/owner/mess/menu/items/{id}
     */
    @DeleteMapping({
            "/api/owner/mess/menu/items/{id}",
            "/api/v1/owner/mess/menu/items/{id}"
    })
    public ResponseEntity<ApiResponse<Void>> deleteMenuItem(
            @PathVariable("id") Long menuItemId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        boolean isAdmin = userPrincipal.getRole() == Role.ROLE_ADMIN;
        log.info("DELETE owner menu item: ownerId={}, menuItemId={}, isAdmin={}", userPrincipal.getId(), menuItemId, isAdmin);

        ownerMenuService.deleteMenuItem(userPrincipal.getId(), menuItemId, isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Menu item deleted successfully", null));
    }

    /**
     * Update meal and monthly-pass pricing.
     * Routes: PUT /api/owner/mess/pricing, PUT /api/v1/owner/mess/pricing,
     *         PUT /api/owner/mess/{id}/pricing, PUT /api/v1/owner/mess/{id}/pricing
     */
    @PutMapping({
            "/api/owner/mess/pricing",
            "/api/v1/owner/mess/pricing",
            "/api/owner/mess/{id}/pricing",
            "/api/v1/owner/mess/{id}/pricing"
    })
    public ResponseEntity<ApiResponse<MessPricingDto>> updatePricing(
            @PathVariable(value = "id", required = false) Long pathMessId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody UpdateMessPricingRequest request
    ) {
        boolean isAdmin = userPrincipal.getRole() == Role.ROLE_ADMIN;
        Long targetMessId = pathMessId != null ? pathMessId : request.getMessId();
        log.info("PUT owner mess pricing: ownerId={}, targetMessId={}, isAdmin={}", userPrincipal.getId(), targetMessId, isAdmin);

        MessPricingDto response = ownerMenuService.updateMessPricing(userPrincipal.getId(), targetMessId, request, isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Pricing updated successfully", response));
    }

    /**
     * Create or update daily meal menu (Breakfast, Lunch, or Dinner) for a specific day.
     * Routes: PUT /api/owner/mess/daily-menu, PUT /api/v1/owner/mess/daily-menu,
     *         PUT /api/owner/mess/{id}/daily-menu, PUT /api/v1/owner/mess/{id}/daily-menu
     */
    @PutMapping({
            "/api/owner/mess/daily-menu",
            "/api/v1/owner/mess/daily-menu",
            "/api/owner/mess/{id}/daily-menu",
            "/api/v1/owner/mess/{id}/daily-menu"
    })
    public ResponseEntity<ApiResponse<DailyMealResponse>> updateDailyMeal(
            @PathVariable(value = "id", required = false) Long pathMessId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody UpdateDailyMealRequest request
    ) {
        if (pathMessId != null && request.getMessId() == null) {
            request.setMessId(pathMessId);
        }
        boolean isAdmin = userPrincipal.getRole() == Role.ROLE_ADMIN;
        log.info("PUT owner daily meal: ownerId={}, messId={}, day={}, meal={}",
                userPrincipal.getId(), request.getMessId(), request.getDayOfWeek(), request.getMealType());

        DailyMealResponse response = ownerMenuService.updateDailyMealMenu(userPrincipal.getId(), request, isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Daily meal updated successfully", response));
    }

    /**
     * Retrieve daily meal menu for owner's mess.
     * Routes: GET /api/owner/mess/daily-menu, GET /api/v1/owner/mess/daily-menu,
     *         GET /api/owner/mess/{id}/daily-menu, GET /api/v1/owner/mess/{id}/daily-menu
     */
    @GetMapping({
            "/api/owner/mess/daily-menu",
            "/api/v1/owner/mess/daily-menu",
            "/api/owner/mess/{id}/daily-menu",
            "/api/v1/owner/mess/{id}/daily-menu"
    })
    public ResponseEntity<ApiResponse<DailyMealResponse>> getOwnerDailyMenu(
            @PathVariable(value = "id", required = false) Long pathMessId,
            @RequestParam(value = "messId", required = false) Long queryMessId,
            @RequestParam(value = "day", required = false) String day,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Long targetMessId = pathMessId != null ? pathMessId : queryMessId;
        boolean isAdmin = userPrincipal.getRole() == Role.ROLE_ADMIN;
        DailyMealResponse response = ownerMenuService.getOwnerDailyMenu(userPrincipal.getId(), targetMessId, day, isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Daily menu retrieved successfully", response));
    }

    /**
     * Retrieve weekly schedule for owner's mess.
     * Routes: GET /api/owner/mess/weekly-menu, GET /api/v1/owner/mess/weekly-menu,
     *         GET /api/owner/mess/{id}/weekly-menu, GET /api/v1/owner/mess/{id}/weekly-menu
     */
    @GetMapping({
            "/api/owner/mess/weekly-menu",
            "/api/v1/owner/mess/weekly-menu",
            "/api/owner/mess/{id}/weekly-menu",
            "/api/v1/owner/mess/{id}/weekly-menu"
    })
    public ResponseEntity<ApiResponse<WeeklyMenuResponse>> getOwnerWeeklyMenu(
            @PathVariable(value = "id", required = false) Long pathMessId,
            @RequestParam(value = "messId", required = false) Long queryMessId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Long targetMessId = pathMessId != null ? pathMessId : queryMessId;
        boolean isAdmin = userPrincipal.getRole() == Role.ROLE_ADMIN;
        WeeklyMenuResponse response = ownerMenuService.getOwnerWeeklyMenu(userPrincipal.getId(), targetMessId, isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Weekly menu retrieved successfully", response));
    }
}
