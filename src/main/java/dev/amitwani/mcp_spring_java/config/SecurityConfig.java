package dev.amitwani.mcp_spring_java.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
                .authorizeExchange(auth -> auth
                        // Public endpoints
                        .pathMatchers("/api/auth/login").permitAll()
                        .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // MCP endpoints (no auth)
                        .pathMatchers("/mcp/**").permitAll()
                        .pathMatchers("/sse/**").permitAll()

                        // Admin only
                        .pathMatchers("/api/auth/register").hasRole("ADMIN")
                        .pathMatchers("/api/auth/users").hasRole("ADMIN")
                        .pathMatchers("/api/admin/**").hasRole("ADMIN")

                        // Manager endpoints
                        .pathMatchers("/api/leaves/pending").hasRole("MANAGER")
                        .pathMatchers("/api/leaves/*/approve").hasRole("MANAGER")
                        .pathMatchers("/api/leaves/*/decline").hasRole("MANAGER")
                        .pathMatchers("/api/leaves/all").hasAnyRole("ADMIN", "MANAGER")

                        // Employee endpoints
                        .pathMatchers("/api/leaves/apply").hasAnyRole("EMPLOYEE", "MANAGER")
                        .pathMatchers("/api/leaves/my-requests").hasAnyRole("EMPLOYEE", "MANAGER")

                        // All authenticated
                        .anyExchange().authenticated())
                .addFilterBefore(jwtAuthenticationFilter, SecurityWebFiltersOrder.AUTHENTICATION)
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
