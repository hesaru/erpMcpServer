package dev.amitwani.mcp_spring_java.service;

import dev.amitwani.mcp_spring_java.Entity.BackLogTask;
import dev.amitwani.mcp_spring_java.Entity.Employee;
import dev.amitwani.mcp_spring_java.Entity.GitCommit;
import dev.amitwani.mcp_spring_java.Entity.JiraIssue;
import dev.amitwani.mcp_spring_java.Entity.LeaveRequest;
import dev.amitwani.mcp_spring_java.Entity.LeaveStatus;
import dev.amitwani.mcp_spring_java.Entity.TaskStatus;
import dev.amitwani.mcp_spring_java.dto.wellbeing.EmployeeWellBeingDto;
import dev.amitwani.mcp_spring_java.repository.BackLogTaskRepository;
import dev.amitwani.mcp_spring_java.repository.EmployeeRepository;
import dev.amitwani.mcp_spring_java.repository.GitCommitRepository;
import dev.amitwani.mcp_spring_java.repository.JiraIssueRepository;
import dev.amitwani.mcp_spring_java.repository.LeaveRequestRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class WellBeingService {

    private final EmployeeRepository employeeRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final JiraIssueRepository jiraIssueRepository;
    private final GitCommitRepository gitCommitRepository;
    private final BackLogTaskRepository backLogTaskRepository;

    @Autowired
    public WellBeingService(
            EmployeeRepository employeeRepository,
            LeaveRequestRepository leaveRequestRepository,
            JiraIssueRepository jiraIssueRepository,
            GitCommitRepository gitCommitRepository,
            BackLogTaskRepository backLogTaskRepository) {
        this.employeeRepository = employeeRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.jiraIssueRepository = jiraIssueRepository;
        this.gitCommitRepository = gitCommitRepository;
        this.backLogTaskRepository = backLogTaskRepository;
    }

    public List<EmployeeWellBeingDto> getDashboardData() {
        List<Employee> employees = employeeRepository.findAll();

        return employees.stream().map(this::computeWellBeingMetrics).collect(Collectors.toList());
    }

    public EmployeeWellBeingDto getEmployeeWellBeing(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId).orElse(null);
        if (employee == null) {
            log.warn("Employee not found for id={}", employeeId);
            return null;
        }
        return computeWellBeingMetrics(employee);
    }

    private EmployeeWellBeingDto computeWellBeingMetrics(Employee employee) {
        EmployeeWellBeingDto dto = new EmployeeWellBeingDto();
        dto.setEmployeeId(employee.getId());
        dto.setEmployeeName(employee.getFirstName() + " " + employee.getLastName());
        dto.setPosition(employee.getPosition());
        dto.setGithubUsername(employee.getGithubUsername());
        dto.setJiraAccountId(employee.getJiraAccountId());

        // 1. Leave Metrics
        List<LeaveRequest> leaves = leaveRequestRepository.findByEmployeeIdOrderByCreatedAtDesc(employee.getId());
        int totalLeaves = leaves.size();
        int approvedLeaves = 0;
        int pendingLeaves = 0;
        int declinedLeaves = 0;

        for (LeaveRequest leave : leaves) {
            if (leave.getStatus() == LeaveStatus.APPROVED)
                approvedLeaves++;
            else if (leave.getStatus() == LeaveStatus.PENDING)
                pendingLeaves++;
            else if (leave.getStatus() == LeaveStatus.DECLINED)
                declinedLeaves++;
        }

        dto.setTotalLeaves(totalLeaves);
        dto.setApprovedLeaves(approvedLeaves);
        dto.setPendingLeaves(pendingLeaves);
        dto.setDeclinedLeaves(declinedLeaves);

        // 2. Jira Workload
        int jiraIssueCount = 0;
        int jiraOpenCount = 0;
        if (employee.getJiraAccountId() != null && !employee.getJiraAccountId().isBlank()) {
            List<JiraIssue> issues = jiraIssueRepository.findByAssigneeAccountId(employee.getJiraAccountId());
            jiraIssueCount = issues.size();
            for (JiraIssue issue : issues) {
                String status = issue.getStatus() != null ? issue.getStatus().toLowerCase() : "";
                if (!status.equals("done") && !status.equals("closed") && !status.equals("resolved")) {
                    jiraOpenCount++;
                }
            }
        }
        dto.setJiraIssueCount(jiraIssueCount);
        dto.setJiraOpenCount(jiraOpenCount);

        // 3. GitHub Activity
        int gitCommitCount = 0;
        if (employee.getGithubUsername() != null && !employee.getGithubUsername().isBlank()) {
            List<GitCommit> commits = gitCommitRepository.findByAuthorGithubUsername(employee.getGithubUsername());
            gitCommitCount = commits.size();
        }
        dto.setGitCommitCount(gitCommitCount);

        // 4. Backlog Task Workload
        List<BackLogTask> tasks = backLogTaskRepository.findByAssigneeId(employee.getId());
        int taskCount = tasks.size();
        int taskTodoCount = 0;
        int taskInProgressCount = 0;
        int taskDoneCount = 0;

        for (BackLogTask task : tasks) {
            if (task.getStatus() == TaskStatus.TODO)
                taskTodoCount++;
            else if (task.getStatus() == TaskStatus.IN_PROGRESS)
                taskInProgressCount++;
            else if (task.getStatus() == TaskStatus.DONE)
                taskDoneCount++;
        }

        dto.setTaskCount(taskCount);
        dto.setTaskTodoCount(taskTodoCount);
        dto.setTaskInProgressCount(taskInProgressCount);
        dto.setTaskDoneCount(taskDoneCount);

        // Stress score is now determined by the AI via MCP tool
        dto.setStressScore(0);
        dto.setStressLevel("PENDING_AI_ANALYSIS");

        return dto;
    }

}
