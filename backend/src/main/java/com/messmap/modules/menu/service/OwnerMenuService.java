package com.messmap.modules.menu.service;

import com.messmap.common.exception.BadRequestException;
import com.messmap.common.exception.ResourceNotFoundException;
import com.messmap.modules.menu.dto.*;
import com.messmap.modules.menu.entity.MealType;
import com.messmap.modules.menu.entity.MenuItem;
import com.messmap.modules.menu.repository.MenuItemRepository;
import com.messmap.modules.mess.dto.MenuItemDto;
import com.messmap.modules.mess.entity.Mess;
import com.messmap.modules.mess.repository.MessRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

/**
 * Service managing Mess Owner daily and weekly menus, dish CRUD operations,
 * and meal pricing with strict server-side ownership authorization.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OwnerMenuService {

    private final MenuItemRepository menuItemRepository;
    private final MessRepository messRepository;

    private static final List<String> STANDARD_DAYS = List.of(
            "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"
    );

    /**
     * Retrieve the owner's menu catalog grouped by day of week and meal type,
     * alongside current meal and pass pricing.
     */
    @Transactional(readOnly = true)
    public OwnerMenuResponse getOwnerMenu(Long ownerId, Long messId, boolean isAdmin) {
        log.info("Fetching menu for owner id={}, messId={}, isAdmin={}", ownerId, messId, isAdmin);
        Mess mess = resolveTargetMess(ownerId, messId, isAdmin, "view menu");

        List<MenuItem> items = menuItemRepository.findByMessIdOrderByDayOfWeekAscMealTypeAscNameAsc(mess.getId());
        List<MenuItemDto> itemDtos = items.stream()
                .map(MenuItemDto::fromEntity)
                .toList();

        // Build structured grouped menu: dayOfWeek -> mealType -> items
        Map<String, Map<String, List<MenuItemDto>>> groupedMenu = new LinkedHashMap<>();
        for (String day : STANDARD_DAYS) {
            groupedMenu.put(day, new LinkedHashMap<>());
        }

        for (MenuItemDto dto : itemDtos) {
            String day = dto.getDayOfWeek() != null ? dto.getDayOfWeek().trim().toUpperCase() : "MONDAY";
            groupedMenu.computeIfAbsent(day, k -> new LinkedHashMap<>());

            String meal = dto.getMealType() != null ? dto.getMealType().name() : "LUNCH";
            groupedMenu.get(day).computeIfAbsent(meal, k -> new ArrayList<>()).add(dto);
        }

        // Build weeklyMenu list representation
        List<DayMenuDto> weeklyMenu = new ArrayList<>();
        for (Map.Entry<String, Map<String, List<MenuItemDto>>> entry : groupedMenu.entrySet()) {
            weeklyMenu.add(DayMenuDto.builder()
                    .dayOfWeek(entry.getKey())
                    .meals(entry.getValue())
                    .build());
        }

        return OwnerMenuResponse.builder()
                .messId(mess.getId())
                .messName(mess.getName())
                .pricing(MessPricingDto.fromMess(mess))
                .groupedMenu(groupedMenu)
                .weeklyMenu(weeklyMenu)
                .items(itemDtos)
                .build();
    }

    /**
     * Add a new dish to the owner's mess menu.
     */
    @Transactional
    public MenuItemDto createMenuItem(Long ownerId, CreateMenuItemRequest request, boolean isAdmin) {
        log.info("Adding menu item for owner id={}, messId={}", ownerId, request.getMessId());
        Mess mess = resolveTargetMess(ownerId, request.getMessId(), isAdmin, "add menu item");

        String dishName = request.getEffectiveDishName();
        if (dishName == null || dishName.isBlank()) {
            throw new BadRequestException("Dish name is required and cannot be blank");
        }

        String dayOfWeek = normalizeAndValidateDayOfWeek(request.getDayOfWeek());
        MealType mealType = request.getMealType();
        validateOwnerMealType(mealType);

        if (request.getPrice() != null && request.getPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Price cannot be negative");
        }

        MenuItem menuItem = MenuItem.builder()
                .mess(mess)
                .name(dishName)
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .mealType(mealType)
                .price(request.getPrice())
                .isAvailable(request.getEffectiveIsAvailable())
                .isSpecial(request.getEffectiveIsSpecial())
                .dayOfWeek(dayOfWeek)
                .build();

        MenuItem saved = menuItemRepository.save(menuItem);
        log.info("Successfully created menu item id={} for mess id={}", saved.getId(), mess.getId());
        return MenuItemDto.fromEntity(saved);
    }

    /**
     * Update an existing dish in the owner's mess menu.
     * Enforces ownership authorization on the dish's associated mess.
     */
    @Transactional
    public MenuItemDto updateMenuItem(Long ownerId, Long menuItemId, UpdateMenuItemRequest request, boolean isAdmin) {
        log.info("Updating menu item id={} by owner id={}, isAdmin={}", menuItemId, ownerId, isAdmin);
        MenuItem menuItem = menuItemRepository.findByIdWithMessAndOwner(menuItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: '" + menuItemId + "'"));

        enforceOwnership(menuItem.getMess(), ownerId, isAdmin, "update menu item");

        if (request.getDishName() != null || request.getName() != null) {
            String dishName = request.getEffectiveDishName();
            if (dishName == null || dishName.isBlank()) {
                throw new BadRequestException("Dish name cannot be blank");
            }
            menuItem.setName(dishName);
        }

        if (request.getDayOfWeek() != null) {
            menuItem.setDayOfWeek(normalizeAndValidateDayOfWeek(request.getDayOfWeek()));
        }

        if (request.getMealType() != null) {
            validateOwnerMealType(request.getMealType());
            menuItem.setMealType(request.getMealType());
        }

        if (request.getDescription() != null) {
            menuItem.setDescription(request.getDescription().trim());
        }

        if (request.getPrice() != null) {
            if (request.getPrice().compareTo(BigDecimal.ZERO) < 0) {
                throw new BadRequestException("Price cannot be negative");
            }
            menuItem.setPrice(request.getPrice());
        }

        if (request.getIsAvailable() != null) {
            menuItem.setIsAvailable(request.getIsAvailable());
        }

        if (request.getIsSpecial() != null) {
            menuItem.setIsSpecial(request.getIsSpecial());
        }

        MenuItem updated = menuItemRepository.save(menuItem);
        log.info("Successfully updated menu item id={}", updated.getId());
        return MenuItemDto.fromEntity(updated);
    }

    /**
     * Delete an existing dish from the owner's mess menu.
     * Enforces ownership authorization on the dish's associated mess.
     */
    @Transactional
    public void deleteMenuItem(Long ownerId, Long menuItemId, boolean isAdmin) {
        log.info("Deleting menu item id={} by owner id={}, isAdmin={}", menuItemId, ownerId, isAdmin);
        MenuItem menuItem = menuItemRepository.findByIdWithMessAndOwner(menuItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: '" + menuItemId + "'"));

        enforceOwnership(menuItem.getMess(), ownerId, isAdmin, "delete menu item");

        menuItemRepository.delete(menuItem);
        log.info("Successfully deleted menu item id={}", menuItemId);
    }

    /**
     * Update mess meal and monthly-pass pricing.
     */
    @Transactional
    public MessPricingDto updateMessPricing(Long ownerId, Long messId, UpdateMessPricingRequest request, boolean isAdmin) {
        Long targetMessId = messId != null ? messId : request.getMessId();
        log.info("Updating mess pricing: owner id={}, targetMessId={}, isAdmin={}", ownerId, targetMessId, isAdmin);
        Mess mess = resolveTargetMess(ownerId, targetMessId, isAdmin, "update pricing");

        if (request.getBreakfastPrice() != null) {
            if (request.getBreakfastPrice().compareTo(BigDecimal.ZERO) < 0) {
                throw new BadRequestException("Breakfast price cannot be negative");
            }
            mess.setBreakfastPrice(request.getBreakfastPrice());
        }

        if (request.getLunchPrice() != null) {
            if (request.getLunchPrice().compareTo(BigDecimal.ZERO) < 0) {
                throw new BadRequestException("Lunch price cannot be negative");
            }
            mess.setLunchPrice(request.getLunchPrice());
        }

        if (request.getDinnerPrice() != null) {
            if (request.getDinnerPrice().compareTo(BigDecimal.ZERO) < 0) {
                throw new BadRequestException("Dinner price cannot be negative");
            }
            mess.setDinnerPrice(request.getDinnerPrice());
        }

        if (request.getDailyPrice() != null) {
            if (request.getDailyPrice().compareTo(BigDecimal.ZERO) < 0) {
                throw new BadRequestException("Daily price cannot be negative");
            }
            mess.setDailyPrice(request.getDailyPrice());
        }

        BigDecimal effectiveMonthlyPrice = request.getEffectiveMonthlyPrice();
        if (effectiveMonthlyPrice != null) {
            if (effectiveMonthlyPrice.compareTo(BigDecimal.ZERO) < 0) {
                throw new BadRequestException("Monthly price cannot be negative");
            }
            mess.setMonthlyPrice(effectiveMonthlyPrice);
        }

        Mess updated = messRepository.save(mess);
        log.info("Successfully updated pricing for mess id={}", updated.getId());
        return MessPricingDto.fromMess(updated);
    }

    /**
     * Helper to resolve the target mess either by primary key or from the authenticated owner's listings.
     */
    private Mess resolveTargetMess(Long ownerId, Long messId, boolean isAdmin, String action) {
        Mess mess;
        if (messId != null) {
            mess = messRepository.findByIdWithDetails(messId)
                    .orElseThrow(() -> new ResourceNotFoundException("Mess not found with id: '" + messId + "'"));
            enforceOwnership(mess, ownerId, isAdmin, action);
        } else {
            List<Mess> messes = messRepository.findByOwnerIdWithDetails(ownerId);
            if (messes.isEmpty()) {
                throw new ResourceNotFoundException("No mess listing found for owner id: " + ownerId);
            }
            mess = messes.get(0);
        }
        return mess;
    }

    /**
     * Server-side authorization check ensuring an owner can only access or modify their own mess data.
     * Rejects access with HTTP 403 Forbidden (AccessDeniedException).
     */
    private void enforceOwnership(Mess mess, Long ownerId, boolean isAdmin, String action) {
        if (!isAdmin && (mess.getOwner() == null || !mess.getOwner().getId().equals(ownerId))) {
            log.warn("Unauthorized menu access attempt: actor id={} attempted to {} for mess id={} owned by id={}",
                    ownerId, action, mess.getId(), mess.getOwner() != null ? mess.getOwner().getId() : "null");
            throw new AccessDeniedException("Access denied: You are not authorized to " + action + " for another owner's mess.");
        }
    }

    /**
     * Normalizes and validates day of week input string.
     */
    public String normalizeAndValidateDayOfWeek(String input) {
        if (input == null || input.trim().isEmpty()) {
            throw new BadRequestException("Day of week is required and cannot be blank");
        }
        String normalized = input.trim().toUpperCase();
        return switch (normalized) {
            case "MONDAY", "MON" -> "MONDAY";
            case "TUESDAY", "TUE" -> "TUESDAY";
            case "WEDNESDAY", "WED" -> "WEDNESDAY";
            case "THURSDAY", "THU" -> "THURSDAY";
            case "FRIDAY", "FRI" -> "FRIDAY";
            case "SATURDAY", "SAT" -> "SATURDAY";
            case "SUNDAY", "SUN" -> "SUNDAY";
            case "ALL", "DAILY", "EVERYDAY" -> "ALL";
            default -> throw new BadRequestException("Invalid day of week: '" + input + "'. Must be a valid weekday (e.g. MONDAY..SUNDAY, DAILY)");
        };
    }

    /**
     * Validates that owner-supplied meal session is one of BREAKFAST, LUNCH, DINNER, or SNACKS.
     * Rejects legacy SPECIAL meal type, directing callers to use the isSpecial boolean flag instead.
     */
    private void validateOwnerMealType(MealType mealType) {
        if (mealType == null) {
            throw new BadRequestException("Meal type is required (BREAKFAST, LUNCH, DINNER, or SNACKS)");
        }
        if (mealType == MealType.SPECIAL) {
            throw new BadRequestException("Meal type must be BREAKFAST, LUNCH, or DINNER. Set isSpecial=true to designate a dish as special.");
        }
    }
}
