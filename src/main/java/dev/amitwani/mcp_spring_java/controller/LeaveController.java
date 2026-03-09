package dev.amitwani.mcp_spring_java.controller;

import dev.amitwani.mcp_spring_java.Entity.LeaveRequest;
import dev.amitwani.mcp_spring_java.dto.leave.LeaveRequestDto;
import dev.amitwani.mcp_spring_java.service.LeaveService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leaves")
@Slf4j
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    @PostMapping("/apply")
    public Mono<ResponseEntity<Object>> applyLeave(@RequestBody LeaveRequestDto request) {
        return ReactiveSecurityContextHolder.getContext()
                .map(SecurityContext::getAuthentication)
                .map(Authentication::getName)
                .flatMap(username -> {
                    try {
                        LeaveRequest leave = leaveService.applyLeave(username, request);
                        return Mono.just(ResponseEntity.status(HttpStatus.CREATED).body((Object) leave));
                    } catch (RuntimeException e) {
                        return Mono.just(ResponseEntity.badRequest().body(
                                (Object) Map.of("error", e.getMessage())));
                    }
                })
                .switchIfEmpty(Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                        (Object) Map.of("error", "Not authenticated"))));
    }

    @GetMapping("/my-requests")
    public Mono<ResponseEntity<Object>> getMyLeaveRequests() {
        return ReactiveSecurityContextHolder.getContext()
                .map(SecurityContext::getAuthentication)
                .map(Authentication::getName)
                .flatMap(username -> {
                    try {
                        List<LeaveRequest> leaves = leaveService.getMyLeaveRequests(username);
                        return Mono.just(ResponseEntity.ok((Object) leaves));
                    } catch (RuntimeException e) {
                        return Mono.just(ResponseEntity.badRequest().body(
                                (Object) Map.of("error", e.getMessage())));
                    }
                })
                .switchIfEmpty(Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                        (Object) Map.of("error", "Not authenticated"))));
    }

    @GetMapping("/pending")
    public Mono<ResponseEntity<Object>> getPendingLeaves() {
        return ReactiveSecurityContextHolder.getContext()
                .map(SecurityContext::getAuthentication)
                .map(Authentication::getName)
                .flatMap(username -> {
                    try {
                        List<LeaveRequest> leaves = leaveService.getPendingLeavesForManager(username);
                        return Mono.just(ResponseEntity.ok((Object) leaves));
                    } catch (RuntimeException e) {
                        return Mono.just(ResponseEntity.badRequest().body(
                                (Object) Map.of("error", e.getMessage())));
                    }
                })
                .switchIfEmpty(Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                        (Object) Map.of("error", "Not authenticated"))));
    }

    @GetMapping("/all")
    public Mono<ResponseEntity<Object>> getAllLeavesForManager() {
        return ReactiveSecurityContextHolder.getContext()
                .map(SecurityContext::getAuthentication)
                .map(Authentication::getName)
                .flatMap(username -> {
                    try {
                        List<LeaveRequest> leaves = leaveService.getAllLeavesForManager(username);
                        return Mono.just(ResponseEntity.ok((Object) leaves));
                    } catch (RuntimeException e) {
                        return Mono.just(ResponseEntity.badRequest().body(
                                (Object) Map.of("error", e.getMessage())));
                    }
                })
                .switchIfEmpty(Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                        (Object) Map.of("error", "Not authenticated"))));
    }

    @PutMapping("/{id}/approve")
    public Mono<ResponseEntity<Object>> approveLeave(@PathVariable Long id) {
        try {
            LeaveRequest leave = leaveService.approveLeave(id);
            return Mono.just(ResponseEntity.ok((Object) leave));
        } catch (RuntimeException e) {
            return Mono.just(ResponseEntity.badRequest().body(
                    (Object) Map.of("error", e.getMessage())));
        }
    }

    @PutMapping("/{id}/decline")
    public Mono<ResponseEntity<Object>> declineLeave(@PathVariable Long id) {
        try {
            LeaveRequest leave = leaveService.declineLeave(id);
            return Mono.just(ResponseEntity.ok((Object) leave));
        } catch (RuntimeException e) {
            return Mono.just(ResponseEntity.badRequest().body(
                    (Object) Map.of("error", e.getMessage())));
        }
    }
}
