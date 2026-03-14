package dev.amitwani.mcp_spring_java.repository;

import dev.amitwani.mcp_spring_java.Entity.LeaveRequest;
import dev.amitwani.mcp_spring_java.Entity.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    List<LeaveRequest> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);

    List<LeaveRequest> findByEmployeeId(Long employeeId);

    List<LeaveRequest> findByManagerIdAndStatusOrderByCreatedAtDesc(Long managerId, LeaveStatus status);

    List<LeaveRequest> findByManagerIdOrderByCreatedAtDesc(Long managerId);

    List<LeaveRequest> findByStatusOrderByCreatedAtDesc(LeaveStatus status);
}
