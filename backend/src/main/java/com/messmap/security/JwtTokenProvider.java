package com.messmap.security;

import com.messmap.modules.user.entity.Role;
import com.messmap.modules.user.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SecurityException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HexFormat;

/**
 * Utility component for generating, parsing, and validating JSON Web Tokens (JWT).
 */
@Slf4j
@Component
public class JwtTokenProvider {

    private final String jwtSecret;
    private final long jwtExpirationMs;
    private final SecretKey key;

    public JwtTokenProvider(
            @Value("${messmap.jwt.secret:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}") String jwtSecret,
            @Value("${messmap.jwt.expiration-ms:86400000}") long jwtExpirationMs
    ) {
        this.jwtSecret = jwtSecret;
        this.jwtExpirationMs = jwtExpirationMs;
        this.key = initKey(jwtSecret);
    }

    private SecretKey initKey(String secret) {
        byte[] keyBytes;
        try {
            if (secret != null && secret.matches("^[0-9a-fA-F]{64}$")) {
                keyBytes = HexFormat.of().parseHex(secret);
            } else if (secret != null && secret.length() >= 32) {
                keyBytes = secret.getBytes(StandardCharsets.UTF_8);
            } else {
                keyBytes = HexFormat.of().parseHex("404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
            }
        } catch (Exception e) {
            log.warn("Failed to decode secret as HEX, falling back to UTF-8 bytes: {}", e.getMessage());
            keyBytes = secret != null ? secret.getBytes(StandardCharsets.UTF_8) : "default_fallback_secret_key_messmap_2026_spring_boot".getBytes(StandardCharsets.UTF_8);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Generate token from Spring Security Authentication principal.
     */
    public String generateToken(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return generateToken(principal.getId(), principal.getEmail(), principal.getName(), principal.getRole());
    }

    /**
     * Generate token directly from User entity.
     */
    public String generateToken(User user) {
        return generateToken(user.getId(), user.getEmail(), user.getName(), user.getRole());
    }

    /**
     * Generate signed JWT with claims for user identification and role authorization.
     */
    public String generateToken(Long userId, String email, String name, Role role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .subject(email)
                .claim("userId", userId)
                .claim("name", name)
                .claim("role", role != null ? role.name() : Role.ROLE_STUDENT.name())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    /**
     * Extract subject (email) from JWT token.
     */
    public String getEmailFromToken(String token) {
        return getClaimsFromToken(token).getSubject();
    }

    /**
     * Extract user ID claim from JWT token.
     */
    public Long getUserIdFromToken(String token) {
        Object userIdObj = getClaimsFromToken(token).get("userId");
        if (userIdObj instanceof Number number) {
            return number.longValue();
        } else if (userIdObj instanceof String str) {
            return Long.parseLong(str);
        }
        return null;
    }

    /**
     * Extract role claim from JWT token.
     */
    public String getRoleFromToken(String token) {
        return getClaimsFromToken(token).get("role", String.class);
    }

    /**
     * Parse and return JWT Claims.
     */
    public Claims getClaimsFromToken(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Validate JWT token structure, signature, and expiration.
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (SecurityException ex) {
            log.warn("Invalid JWT signature: {}", ex.getMessage());
        } catch (MalformedJwtException ex) {
            log.warn("Invalid JWT token format: {}", ex.getMessage());
        } catch (ExpiredJwtException ex) {
            log.warn("Expired JWT token: {}", ex.getMessage());
        } catch (UnsupportedJwtException ex) {
            log.warn("Unsupported JWT token: {}", ex.getMessage());
        } catch (IllegalArgumentException ex) {
            log.warn("JWT claims string is empty or invalid: {}", ex.getMessage());
        }
        return false;
    }

    public long getExpirationMs() {
        return jwtExpirationMs;
    }
}
