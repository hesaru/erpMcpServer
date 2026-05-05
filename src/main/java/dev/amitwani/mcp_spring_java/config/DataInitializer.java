package dev.amitwani.mcp_spring_java.config;

import dev.amitwani.mcp_spring_java.Entity.AppUser;
import dev.amitwani.mcp_spring_java.Entity.UserRole;
import dev.amitwani.mcp_spring_java.repository.AppUserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(AppUserRepository appUserRepository, PasswordEncoder passwordEncoder) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Create default admin user if it doesn't exist
        if (!appUserRepository.existsByUsername("admin")) {
            AppUser admin = new AppUser();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(UserRole.ADMIN);
            admin.setMustChangePassword(false);
            admin.setEmployee(null);

            appUserRepository.save(admin);
            log.info("Default admin user created (username: admin, password: admin123)");
        } else {
            log.info("Admin user already exists, skipping creation.");
        }
    }
}
