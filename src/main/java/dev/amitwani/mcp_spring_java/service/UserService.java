package dev.amitwani.mcp_spring_java.service;

import dev.amitwani.mcp_spring_java.Entity.Employee;
import dev.amitwani.mcp_spring_java.repository.EmployeeRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class UserService {

    private final EmployeeRepository employeeRepository;

    public UserService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }
}
