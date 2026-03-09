package dev.amitwani.mcp_spring_java.repository;

import dev.amitwani.mcp_spring_java.Entity.AppUser;
import dev.amitwani.mcp_spring_java.Entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    Optional<AppUser> findByUsername(String username);

    boolean existsByUsername(String username);

    List<AppUser> findByRole(UserRole role);

    Optional<AppUser> findByEmployeeId(Long employeeId);
}
