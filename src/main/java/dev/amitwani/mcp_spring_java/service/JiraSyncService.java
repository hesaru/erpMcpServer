package dev.amitwani.mcp_spring_java.service;

import dev.amitwani.mcp_spring_java.Entity.BackLogTask;
import dev.amitwani.mcp_spring_java.Entity.Employee;
import dev.amitwani.mcp_spring_java.Entity.JiraIssue;
import dev.amitwani.mcp_spring_java.config.JiraProperties;
import dev.amitwani.mcp_spring_java.dto.jira.CreateJiraIssueRequest;
import dev.amitwani.mcp_spring_java.dto.jira.CreateJiraIssueResponse;
import dev.amitwani.mcp_spring_java.dto.jira.JiraIssueDto;
import dev.amitwani.mcp_spring_java.dto.jira.JiraSearchResponse;
import dev.amitwani.mcp_spring_java.repository.BackLogTaskRepository;
import dev.amitwani.mcp_spring_java.repository.EmployeeRepository;
import dev.amitwani.mcp_spring_java.repository.JiraIssueRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service responsible for:
 * 1. Periodically syncing Jira issues from Atlassian into the local database
 * (every 60 seconds).
 * 2. Pushing a newly created BackLogTask (with assignee) to Atlassian
 * immediately.
 */
@Service
@Slf4j
public class JiraSyncService {

    private final JiraApiClient jiraApiClient;
    private final JiraIssueRepository jiraIssueRepository;
    private final BackLogTaskRepository backLogTaskRepository;
    private final EmployeeRepository employeeRepository;
    private final JiraProperties jiraProperties;

    @Autowired
    public JiraSyncService(JiraApiClient jiraApiClient,
            JiraIssueRepository jiraIssueRepository,
            BackLogTaskRepository backLogTaskRepository,
            EmployeeRepository employeeRepository,
            JiraProperties jiraProperties) {
        this.jiraApiClient = jiraApiClient;
        this.jiraIssueRepository = jiraIssueRepository;
        this.backLogTaskRepository = backLogTaskRepository;
        this.employeeRepository = employeeRepository;
        this.jiraProperties = jiraProperties;
    }

    /**
     * Scheduled task: syncs all Jira issues every 60 seconds.
     * Uses fixedDelay so each run starts 60s after the previous one completes.
     */
    @Scheduled(fixedDelay = 60000, initialDelay = 5000)
    @Transactional
    public void syncJiraIssues() {
        log.info("=== Starting scheduled Jira sync ===");
        try {
            JiraSearchResponse response = jiraApiClient
                    .searchIssues(
                            jiraProperties.getJql(),
                            jiraProperties.getMaxResults(),
                            List.of("summary", "status", "assignee", "issuetype"))
                    .block();

            if (response == null || response.getIssues() == null) {
                log.warn("Jira sync: received null/empty response");
                return;
            }

            int created = 0, updated = 0;
            for (JiraIssueDto dto : response.getIssues()) {
                Optional<JiraIssue> existing = jiraIssueRepository.findByJiraKey(dto.getKey());
                JiraIssue issue = existing.orElse(new JiraIssue());

                mapDtoToEntity(dto, issue);

                jiraIssueRepository.save(issue);
                if (existing.isPresent()) {
                    updated++;
                } else {
                    created++;
                }
            }

            log.info("=== Jira sync complete: {} created, {} updated ===", created, updated);
        } catch (Exception e) {
            log.error("Jira sync failed: {}", e.getMessage(), e);
        }
    }

    /**
     * Immediately create a Jira issue for the given BackLogTask and save the Jira
     * key back.
     * Called when a BackLogTask with an assignee is created via the REST API.
     */
    @Transactional
    public String pushIssueToJira(BackLogTask task) {
        CreateJiraIssueRequest request = new CreateJiraIssueRequest();
        request.setSummary(task.getTitle());
        request.setDescription(task.getDescription());
        request.setIssueType("Task");

        // Reload the full Employee from DB to get jiraAccountId
        // (the proxy from the incoming BackLogTask only has the ID)
        Employee assignee = null;
        if (task.getAssignee() != null && task.getAssignee().getId() != null) {
            assignee = employeeRepository.findById(task.getAssignee().getId()).orElse(null);
        }

        if (assignee != null && assignee.getJiraAccountId() != null
                && !assignee.getJiraAccountId().isBlank()) {
            request.setAssigneeAccountId(assignee.getJiraAccountId());
            log.info("Assigning Jira issue to account ID: {}", assignee.getJiraAccountId());
        } else {
            log.warn("No Jira account ID found for assignee — issue will be unassigned in Jira");
        }

        try {
            CreateJiraIssueResponse response = jiraApiClient.createIssue(request).block();
            if (response == null || response.getKey() == null) {
                log.error("Jira push: received null response for task '{}'", task.getTitle());
                return null;
            }

            String jiraKey = response.getKey();
            log.info("Pushed task '{}' to Jira as {}", task.getTitle(), jiraKey);

            // Save a linked JiraIssue record in local DB with backlogTaskId mapped
            JiraIssue jiraIssue = new JiraIssue();
            jiraIssue.setJiraKey(jiraKey);
            jiraIssue.setSummary(task.getTitle());
            jiraIssue.setStatus("Open");
            jiraIssue.setStatusCategory("To Do");
            jiraIssue.setIssueType("Task");
            jiraIssue.setBacklogTaskId(task.getId()); // link to the BackLogTask
            if (assignee != null) {
                jiraIssue.setAssigneeAccountId(assignee.getJiraAccountId());
                jiraIssue.setAssigneeDisplayName(
                        assignee.getFirstName() + " " + assignee.getLastName());
            }
            jiraIssueRepository.save(jiraIssue);

            // Update BackLogTask with the jira key
            task.setJiraKey(jiraKey);
            backLogTaskRepository.save(task);

            return jiraKey;
        } catch (Exception e) {
            log.error("Failed to push task '{}' to Jira: {}", task.getTitle(), e.getMessage(), e);
            return null;
        }
    }

    /**
     * Create a new Jira issue directly from a CreateJiraIssueRequest (called by
     * REST endpoint).
     * Saves the result to the local DB as well.
     */
    @Transactional
    public JiraIssue createAndSyncIssue(CreateJiraIssueRequest request) {
        CreateJiraIssueResponse response = jiraApiClient.createIssue(request).block();
        if (response == null || response.getKey() == null) {
            throw new RuntimeException("Jira API returned null response when creating issue");
        }

        String jiraKey = response.getKey();
        log.info("Created Jira issue {} via REST endpoint", jiraKey);

        JiraIssue issue = new JiraIssue();
        issue.setJiraKey(jiraKey);
        issue.setSummary(request.getSummary());
        issue.setStatus("Open");
        issue.setStatusCategory("To Do");
        issue.setIssueType(request.getIssueType() != null ? request.getIssueType() : "Task");
        if (request.getAssigneeAccountId() != null) {
            issue.setAssigneeAccountId(request.getAssigneeAccountId());
        }
        // Link to BackLogTask if provided
        if (request.getBacklogTaskId() != null) {
            issue.setBacklogTaskId(request.getBacklogTaskId());
            // Also write the jiraKey back to the BackLogTask
            backLogTaskRepository.findById(request.getBacklogTaskId()).ifPresent(task -> {
                task.setJiraKey(jiraKey);
                backLogTaskRepository.save(task);
            });
        }
        return jiraIssueRepository.save(issue);
    }

    /**
     * Maps a JiraIssueDto from the Atlassian API into a local JiraIssue entity.
     */
    private void mapDtoToEntity(JiraIssueDto dto, JiraIssue issue) {
        issue.setJiraKey(dto.getKey());

        if (dto.getFields() != null) {
            issue.setSummary(dto.getFields().getSummary());

            if (dto.getFields().getStatus() != null) {
                issue.setStatus(dto.getFields().getStatus().getName());
                if (dto.getFields().getStatus().getStatusCategory() != null) {
                    issue.setStatusCategory(dto.getFields().getStatus().getStatusCategory().getName());
                }
            }

            if (dto.getFields().getAssignee() != null) {
                issue.setAssigneeAccountId(dto.getFields().getAssignee().getAccountId());
                issue.setAssigneeDisplayName(dto.getFields().getAssignee().getDisplayName());
            } else {
                issue.setAssigneeAccountId(null);
                issue.setAssigneeDisplayName(null);
            }

            if (dto.getFields().getIssueType() != null) {
                issue.setIssueType(dto.getFields().getIssueType().getName());
            }
        }
    }
}
