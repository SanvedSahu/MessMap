package com.messmap.config;

import com.messmap.security.JwtAuthenticationEntryPoint;
import com.messmap.security.JwtAuthenticationFilter;
import com.messmap.security.RestAccessDeniedHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * Spring Security configuration for MessMap backend.
 * Provides BCrypt password encoder bean and stateless REST security filter chain with JWT authentication.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CorsConfigurationSource corsConfigurationSource;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final RestAccessDeniedHandler restAccessDeniedHandler;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                        .accessDeniedHandler(restAccessDeniedHandler)
                )
                .authorizeHttpRequests(auth -> auth
                        // Public health monitoring endpoints
                        .requestMatchers("/api/v1/health", "/api/v1/health/**").permitAll()
                        // Public authentication endpoints (registration & login)
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        // Public mess discovery endpoints
                        .requestMatchers("/api/v1/messes/public/**").permitAll()
                        // Swagger & OpenAPI documentation
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        // Protected Mess Owner endpoints requiring authentication
                        .requestMatchers("/api/v1/owner/**").hasAnyAuthority("ROLE_MESS_OWNER", "ROLE_ADMIN")
                        // Any other request requires authentication
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
