package com.messmap.security;

import com.messmap.modules.user.entity.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private final String secret = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private final long expirationMs = 3600000; // 1 hour

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(secret, expirationMs);
    }

    @Test
    @DisplayName("generateToken and parse claims correctly for student")
    void testGenerateAndValidateToken() {
        String token = jwtTokenProvider.generateToken(42L, "student@test.com", "Student Test", Role.ROLE_STUDENT);

        assertThat(token).isNotBlank();
        assertThat(jwtTokenProvider.validateToken(token)).isTrue();
        assertThat(jwtTokenProvider.getEmailFromToken(token)).isEqualTo("student@test.com");
        assertThat(jwtTokenProvider.getUserIdFromToken(token)).isEqualTo(42L);
        assertThat(jwtTokenProvider.getRoleFromToken(token)).isEqualTo("ROLE_STUDENT");
    }

    @Test
    @DisplayName("validateToken should return false for malformed or invalid token")
    void testInvalidToken() {
        assertThat(jwtTokenProvider.validateToken("invalid.jwt.token")).isFalse();
        assertThat(jwtTokenProvider.validateToken("")).isFalse();
        assertThat(jwtTokenProvider.validateToken(null)).isFalse();
    }

    @Test
    @DisplayName("validateToken should return false for expired token")
    void testExpiredToken() {
        JwtTokenProvider expiredTokenProvider = new JwtTokenProvider(secret, -1000L);
        String expiredToken = expiredTokenProvider.generateToken(1L, "expired@test.com", "Expired", Role.ROLE_STUDENT);

        assertThat(jwtTokenProvider.validateToken(expiredToken)).isFalse();
    }
}
