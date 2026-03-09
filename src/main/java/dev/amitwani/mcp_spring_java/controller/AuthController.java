package dev.amitwani.mcp_spring_java.controller;

import dev.amitwani.mcp_spring_java.Entity.AppUser;
import dev.amitwani.mcp_spring_java.dto.auth.*;
import dev.amitwani.mcp_spring_java.service.AuthService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@Slf4j
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public Mono<ResponseEntity<Object>> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return Mono.just(ResponseEntity.ok((Object) response));
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).body((Object) error));
        }
    }

    @PostMapping("/register")
    public Mono<ResponseEntity<Object>> register(@RequestBody RegisterRequest request) {
        try {
            AppUser user = authService.register(request);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "User created successfully");
            response.put("username", user.getUsername());
            response.put("role", user.getRole().name());
            response.put("mustChangePassword", user.isMustChangePassword());
            return Mono.just(ResponseEntity.status(HttpStatus.CREATED).body((Object) response));
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Mono.just(ResponseEntity.badRequest().body((Object) error));
        }
    }

    @PostMapping("/change-password")
    public Mono<ResponseEntity<Object>> changePassword(@RequestBody ChangePasswordRequest request) {
        return ReactiveSecurityContextHolder.getContext()
                .map(SecurityContext::getAuthentication)
                .map(Authentication::getName)
                .flatMap(username -> {
                    try {
                        authService.changePassword(username, request);
                        Map<String, String> response = new HashMap<>();
                        response.put("message", "Password changed successfully");
                        return Mono.just(ResponseEntity.ok((Object) response));
                    } catch (RuntimeException e) {
                        Map<String, String> error = new HashMap<>();
                        error.put("error", e.getMessage());
                        return Mono.just(ResponseEntity.badRequest().body((Object) error));
                    }
                })
                .switchIfEmpty(Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                        (Object) Map.of("error", "Not authenticated"))));
    }

    @GetMapping("/users")
    public Mono<ResponseEntity<Object>> getAllUsers() {
        List<Map<String, Object>> users = authService.getAllUsers().stream()
                .map(user -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", user.getId());
                    map.put("username", user.getUsername());
                    map.put("role", user.getRole().name());
                    map.put("mustChangePassword", user.isMustChangePassword());
                    map.put("employeeId", user.getEmployee() != null ? user.getEmployee().getId() : null);
                    map.put("fullName", user.getEmployee() != null
                            ? user.getEmployee().getFirstName() + " " + user.getEmployee().getLastName()
                            : (user.getRole().name().equals("ADMIN") ? "Administrator" : ""));
                    map.put("createdAt", user.getCreatedAt());
                    return map;
                })
                .collect(Collectors.toList());
        return Mono.just(ResponseEntity.ok((Object) users));
    }

    @GetMapping("/me")
    public Mono<ResponseEntity<Object>> getCurrentUser() {
        return ReactiveSecurityContextHolder.getContext()
                .map(SecurityContext::getAuthentication)
                .map(Authentication::getName)
                .flatMap(username -> {
                    try {
                        var users = authService.getAllUsers();
                        var user = users.stream()
                                .filter(u -> u.getUsername().equals(username))
                                .findFirst()
                                .orElseThrow(() -> new RuntimeException("User not found"));
                        Map<String, Object> response = new HashMap<>();
                        response.put("username", user.getUsername());
                        response.put("role", user.getRole().name());
                        response.put("mustChangePassword", user.isMustChangePassword());
                        response.put("employeeId", user.getEmployee() != null ? user.getEmployee().getId() : null);
                        response.put("fullName", user.getEmployee() != null
                                ? user.getEmployee().getFirstName() + " " + user.getEmployee().getLastName()
                                : "Administrator");
                        return Mono.just(ResponseEntity.ok((Object) response));
                    } catch (RuntimeException e) {
                        return Mono.just(ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                                (Object) Map.of("error", e.getMessage())));
                    }
                })
                .switchIfEmpty(Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                        (Object) Map.of("error", "Not authenticated"))));
    }
}
