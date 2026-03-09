package dev.amitwani.mcp_spring_java.service;

import dev.amitwani.mcp_spring_java.Entity.AppUser;
import dev.amitwani.mcp_spring_java.Entity.Employee;
import dev.amitwani.mcp_spring_java.Entity.UserRole;
import dev.amitwani.mcp_spring_java.config.JwtUtil;
import dev.amitwani.mcp_spring_java.dto.auth.*;
import dev.amitwani.mcp_spring_java.repository.AppUserRepository;
import dev.amitwani.mcp_spring_java.repository.EmployeeRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@Slf4j
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(AppUserRepository appUserRepository,
            EmployeeRepository employeeRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil) {
        this.appUserRepository = appUserRepository;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public LoginResponse login(LoginRequest request) {
        AppUser user = appUserRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }

        Long employeeId = user.getEmployee() != null ? user.getEmployee().getId() : null;
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name(), employeeId);

        String fullName = "";
        if (user.getEmployee() != null) {
            fullName = user.getEmployee().getFirstName() + " " + user.getEmployee().getLastName();
        } else if (user.getRole() == UserRole.ADMIN) {
            fullName = "Administrator";
        }

        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setUsername(user.getUsername());
        response.setRole(user.getRole().name());
        response.setMustChangePassword(user.isMustChangePassword());
        response.setEmployeeId(employeeId);
        response.setFullName(fullName);

        return response;
    }

    public AppUser register(RegisterRequest request) {
        if (appUserRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        UserRole role;
        try {
            role = UserRole.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role. Must be MANAGER or EMPLOYEE");
        }

        if (role == UserRole.ADMIN) {
            throw new RuntimeException("Cannot create another admin user");
        }

        // Create the Employee record first
        Employee employee = new Employee();
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setUserName(request.getUsername());
        employee.setEmail(request.getEmail());
        employee.setPosition(request.getPosition() != null ? request.getPosition() : role.name());
        employee.setDateOfJoining(LocalDate.now());
        employee.setJiraAccountId(request.getJiraAccountId());
        employee.setGithubUsername(request.getGithubUsername());
        employee = employeeRepository.save(employee);

        // Create the AppUser
        AppUser appUser = new AppUser();
        appUser.setUsername(request.getUsername());
        appUser.setPassword(passwordEncoder.encode(request.getPassword()));
        appUser.setRole(role);
        appUser.setMustChangePassword(true); // Force password change on first login
        appUser.setEmployee(employee);

        return appUserRepository.save(appUser);
    }

    public void changePassword(String username, ChangePasswordRequest request) {
        AppUser user = appUserRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false);
        appUserRepository.save(user);
        log.info("Password changed for user: {}", username);
    }

    public List<AppUser> getAllUsers() {
        return appUserRepository.findAll();
    }
}
