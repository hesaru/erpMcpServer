package dev.amitwani.mcp_spring_java.service;

import dev.amitwani.mcp_spring_java.Entity.*;
import dev.amitwani.mcp_spring_java.dto.leave.LeaveRequestDto;
import dev.amitwani.mcp_spring_java.repository.AppUserRepository;
import dev.amitwani.mcp_spring_java.repository.EmployeeRepository;
import dev.amitwani.mcp_spring_java.repository.LeaveRequestRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final EmployeeRepository employeeRepository;
    private final AppUserRepository appUserRepository;

    public LeaveService(LeaveRequestRepository leaveRequestRepository,
            EmployeeRepository employeeRepository,
            AppUserRepository appUserRepository) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.employeeRepository = employeeRepository;
        this.appUserRepository = appUserRepository;
    }

    public LeaveRequest applyLeave(String username, LeaveRequestDto dto) {
        AppUser appUser = appUserRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (appUser.getEmployee() == null) {
            throw new RuntimeException("User is not linked to an employee record");
        }

        // Find a manager to assign this leave request to
        List<AppUser> managers = appUserRepository.findByRole(UserRole.MANAGER);
        Employee manager = null;
        if (!managers.isEmpty()) {
            // Assign to the first available manager (you could use round-robin or other
            // logic)
            manager = managers.get(0).getEmployee();
        }

        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setEmployee(appUser.getEmployee());
        leaveRequest.setManager(manager);
        leaveRequest.setReason(dto.getReason());
        leaveRequest.setStartDate(dto.getStartDate());
        leaveRequest.setEndDate(dto.getEndDate());
        leaveRequest.setStatus(LeaveStatus.PENDING);

        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        log.info("Leave request #{} created by {}", saved.getId(), username);
        return saved;
    }

    public List<LeaveRequest> getMyLeaveRequests(String username) {
        AppUser appUser = appUserRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (appUser.getEmployee() == null) {
            throw new RuntimeException("User is not linked to an employee record");
        }

        return leaveRequestRepository.findByEmployeeIdOrderByCreatedAtDesc(appUser.getEmployee().getId());
    }

    public List<LeaveRequest> getPendingLeavesForManager(String username) {
        AppUser appUser = appUserRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (appUser.getEmployee() == null) {
            throw new RuntimeException("Manager is not linked to an employee record");
        }

        return leaveRequestRepository.findByManagerIdAndStatusOrderByCreatedAtDesc(
                appUser.getEmployee().getId(), LeaveStatus.PENDING);
    }

    public List<LeaveRequest> getAllLeavesForManager(String username) {
        AppUser appUser = appUserRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (appUser.getEmployee() == null) {
            throw new RuntimeException("Manager is not linked to an employee record");
        }

        return leaveRequestRepository.findByManagerIdOrderByCreatedAtDesc(appUser.getEmployee().getId());
    }

    public LeaveRequest approveLeave(Long leaveId) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        leaveRequest.setStatus(LeaveStatus.APPROVED);
        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        log.info("Leave request #{} approved", leaveId);
        return saved;
    }

    public LeaveRequest declineLeave(Long leaveId) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        leaveRequest.setStatus(LeaveStatus.DECLINED);
        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        log.info("Leave request #{} declined", leaveId);
        return saved;
    }

    public List<LeaveRequest> getAllLeaves() {
        return leaveRequestRepository.findAll();
    }
}
