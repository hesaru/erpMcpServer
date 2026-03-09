package dev.amitwani.mcp_spring_java.repository;

import dev.amitwani.mcp_spring_java.Entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    @Query("SELECT e FROM Employee e WHERE " +
            "LOWER(e.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(e.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(e.userName) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Employee> searchEmployees(String query);

    Optional<Employee> findByGithubUsername(String githubUsername);

    List<Employee> findAllByGithubUsernameIsNotNull();
}
