package dev.amitwani.mcp_spring_java.service;

import dev.amitwani.mcp_spring_java.dto.wellbeing.EmployeeWellBeingDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * MCP tools exposed to the AI client for querying employee well-being data.
 * The AI uses these tools to fetch raw workload metrics and then makes
 * stress-level decisions based on the data.
 */
@Service
@Slf4j
public class WellBeingMcpTools {

    private final WellBeingService wellBeingService;

    @Autowired
    public WellBeingMcpTools(WellBeingService wellBeingService) {
        this.wellBeingService = wellBeingService;
    }

    @Tool(name = "getEmployeeWellBeingMetrics", description = "Get aggregate well-being and workload metrics for all employees "
            +
            "(includes leave metrics, Jira workload, GitHub commit counts, and backlog task load). " +
            "Use this data to analyze employee stress levels and identify employees who need attention.")
    public List<EmployeeWellBeingDto> getEmployeeWellBeingMetrics() {
        log.info("[MCP] getEmployeeWellBeingMetrics called");
        return wellBeingService.getDashboardData();
    }

    @Tool(name = "getEmployeeWellBeingById", description = "Get well-being and workload metrics for a single employee by their ID "
            +
            "(includes leave metrics, Jira workload, GitHub commit counts, and backlog task load). " +
            "Use this to analyze an individual employee's stress level in detail.")
    public EmployeeWellBeingDto getEmployeeWellBeingById(
            @ToolParam(description = "The ID of the employee to get well-being metrics for") Long employeeId) {
        log.info("[MCP] getEmployeeWellBeingById called for employeeId={}", employeeId);
        return wellBeingService.getEmployeeWellBeing(employeeId);
    }
}
