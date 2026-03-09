package dev.amitwani.mcp_spring_java.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * JPA entity representing a single Git commit fetched from GitHub.
 * Commits that contain a Jira key prefix (e.g., "SCRUM-5:...") are linked
 * via the jiraKey column.
 */
@Entity
@Table(name = "GIT_COMMITS")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GitCommit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Full 40-character SHA of the commit — natural unique key. */
    @Column(unique = true, nullable = false, length = 40)
    private String sha;

    /** The full commit message. */
    @Column(length = 2000)
    private String message;

    /** GitHub username of the commit author. */
    private String authorGithubUsername;

    /** Email address of the commit author (from the Git commit metadata). */
    private String authorEmail;

    /** Author display name from GitHub. */
    private String authorName;

    /** Timestamp of the commit. */
    private LocalDateTime commitDate;

    /** Link to the commit on GitHub. */
    @Column(length = 500)
    private String htmlUrl;

    /** Repository full name, e.g. "owner/repo". */
    private String repositoryName;

    /**
     * Extracted Jira key from the commit message prefix, e.g. "SCRUM-5".
     * Null when the commit message does not reference a Jira ticket.
     */
    @Column(nullable = true)
    private String jiraKey;

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
