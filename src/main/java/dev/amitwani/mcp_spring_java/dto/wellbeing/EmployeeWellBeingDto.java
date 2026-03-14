package dev.amitwani.mcp_spring_java.dto.wellbeing;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeWellBeingDto {
    private Long employeeId;
    private String employeeName;
    private String position;
    private String githubUsername;
    private String jiraAccountId;

    // Leave metrics
    private int totalLeaves;
    private int approvedLeaves;
    private int pendingLeaves;
    private int declinedLeaves;

    // Jira workload
    private int jiraIssueCount;
    private int jiraOpenCount;

    // GitHub activity
    private int gitCommitCount;

    // Backlog task load
    private int taskCount;
    private int taskTodoCount;
    private int taskInProgressCount;
    private int taskDoneCount;

    // Overall stress index (0-100)
    private int stressScore;

    // LOW / MEDIUM / HIGH / CRITICAL
    private String stressLevel;
}
