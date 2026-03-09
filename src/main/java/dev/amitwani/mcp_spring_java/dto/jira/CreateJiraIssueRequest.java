package dev.amitwani.mcp_spring_java.dto.jira;

/**
 * Request body DTO for creating a new Jira issue via the MCP server REST API.
 * The user provides these fields; the server will wrap them in the Atlassian
 * API format.
 */
public class CreateJiraIssueRequest {

    private String summary; // Issue title / summary
    private String description; // Optional plain-text description
    private String issueType; // e.g., "Task", "Bug", "Story" — defaults to project default
    private String assigneeAccountId; // Optional Jira account ID of assignee
    private String priority; // Optional: Highest, High, Medium, Low, Lowest
    private Long backlogTaskId; // Optional: link to a local BackLogTask

    // Getters and Setters
    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIssueType() {
        return issueType;
    }

    public void setIssueType(String issueType) {
        this.issueType = issueType;
    }

    public String getAssigneeAccountId() {
        return assigneeAccountId;
    }

    public void setAssigneeAccountId(String assigneeAccountId) {
        this.assigneeAccountId = assigneeAccountId;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public Long getBacklogTaskId() {
        return backlogTaskId;
    }

    public void setBacklogTaskId(Long backlogTaskId) {
        this.backlogTaskId = backlogTaskId;
    }
}
