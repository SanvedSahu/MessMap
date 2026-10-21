package com.messmap.modules.mess.service;

import com.messmap.common.exception.BadRequestException;
import com.messmap.common.exception.ResourceNotFoundException;
import com.messmap.modules.mess.dto.*;
import com.messmap.modules.mess.entity.Facility;
import com.messmap.modules.mess.entity.FoodType;
import com.messmap.modules.mess.entity.Mess;
import com.messmap.modules.mess.entity.MessStatus;
import com.messmap.modules.mess.entity.OperatingStatus;
import com.messmap.modules.mess.entity.SuspensionReviewRequest;
import com.messmap.modules.mess.entity.SuspensionReviewStatus;
import com.messmap.modules.mess.repository.FacilityRepository;
import com.messmap.modules.mess.repository.MessRepository;
import com.messmap.modules.mess.repository.SuspensionReviewRequestRepository;
import com.messmap.modules.user.entity.User;
import com.messmap.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Service managing Mess Owner listing profile creation, updates, operating timings,
 * and amenities management with strict server-side ownership enforcement.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OwnerMessService {

    private final MessRepository messRepository;
    private final UserRepository userRepository;
    private final FacilityRepository facilityRepository;
    private final SuspensionReviewRequestRepository suspensionReviewRequestRepository;

    /**
     * Create a new mess profile associated with the authenticated mess owner.
     * Enforces server-controlled PENDING review status and rejects client-supplied status elevation.
     */
    @Transactional
    public MessOwnerResponse createMess(Long ownerId, CreateMessRequest request) {
        log.info("Creating new mess profile for owner id={}, messName='{}'", ownerId, request.getName());

        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + ownerId));

        // Validate mandatory locality/area and contact phone
        String area = request.getEffectiveArea();
        if (area == null || area.isBlank()) {
            throw new BadRequestException("Locality/Area is required");
        }

        String phone = request.getEffectivePhone();
        if (phone == null || phone.isBlank()) {
            throw new BadRequestException("Contact phone number is required");
        }

        FoodType foodType = request.getEffectiveFoodType();

        MessStatus initialStatus = MessStatus.PENDING;
        if ("DRAFT".equalsIgnoreCase(request.getStatus()) || Boolean.TRUE.equals(request.getDraft())) {
            initialStatus = MessStatus.DRAFT;
        }

        Mess mess = Mess.builder()
                .owner(owner)
                .name(request.getName().trim())
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .address(request.getAddress().trim())
                .area(area)
                .city(request.getCity().trim())
                .state(request.getState() != null ? request.getState().trim() : null)
                .pincode(request.getPincode() != null ? request.getPincode().trim() : null)
                .phone(phone)
                .email(request.getEmail() != null ? request.getEmail().trim().toLowerCase() : null)
                .foodType(foodType)
                .dailyPrice(request.getDailyPrice())
                .monthlyPrice(request.getMonthlyPrice())
                .breakfastPrice(request.getBreakfastPrice())
                .lunchPrice(request.getLunchPrice())
                .dinnerPrice(request.getDinnerPrice())
                .capacity(request.getCapacity())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .heroImage(request.getHeroImage() != null ? request.getHeroImage().trim() : null)
                .openingTime(request.getOpeningTime() != null ? request.getOpeningTime().trim() : null)
                .closingTime(request.getClosingTime() != null ? request.getClosingTime().trim() : null)
                .breakfastTiming(request.getBreakfastTiming() != null ? request.getBreakfastTiming().trim() : null)
                .lunchTiming(request.getLunchTiming() != null ? request.getLunchTiming().trim() : null)
                .dinnerTiming(request.getDinnerTiming() != null ? request.getDinnerTiming().trim() : null)
                .status(initialStatus) // Server-controlled initial status (defaults to PENDING, supports DRAFT)
                .operatingStatus(OperatingStatus.OPEN)
                .build();

        // Resolve initial facilities if provided
        Set<Facility> facilities = resolveFacilities(request.getFacilityIds(), request.getAmenities());
        mess.setFacilities(facilities);

        Mess savedMess = messRepository.save(mess);
        log.info("Successfully created mess listing id={} for owner id={}", savedMess.getId(), ownerId);
        return MessOwnerResponse.fromEntity(savedMess);
    }

    /**
     * Fetch primary mess profile for the authenticated mess owner.
     */
    @Transactional(readOnly = true)
    public MessOwnerResponse getAuthenticatedOwnerMess(Long ownerId) {
        log.info("Fetching primary mess profile for owner id={}", ownerId);
        List<Mess> messes = messRepository.findByOwnerIdWithDetails(ownerId);
        if (messes.isEmpty()) {
            throw new ResourceNotFoundException("No mess listing found for owner id: " + ownerId);
        }
        return MessOwnerResponse.fromEntity(messes.get(0));
    }

    /**
     * Fetch all messes owned by the authenticated mess owner.
     */
    @Transactional(readOnly = true)
    public List<MessOwnerResponse> getAuthenticatedOwnerMesses(Long ownerId) {
        log.info("Fetching all messes for owner id={}", ownerId);
        List<Mess> messes = messRepository.findByOwnerIdWithDetails(ownerId);
        return messes.stream()
                .map(MessOwnerResponse::fromEntity)
                .toList();
    }

    /**
     * Fetch specific mess profile by ID with strict server-side ownership authorization.
     */
    @Transactional(readOnly = true)
    public MessOwnerResponse getOwnerMessById(Long ownerId, Long messId, boolean isAdmin) {
        log.info("Fetching mess id={} for owner id={}, isAdmin={}", messId, ownerId, isAdmin);
        Mess mess = messRepository.findByIdWithDetails(messId)
                .orElseThrow(() -> new ResourceNotFoundException("Mess not found with id: '" + messId + "'"));

        enforceOwnership(mess, ownerId, isAdmin, "view");
        return MessOwnerResponse.fromEntity(mess);
    }

    /**
     * Update general mess profile attributes.
     * Enforces ownership and prevents modification of status, owner, or rejectionReason.
     */
    @Transactional
    public MessOwnerResponse updateMessProfile(Long ownerId, Long messId, boolean isAdmin, UpdateMessProfileRequest request) {
        log.info("Updating mess profile: ownerId={}, messId={}, isAdmin={}", ownerId, messId, isAdmin);
        Mess mess = resolveTargetMess(ownerId, messId, isAdmin, "update");

        // Prevent modification of removed mess
        if (mess.getStatus() == MessStatus.REMOVED) {
            throw new BadRequestException("This mess listing has been removed by an administrator and cannot be modified or reopened.");
        }

        if (request.getName() != null && !request.getName().isBlank()) {
            mess.setName(request.getName().trim());
        }
        if (request.getDescription() != null) {
            mess.setDescription(request.getDescription().trim());
        }
        if (request.getAddress() != null && !request.getAddress().isBlank()) {
            mess.setAddress(request.getAddress().trim());
        }
        String area = request.getEffectiveArea();
        if (area != null && !area.isBlank()) {
            mess.setArea(area);
        }
        if (request.getCity() != null && !request.getCity().isBlank()) {
            mess.setCity(request.getCity().trim());
        }
        if (request.getState() != null) {
            mess.setState(request.getState().trim());
        }
        if (request.getPincode() != null) {
            mess.setPincode(request.getPincode().trim());
        }
        String phone = request.getEffectivePhone();
        if (phone != null && !phone.isBlank()) {
            mess.setPhone(phone);
        }
        if (request.getEmail() != null) {
            mess.setEmail(request.getEmail().trim().toLowerCase());
        }
        FoodType foodType = request.getEffectiveFoodType();
        if (foodType != null) {
            mess.setFoodType(foodType);
        }
        if (request.getDailyPrice() != null) {
            mess.setDailyPrice(request.getDailyPrice());
        }
        if (request.getMonthlyPrice() != null) {
            mess.setMonthlyPrice(request.getMonthlyPrice());
        }
        if (request.getBreakfastPrice() != null) {
            mess.setBreakfastPrice(request.getBreakfastPrice());
        }
        if (request.getLunchPrice() != null) {
            mess.setLunchPrice(request.getLunchPrice());
        }
        if (request.getDinnerPrice() != null) {
            mess.setDinnerPrice(request.getDinnerPrice());
        }
        if (request.getCapacity() != null) {
            mess.setCapacity(request.getCapacity());
        }
        if (request.getLatitude() != null) {
            mess.setLatitude(request.getLatitude());
        }
        if (request.getLongitude() != null) {
            mess.setLongitude(request.getLongitude());
        }
        if (request.getHeroImage() != null) {
            mess.setHeroImage(request.getHeroImage().trim());
        }
        if (request.getOperatingStatus() != null) {
            if (request.getOperatingStatus() == OperatingStatus.OPEN) {
                if (mess.getStatus() == MessStatus.SUSPENDED) {
                    throw new BadRequestException("Cannot open mess: The listing is currently suspended by an administrator.");
                }
                if (mess.getStatus() == MessStatus.REMOVED) {
                    throw new BadRequestException("Cannot open mess: The listing has been removed by an administrator.");
                }
                if (mess.getStatus() != MessStatus.APPROVED) {
                    throw new BadRequestException("Cannot open mess: The listing must be approved by an administrator before opening.");
                }
            }
            mess.setOperatingStatus(request.getOperatingStatus());
        }

        // Update facilities if explicitly provided in profile update
        if (request.getFacilityIds() != null || request.getAmenities() != null) {
            Set<Facility> facilities = resolveFacilities(request.getFacilityIds(), request.getAmenities());
            mess.setFacilities(facilities);
        }

        Mess updatedMess = messRepository.save(mess);
        log.info("Successfully updated profile for mess id={}", updatedMess.getId());
        return MessOwnerResponse.fromEntity(updatedMess);
    }

    /**
     * Update operating timings for Breakfast, Lunch, Dinner, opening, and closing times.
     */
    @Transactional
    public MessOwnerResponse updateMessTimings(Long ownerId, Long messId, boolean isAdmin, UpdateMessTimingsRequest request) {
        log.info("Updating mess timings: ownerId={}, messId={}, isAdmin={}", ownerId, messId, isAdmin);
        Mess mess = resolveTargetMess(ownerId, messId, isAdmin, "update timings for");

        if (mess.getStatus() == MessStatus.REMOVED) {
            throw new BadRequestException("This mess listing has been removed by an administrator and cannot be modified.");
        }

        String breakfast = request.getEffectiveBreakfast();
        String lunch = request.getEffectiveLunch();
        String dinner = request.getEffectiveDinner();
        String openingTime = request.getOpeningTime();
        String closingTime = request.getClosingTime();

        boolean anyProvided = (breakfast != null) || (lunch != null) || (dinner != null) ||
                (openingTime != null) || (closingTime != null) || (request.getDaysActive() != null);

        if (!anyProvided) {
            throw new BadRequestException("At least one operating timing attribute must be provided");
        }

        if (breakfast != null) {
            mess.setBreakfastTiming(breakfast);
        }
        if (lunch != null) {
            mess.setLunchTiming(lunch);
        }
        if (dinner != null) {
            mess.setDinnerTiming(dinner);
        }
        if (openingTime != null && !openingTime.isBlank()) {
            mess.setOpeningTime(openingTime.trim());
        }
        if (closingTime != null && !closingTime.isBlank()) {
            mess.setClosingTime(closingTime.trim());
        }

        Mess updatedMess = messRepository.save(mess);
        log.info("Successfully updated timings for mess id={}", updatedMess.getId());
        return MessOwnerResponse.fromEntity(updatedMess);
    }

    /**
     * Update mess amenities and facility highlights.
     * Validates that all supplied facility identifiers exist in the database.
     */
    @Transactional
    public MessOwnerResponse updateMessAmenities(Long ownerId, Long messId, boolean isAdmin, UpdateMessAmenitiesRequest request) {
        log.info("Updating mess amenities: ownerId={}, messId={}, isAdmin={}", ownerId, messId, isAdmin);
        Mess mess = resolveTargetMess(ownerId, messId, isAdmin, "update amenities for");

        if (mess.getStatus() == MessStatus.REMOVED) {
            throw new BadRequestException("This mess listing has been removed by an administrator and cannot be modified.");
        }

        Set<Facility> facilities = resolveFacilities(request.getFacilityIds(), request.getAmenities());
        mess.setFacilities(facilities);

        Mess updatedMess = messRepository.save(mess);
        log.info("Successfully updated amenities for mess id={}, facilityCount={}", updatedMess.getId(), facilities.size());
        return MessOwnerResponse.fromEntity(updatedMess);
    }

    /**
     * Submits a mess listing for administrative verification.
     * Allowed only when current status is DRAFT or REJECTED.
     * Validates completeness of mandatory profile fields and meal timings.
     * Transitions status to PENDING and clears previous rejectionReason.
     */
    @Transactional
    public MessVerificationStatusResponse submitListingForVerification(Long ownerId, Long messId, boolean isAdmin) {
        log.info("Submitting mess for verification: ownerId={}, messId={}, isAdmin={}", ownerId, messId, isAdmin);
        Mess mess = resolveTargetMess(ownerId, messId, isAdmin, "submit for verification");

        if (mess.getStatus() == MessStatus.REMOVED) {
            throw new BadRequestException("This mess listing has been removed by an administrator and cannot be resubmitted.");
        }
        if (mess.getStatus() == MessStatus.PENDING) {
            throw new BadRequestException("Mess listing is already submitted and pending admin verification.");
        }
        if (mess.getStatus() == MessStatus.APPROVED) {
            throw new BadRequestException("Mess listing is already approved. Resubmission is not permitted.");
        }
        if (mess.getStatus() == MessStatus.SUSPENDED) {
            throw new BadRequestException("This mess is currently suspended by an administrator. Please submit a suspension review request instead.");
        }
        if (mess.getStatus() != MessStatus.DRAFT && mess.getStatus() != MessStatus.REJECTED) {
            throw new BadRequestException("Only listings in DRAFT or REJECTED status can be submitted for verification. Current status: " + mess.getStatus());
        }

        List<String> missingFields = getMissingProfileFields(mess);
        if (!missingFields.isEmpty()) {
            throw new BadRequestException("Mess profile is incomplete for verification submission: " + String.join(", ", missingFields), missingFields);
        }

        mess.setStatus(MessStatus.PENDING);
        mess.setRejectionReason(null);
        Mess savedMess = messRepository.save(mess);

        log.info("Successfully submitted mess id={} for verification. Status transitioned to PENDING.", savedMess.getId());
        return MessVerificationStatusResponse.fromEntity(savedMess, java.util.Collections.emptyList());
    }

    /**
     * Retrieves the verification status, admin feedback/rejection notes, and submission eligibility
     * for the target mess listing.
     */
    @Transactional(readOnly = true)
    public MessVerificationStatusResponse getVerificationStatus(Long ownerId, Long messId, boolean isAdmin) {
        log.info("Fetching verification status: ownerId={}, messId={}, isAdmin={}", ownerId, messId, isAdmin);
        Mess mess = resolveTargetMess(ownerId, messId, isAdmin, "view verification status for");
        List<String> missingFields = getMissingProfileFields(mess);
        return MessVerificationStatusResponse.fromEntity(mess, missingFields);
    }

    /**
     * Evaluates profile completeness for admin verification submission.
     * Enforces mandatory fields: name, address, city, area/locality, phone/contact, foodType,
     * and at least one meal timing (breakfastTiming, lunchTiming, or dinnerTiming).
     * Note: openingTime alone does not satisfy meal timing.
     */
    public List<String> getMissingProfileFields(Mess mess) {
        List<String> missing = new java.util.ArrayList<>();

        if (mess.getName() == null || mess.getName().isBlank()) {
            missing.add("Mess name is required");
        }
        if (mess.getAddress() == null || mess.getAddress().isBlank()) {
            missing.add("Address is required");
        }
        if (mess.getCity() == null || mess.getCity().isBlank()) {
            missing.add("City is required");
        }
        if (mess.getArea() == null || mess.getArea().isBlank()) {
            missing.add("Area/locality is required");
        }
        if (mess.getPhone() == null || mess.getPhone().isBlank()) {
            missing.add("Contact phone is required");
        }
        if (mess.getFoodType() == null) {
            missing.add("Food type is required");
        }

        boolean hasMealTiming = (mess.getBreakfastTiming() != null && !mess.getBreakfastTiming().isBlank())
                || (mess.getLunchTiming() != null && !mess.getLunchTiming().isBlank())
                || (mess.getDinnerTiming() != null && !mess.getDinnerTiming().isBlank());

        if (!hasMealTiming) {
            missing.add("At least one meal timing (breakfast, lunch, or dinner) is required");
        }

        return missing;
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
     * Server-side authorization check ensuring an owner can only access or modify their own mess listing.
     * Rejects access with HTTP 403 Forbidden (AccessDeniedException).
     */
    private void enforceOwnership(Mess mess, Long ownerId, boolean isAdmin, String action) {
        if (!isAdmin && (mess.getOwner() == null || !mess.getOwner().getId().equals(ownerId))) {
            log.warn("Unauthorized mess access attempt: actor id={} attempted to {} mess id={} owned by id={}",
                    ownerId, action, mess.getId(), mess.getOwner() != null ? mess.getOwner().getId() : "null");
            throw new AccessDeniedException("Access denied: You are not authorized to " + action + " another owner's mess listing.");
        }
    }

    /**
     * Resolves and validates facility entities by ID and/or name.
     * Throws ResourceNotFoundException if any requested facility does not exist.
     */
    private Set<Facility> resolveFacilities(Set<Long> facilityIds, List<String> amenityNames) {
        Set<Facility> facilities = new HashSet<>();

        if (facilityIds != null) {
            for (Long facilityId : facilityIds) {
                Facility facility = facilityRepository.findById(facilityId)
                        .orElseThrow(() -> new ResourceNotFoundException("Facility not found with id: '" + facilityId + "'"));
                facilities.add(facility);
            }
        }

        if (amenityNames != null) {
            for (String name : amenityNames) {
                if (name != null && !name.trim().isEmpty()) {
                    Facility facility = facilityRepository.findByNameIgnoreCase(name.trim())
                            .orElseThrow(() -> new ResourceNotFoundException("Facility not found with name: '" + name.trim() + "'"));
                    facilities.add(facility);
                }
            }
        }

        return facilities;
    }

    /**
     * Submits an owner request for administrative review of a suspended mess listing.
     * Enforces ownership, active SUSPENDED status, and prevents duplicate pending requests.
     */
    @Transactional
    public SuspensionReviewResponse requestSuspensionReview(Long ownerId, RequestSuspensionReviewRequest request, boolean isAdmin) {
        Long targetMessId = (request != null) ? request.getMessId() : null;
        Mess mess = resolveTargetMess(ownerId, targetMessId, isAdmin, "request suspension review for");

        if (mess.getStatus() == MessStatus.REMOVED) {
            throw new BadRequestException("Cannot request suspension review: This mess listing has been permanently removed.");
        }
        if (mess.getStatus() != MessStatus.SUSPENDED) {
            throw new BadRequestException("Suspension review can only be requested for suspended mess listings. Current status: " + mess.getStatus());
        }

        boolean hasPending = suspensionReviewRequestRepository.existsByMessIdAndStatus(mess.getId(), SuspensionReviewStatus.PENDING);
        if (hasPending) {
            throw new BadRequestException("A suspension review request is already pending administrator review.");
        }

        SuspensionReviewRequest reviewRequest = SuspensionReviewRequest.builder()
                .mess(mess)
                .owner(mess.getOwner())
                .explanation(request != null && request.getExplanation() != null ? request.getExplanation().trim() : null)
                .status(SuspensionReviewStatus.PENDING)
                .build();

        SuspensionReviewRequest saved = suspensionReviewRequestRepository.save(reviewRequest);
        log.info("Owner id={} submitted suspension review request id={} for mess id={}", ownerId, saved.getId(), mess.getId());
        return SuspensionReviewResponse.fromEntity(saved);
    }

    /**
     * Retrieves suspension review requests submitted for the authenticated owner's mess.
     */
    @Transactional(readOnly = true)
    public List<SuspensionReviewResponse> getOwnerSuspensionReviews(Long ownerId, Long messId, boolean isAdmin) {
        Mess mess = resolveTargetMess(ownerId, messId, isAdmin, "view suspension reviews for");
        List<SuspensionReviewRequest> requests = suspensionReviewRequestRepository.findByMessIdOrderByCreatedAtDesc(mess.getId());
        return requests.stream().map(SuspensionReviewResponse::fromEntity).toList();
    }
}
