package com.messmap.modules.mess.repository;

import com.messmap.modules.mess.dto.MessFilterRequest;
import com.messmap.modules.mess.entity.FoodType;
import com.messmap.modules.mess.entity.Mess;
import com.messmap.modules.mess.entity.MessStatus;
import com.messmap.modules.mess.entity.OperatingStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Dynamic JPA Specification builder for filtering approved mess listings.
 * Enforces the APPROVED-only and OPEN-only visibility constraints at database query time.
 */
public class MessSpecification {

    private MessSpecification() {
        // Utility class
    }

    /**
     * Builds a JPA Specification combining all active discovery criteria.
     *
     * @param filter           The incoming filter request (search, locality, city, price range)
     * @param allowedFoodTypes Resolved dietary categories (VEG, NON_VEG, BOTH, etc.)
     * @return Specification enforcing all filters alongside mandatory APPROVED status
     */
    public static Specification<Mess> withFilters(MessFilterRequest filter, List<FoodType> allowedFoodTypes) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Mandatory constraint: Only APPROVED messes are discoverable by students and public visitors
            predicates.add(cb.equal(root.get("status"), MessStatus.APPROVED));

            // 1b. Availability constraint: Exclude owner-closed messes by default
            if (filter == null || filter.getIncludeClosed() == null || !filter.getIncludeClosed()) {
                predicates.add(cb.equal(root.get("operatingStatus"), OperatingStatus.OPEN));
            }

            if (filter != null) {
                // 2. Search keyword filter matching mess name or locality (area / address / city)
                if (filter.getSearch() != null && !filter.getSearch().trim().isEmpty()) {
                    String searchPattern = "%" + filter.getSearch().trim().toLowerCase() + "%";
                    Predicate nameMatch = cb.like(cb.lower(root.get("name")), searchPattern);
                    Predicate areaMatch = cb.like(cb.lower(root.get("area")), searchPattern);
                    Predicate addressMatch = cb.like(cb.lower(root.get("address")), searchPattern);
                    Predicate cityMatch = cb.like(cb.lower(root.get("city")), searchPattern);
                    predicates.add(cb.or(nameMatch, areaMatch, addressMatch, cityMatch));
                }

                // 3. Locality filter matching area, street address, or city
                if (filter.getLocality() != null && !filter.getLocality().trim().isEmpty()) {
                    String localityPattern = "%" + filter.getLocality().trim().toLowerCase() + "%";
                    Predicate areaMatch = cb.like(cb.lower(root.get("area")), localityPattern);
                    Predicate addressMatch = cb.like(cb.lower(root.get("address")), localityPattern);
                    Predicate cityMatch = cb.like(cb.lower(root.get("city")), localityPattern);
                    predicates.add(cb.or(areaMatch, addressMatch, cityMatch));
                }

                // 4. City filter (case-insensitive exact match)
                if (filter.getCity() != null && !filter.getCity().trim().isEmpty()) {
                    predicates.add(cb.equal(cb.lower(root.get("city")), filter.getCity().trim().toLowerCase()));
                }

                // 5. Dietary food type filter
                if (allowedFoodTypes != null && !allowedFoodTypes.isEmpty()) {
                    predicates.add(root.get("foodType").in(allowedFoodTypes));
                }

                // 6. Pricing range filters (supporting both monthly subscription and single-day thali prices)
                BigDecimal minPrice = filter.getMinPrice();
                BigDecimal maxPrice = filter.getMaxPrice();

                if (minPrice != null && maxPrice != null) {
                    Predicate monthlyInRange = cb.and(
                            cb.isNotNull(root.get("monthlyPrice")),
                            cb.greaterThanOrEqualTo(root.get("monthlyPrice"), minPrice),
                            cb.lessThanOrEqualTo(root.get("monthlyPrice"), maxPrice)
                    );
                    Predicate dailyInRange = cb.and(
                            cb.isNotNull(root.get("dailyPrice")),
                            cb.greaterThanOrEqualTo(root.get("dailyPrice"), minPrice),
                            cb.lessThanOrEqualTo(root.get("dailyPrice"), maxPrice)
                    );
                    predicates.add(cb.or(monthlyInRange, dailyInRange));
                } else if (minPrice != null) {
                    Predicate monthlyMin = cb.and(
                            cb.isNotNull(root.get("monthlyPrice")),
                            cb.greaterThanOrEqualTo(root.get("monthlyPrice"), minPrice)
                    );
                    Predicate dailyMin = cb.and(
                            cb.isNotNull(root.get("dailyPrice")),
                            cb.greaterThanOrEqualTo(root.get("dailyPrice"), minPrice)
                    );
                    predicates.add(cb.or(monthlyMin, dailyMin));
                } else if (maxPrice != null) {
                    Predicate monthlyMax = cb.and(
                            cb.isNotNull(root.get("monthlyPrice")),
                            cb.lessThanOrEqualTo(root.get("monthlyPrice"), maxPrice)
                    );
                    Predicate dailyMax = cb.and(
                            cb.isNull(root.get("monthlyPrice")),
                            cb.isNotNull(root.get("dailyPrice")),
                            cb.lessThanOrEqualTo(root.get("dailyPrice"), maxPrice)
                    );
                    predicates.add(cb.or(monthlyMax, dailyMax));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
