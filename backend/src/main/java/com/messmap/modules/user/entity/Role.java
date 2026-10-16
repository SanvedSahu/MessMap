package com.messmap.modules.user.entity;

/**
 * Standard user roles for the MessMap platform.
 */
public enum Role {
    ROLE_STUDENT,
    ROLE_MESS_OWNER,
    ROLE_ADMIN;

    public String getDisplayName() {
        return switch (this) {
            case ROLE_STUDENT -> "Student";
            case ROLE_MESS_OWNER -> "Mess Owner";
            case ROLE_ADMIN -> "Admin";
        };
    }
}
