package com.messmap.modules.favorite.controller;

import com.messmap.common.dto.ApiResponse;
import com.messmap.modules.favorite.dto.FavoriteResponse;
import com.messmap.modules.favorite.service.FavoriteService;
import com.messmap.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for authenticated student mess bookmark and favorites management.
 * Supports both standard (/api/student/favorites) and versioned (/api/v1/student/favorites) routes.
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_STUDENT', 'ROLE_ADMIN')")
public class StudentFavoriteController {

    private final FavoriteService favoriteService;

    /**
     * Add an approved mess to the authenticated student's favorites list.
     * Accessible via POST /api/student/favorites/{messId} and POST /api/v1/student/favorites/{messId}.
     * Idempotent: returns HTTP 201 when created, HTTP 200 when already present.
     *
     * @param messId        Mess primary key
     * @param userPrincipal Authenticated user principal
     * @return Standardized ApiResponse with FavoriteResponse payload
     */
    @PostMapping({"/api/student/favorites/{messId}", "/api/v1/student/favorites/{messId}"})
    public ResponseEntity<ApiResponse<FavoriteResponse>> addFavorite(
            @PathVariable("messId") Long messId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        log.info("Student userId={} requested to add messId={} to favorites", userPrincipal.getId(), messId);
        FavoriteService.AddFavoriteResult result = favoriteService.addFavorite(userPrincipal.getId(), messId);

        HttpStatus status = result.created() ? HttpStatus.CREATED : HttpStatus.OK;
        String message = result.created() ? "Mess added to favorites successfully" : "Mess is already in favorites";

        return new ResponseEntity<>(ApiResponse.success(message, result.response()), status);
    }

    /**
     * Remove a mess from the authenticated student's favorites list.
     * Accessible via DELETE /api/student/favorites/{messId} and DELETE /api/v1/student/favorites/{messId}.
     * Idempotent: returns HTTP 200 whether previously favorited or not.
     *
     * @param messId        Mess primary key
     * @param userPrincipal Authenticated user principal
     * @return Standardized ApiResponse message
     */
    @DeleteMapping({"/api/student/favorites/{messId}", "/api/v1/student/favorites/{messId}"})
    public ResponseEntity<ApiResponse<Void>> removeFavorite(
            @PathVariable("messId") Long messId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        log.info("Student userId={} requested to remove messId={} from favorites", userPrincipal.getId(), messId);
        favoriteService.removeFavorite(userPrincipal.getId(), messId);
        return ResponseEntity.ok(ApiResponse.message("Mess removed from favorites successfully"));
    }

    /**
     * Retrieve all bookmarked messes for the authenticated student.
     * Accessible via GET /api/student/favorites and GET /api/v1/student/favorites.
     *
     * @param userPrincipal Authenticated user principal
     * @return Standardized ApiResponse with list of favorite messes
     */
    @GetMapping({"/api/student/favorites", "/api/v1/student/favorites"})
    public ResponseEntity<ApiResponse<List<FavoriteResponse>>> getFavorites(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        log.info("Student userId={} requested all favorite messes", userPrincipal.getId());
        List<FavoriteResponse> favorites = favoriteService.getStudentFavorites(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Favorite messes retrieved successfully", favorites));
    }
}
