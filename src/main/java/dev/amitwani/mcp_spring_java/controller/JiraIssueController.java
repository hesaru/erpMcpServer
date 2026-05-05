package dev.amitwani.mcp_spring_java.controller;

import dev.amitwani.mcp_spring_java.Entity.JiraIssue;
import dev.amitwani.mcp_spring_java.dto.jira.CreateJiraIssueRequest;
import dev.amitwani.mcp_spring_java.repository.JiraIssueRepository;
import dev.amitwani.mcp_spring_java.service.JiraSyncService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for Jira issue management.
 *
 */
@RestController
@RequestMapping("/api/jira")
@Slf4j
public class JiraIssueController {

    private final JiraIssueRepository jiraIssueRepository;
    private final JiraSyncService jiraSyncService;

    @Autowired
    public JiraIssueController(JiraIssueRepository jiraIssueRepository,
            JiraSyncService jiraSyncService) {
        this.jiraIssueRepository = jiraIssueRepository;
        this.jiraSyncService = jiraSyncService;
    }

    /**
     * GET /api/jira/issues
     * Optional query param: ?status=Open|In Progress|Done
     */
    @GetMapping("/issues")
    public ResponseEntity<List<JiraIssue>> getIssues(
            @RequestParam(required = false) String status) {

        List<JiraIssue> issues;
        if (status != null && !status.isBlank()) {
            log.info("REST: getIssues filtered by status={}", status);
            issues = jiraIssueRepository.findByStatus(status);
        } else {
            log.info("REST: getIssues - all issues");
            issues = jiraIssueRepository.findAll();
        }
        return ResponseEntity.ok(issues);
    }

    /**
     * GET /api/jira/issues/{key}
     * e.g. GET /api/jira/issues/SCRUM-5
     */
    @GetMapping("/issues/{key}")
    public ResponseEntity<JiraIssue> getIssueByKey(@PathVariable String key) {
        log.info("REST: getIssueByKey key={}", key);
        return jiraIssueRepository.findByJiraKey(key)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/jira/issues
     * Collects necessary info from the user, creates the issue in Atlassian
     * immediately,
     * and persists it in the local database.
     *
     * Request body:
     * {
     * "summary": "My new task",
     * "description": "Details...",
     * "issueType": "Task", // optional, default: Task
     * "assigneeAccountId": "...", // optional, Jira account ID
     * "priority": "Medium" // optional
     * }
     */
    @PostMapping("/issues")
    public ResponseEntity<?> createIssue(@RequestBody CreateJiraIssueRequest request) {
        log.info("REST: createIssue summary={}", request.getSummary());

        if (request.getSummary() == null || request.getSummary().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "summary is required"));
        }

        try {
            JiraIssue created = jiraSyncService.createAndSyncIssue(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            log.error("Failed to create Jira issue: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create Jira issue: " + e.getMessage()));
        }
    }

    /**
     * POST /api/jira/sync
     * Manually trigger an immediate Jira sync.
     */
    @PostMapping("/sync")
    public ResponseEntity<Map<String, Object>> triggerSync() {
        log.info("REST: manual Jira sync triggered");
        try {
            jiraSyncService.syncJiraIssues();
            long total = jiraIssueRepository.count();
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Jira sync completed",
                    "totalIssuesInDb", total));
        } catch (Exception e) {
            log.error("Manual Jira sync failed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", e.getMessage()));
        }
    }
}
