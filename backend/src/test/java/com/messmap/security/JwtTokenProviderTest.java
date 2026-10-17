package com.messmap.security;

import com.messmap.modules.user.entity.Role;
import com.messmap.modules.user.entity.User;
import com.messmap.modules.user.entity.UserStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JwtTokenProviderTest {

    private JwtTokenProvider tokenProvider;
    private final String secret = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private final long expirationMs = 3600000; // 1 hour

    @BeforeEach
    void setUp() {
        tokenProvider = new JwtTokenProvider(secret, expirationMs);
    }

    @Test
    @DisplayName("Should generate valid JWT token with claims and parse accurately")
    void testGenerateAndValidateToken() {
        User user = User.builder()
                .id(42L)
                .name("Rajesh Sharma")
                .email("rajesh@annapurna.com")
                .role(Role.ROLE_MESS_OWNER)
                .status(UserStatus.ACTIVE)
                .build();

        String token = tokenProvider.generateToken(user);

        assertThat(token).isNotBlank();
        assertThat(tokenProvider.validateToken(token)).isTrue();
        assertThat(tokenProvider.getEmailFromToken(token)).isEqualTo("rajesh@annapurna.com");
        assertThat(tokenProvider.getUserIdFromToken(token)).isEqualTo(42L);
        assertThat(tokenProvider.getRoleFromToken(token)).isEqualTo("ROLE_MESS_OWNER");
    }

    @Test
    @DisplayName("Should reject invalid or tampered JWT token")
    void testValidateTamperedToken() {
        User user = User.builder()
                .id(1L)
                .name("Admin")
                .email("admin@messmap.com")
                .role(Role.ROLE_ADMIN)
                .build();

        String token = tokenProvider.generateToken(user);
        String tamperedToken = token + "corrupted";

        assertThat(tokenProvider.validateToken(tamperedToken)).isFalse();
        assertThat(tokenProvider.validateToken("")).isFalse();
        assertThat(tokenProvider.validateToken("not.a.valid.jwt")).isFalse();
    }

    @Test
    @DisplayName("Should reject expired token")
    void testExpiredToken() {
        // Provider with -1000ms expiration (immediately expired)
        JwtTokenProvider expiredProvider = new JwtTokenProvider(secret, -1000L);
        String token = expiredProvider.generateToken(1L, "expired@messmap.com", "Expired", Role.ROLE_STUDENT);

        assertThat(expiredProvider.validateToken(token)).isFalse();
    }
}
