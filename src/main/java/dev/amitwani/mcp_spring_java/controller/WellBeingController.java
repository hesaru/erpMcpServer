package dev.amitwani.mcp_spring_java.controller;

import dev.amitwani.mcp_spring_java.dto.wellbeing.EmployeeWellBeingDto;
import dev.amitwani.mcp_spring_java.service.WellBeingService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.List;

@RestController
@RequestMapping("/api/wellbeing")
@Slf4j
public class WellBeingController {

    private final WellBeingService wellBeingService;

    @Autowired
    public WellBeingController(WellBeingService wellBeingService) {
        this.wellBeingService = wellBeingService;
    }

    @GetMapping("/dashboard")
    public Mono<ResponseEntity<List<EmployeeWellBeingDto>>> getDashboardData() {
        log.info("REST: Fetching wellbeing dashboard data");
        return ReactiveSecurityContextHolder.getContext()
                .map(SecurityContext::getAuthentication)
                .map(Authentication::getName)
                .flatMap(username -> {
                    try {
                        List<EmployeeWellBeingDto> data = wellBeingService.getDashboardData();
                        return Mono.just(ResponseEntity.ok(data));
                    } catch (Exception e) {
                        log.error("Failed to fetch wellbeing data: {}", e.getMessage(), e);
                        return Mono.just(ResponseEntity.internalServerError().<List<EmployeeWellBeingDto>>build());
                    }
                })
                .switchIfEmpty(Mono.just(ResponseEntity.status(401).build()));
    }

    @GetMapping("/employee/{id}")
    public Mono<ResponseEntity<EmployeeWellBeingDto>> getEmployeeWellBeing(@PathVariable Long id) {
        log.info("REST: Fetching wellbeing data for employee id={}", id);
        return ReactiveSecurityContextHolder.getContext()
                .map(SecurityContext::getAuthentication)
                .map(Authentication::getName)
                .flatMap(username -> {
                    try {
                        EmployeeWellBeingDto data = wellBeingService.getEmployeeWellBeing(id);
                        if (data == null) {
                            return Mono.just(ResponseEntity.notFound().<EmployeeWellBeingDto>build());
                        }
                        return Mono.just(ResponseEntity.ok(data));
                    } catch (Exception e) {
                        log.error("Failed to fetch wellbeing data for employee {}: {}", id, e.getMessage(), e);
                        return Mono.just(ResponseEntity.internalServerError().<EmployeeWellBeingDto>build());
                    }
                })
                .switchIfEmpty(Mono.just(ResponseEntity.status(401).build()));
    }
}
