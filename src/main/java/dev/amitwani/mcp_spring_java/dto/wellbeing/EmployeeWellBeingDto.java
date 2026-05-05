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

    private int totalLeaves;
    private int approvedLeaves;
    private int pendingLeaves;
    private int declinedLeaves;

    private int jiraIssueCount;
    private int jiraOpenCount;

    private int gitCommitCount;

    private int taskCount;
    private int taskTodoCount;
    private int taskInProgressCount;
    private int taskDoneCount;

    private int stressScore;

    private String stressLevel;
}
