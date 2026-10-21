package com.messmap.modules.user.entity;

/**
 * Dietary preference options for students.
 */
public enum DietaryPreference {
    VEG,
    NON_VEG,
    BOTH;

    public static DietaryPreference fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return VEG;
        }
        try {
            return DietaryPreference.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return VEG;
        }
    }
}
