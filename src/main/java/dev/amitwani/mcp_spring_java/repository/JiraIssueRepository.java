package dev.amitwani.mcp_spring_java.repository;

import dev.amitwani.mcp_spring_java.Entity.JiraIssue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JiraIssueRepository extends JpaRepository<JiraIssue, Long> {

    Optional<JiraIssue> findByJiraKey(String jiraKey);

    List<JiraIssue> findByStatus(String status);

    List<JiraIssue> findByAssigneeAccountId(String assigneeAccountId);

    List<JiraIssue> findByAssigneeDisplayNameContainingIgnoreCase(String displayName);

    List<JiraIssue> findByBacklogTaskId(Long backlogTaskId);

    boolean existsByJiraKey(String jiraKey);
}
