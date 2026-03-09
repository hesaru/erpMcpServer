package dev.amitwani.mcp_spring_java.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "JIRA_ISSUES")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JiraIssue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String jiraKey; // e.g., SCRUM-5

    @Column(length = 1000)
    private String summary;

    private String status; // e.g., Open, In Progress, Done
    private String statusCategory; // e.g., To Do, In Progress, Done

    private String assigneeAccountId;
    private String assigneeDisplayName;

    private String issueType; // Task, Bug, Story, etc.

    @Column(nullable = true)
    private Long backlogTaskId; // FK reference to BACKLOG_TASKS (nullable)

    private LocalDateTime syncedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.syncedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        this.syncedAt = LocalDateTime.now();
    }
}
