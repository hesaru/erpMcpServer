package dev.amitwani.mcp_spring_java.service;

import dev.amitwani.mcp_spring_java.Entity.JiraIssue;
import dev.amitwani.mcp_spring_java.repository.JiraIssueRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * MCP tools exposed to the AI client for querying Jira issues.
 * NOTE: Issue creation is intentionally NOT included here — it is done via
 * the REST endpoint POST /api/jira/issues instead.
 */
@Service
@Slf4j
public class JiraMcpTools {

    private final JiraIssueRepository jiraIssueRepository;
    private final JiraSyncService jiraSyncService;

    @Autowired
    public JiraMcpTools(JiraIssueRepository jiraIssueRepository,
            JiraSyncService jiraSyncService) {
        this.jiraIssueRepository = jiraIssueRepository;
        this.jiraSyncService = jiraSyncService;
    }

    @Tool(name = "getAllJiraIssues", description = "Get all Jira issues that have been synced to the local database from Atlassian.")
    public List<JiraIssue> getAllJiraIssues() {
        log.info("[MCP] getAllJiraIssues called");
        return jiraIssueRepository.findAll();
    }

    @Tool(name = "getJiraIssueByKey", description = "Get a single Jira issue by its Jira key, e.g. SCRUM-5.")
    public JiraIssue getJiraIssueByKey(String jiraKey) {
        log.info("[MCP] getJiraIssueByKey called with key: {}", jiraKey);
        return jiraIssueRepository.findByJiraKey(jiraKey).orElse(null);
    }

    @Tool(name = "getJiraIssuesByStatus", description = "Get Jira issues filtered by their status, e.g. 'Open', 'In Progress', 'Done'.")
    public List<JiraIssue> getJiraIssuesByStatus(String status) {
        log.info("[MCP] getJiraIssuesByStatus called with status: {}", status);
        return jiraIssueRepository.findByStatus(status);
    }

    @Tool(name = "getJiraIssuesByAssignee", description = "Get all Jira issues assigned to a particular person by their display name (partial match).")
    public List<JiraIssue> getJiraIssuesByAssignee(String displayName) {
        log.info("[MCP] getJiraIssuesByAssignee called with name: {}", displayName);
        return jiraIssueRepository.findByAssigneeDisplayNameContainingIgnoreCase(displayName);
    }

    @Tool(name = "syncJiraIssuesNow", description = "Manually trigger an immediate sync of Jira issues from Atlassian into the local database. Returns a status message.")
    public String syncJiraIssuesNow() {
        log.info("[MCP] syncJiraIssuesNow triggered by MCP client");
        try {
            jiraSyncService.syncJiraIssues();
            long total = jiraIssueRepository.count();
            return "Jira sync completed successfully. Total issues in DB: " + total;
        } catch (Exception e) {
            return "Jira sync failed: " + e.getMessage();
        }
    }

    @Tool(name = "getJiraIssuesByBacklogTaskId", description = "Get Jira issues linked to a specific local BackLog task by its ID.")
    public List<JiraIssue> getJiraIssuesByBacklogTaskId(Long backlogTaskId) {
        log.info("[MCP] getJiraIssuesByBacklogTaskId called with id: {}", backlogTaskId);
        return jiraIssueRepository.findByBacklogTaskId(backlogTaskId);
    }
}
