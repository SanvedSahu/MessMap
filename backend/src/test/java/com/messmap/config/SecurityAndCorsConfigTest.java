package com.messmap.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class SecurityAndCorsConfigTest {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CorsConfigurationSource corsConfigurationSource;

    @Test
    @DisplayName("PasswordEncoder should be BCrypt and hash passwords securely")
    void testBCryptPasswordEncoder() {
        assertThat(passwordEncoder).isInstanceOf(BCryptPasswordEncoder.class);

        String rawPassword = "securePassword123!";
        String encodedHash = passwordEncoder.encode(rawPassword);

        assertThat(encodedHash).isNotEqualTo(rawPassword);
        assertThat(encodedHash).startsWith("$2a$");
        assertThat(passwordEncoder.matches(rawPassword, encodedHash)).isTrue();
        assertThat(passwordEncoder.matches("wrongPassword", encodedHash)).isFalse();
    }

    @Test
    @DisplayName("CORS configuration should support frontend origins and standard HTTP methods")
    void testCorsConfiguration() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/health");
        CorsConfiguration config = corsConfigurationSource.getCorsConfiguration(request);

        assertThat(config).isNotNull();
        assertThat(config.getAllowedOrigins()).contains(
                "http://localhost:5173",
                "http://localhost:3000",
                "http://localhost:3001"
        );
        assertThat(config.getAllowedMethods()).contains("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS");
        assertThat(config.getAllowCredentials()).isTrue();
    }
}
