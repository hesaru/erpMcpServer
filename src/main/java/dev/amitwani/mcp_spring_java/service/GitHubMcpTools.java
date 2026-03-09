package dev.amitwani.mcp_spring_java.service;

import dev.amitwani.mcp_spring_java.Entity.GitCommit;
import dev.amitwani.mcp_spring_java.repository.GitCommitRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * MCP tools exposed to the AI client for querying GitHub commit data.
 */
@Service
@Slf4j
public class GitHubMcpTools {

    private final GitCommitRepository gitCommitRepository;
    private final GitHubSyncService gitHubSyncService;

    @Autowired
    public GitHubMcpTools(GitCommitRepository gitCommitRepository,
            GitHubSyncService gitHubSyncService) {
        this.gitCommitRepository = gitCommitRepository;
        this.gitHubSyncService = gitHubSyncService;
    }

    @Tool(name = "getAllGitCommits", description = "Get all GitHub commits that have been synced to the local database.")
    public List<GitCommit> getAllGitCommits() {
        log.info("[MCP] getAllGitCommits called");
        return gitCommitRepository.findAll();
    }

    @Tool(name = "getGitCommitBySha", description = "Get a single GitHub commit by its SHA hash.")
    public GitCommit getGitCommitBySha(String sha) {
        log.info("[MCP] getGitCommitBySha called with sha: {}", sha);
        return gitCommitRepository.findBySha(sha).orElse(null);
    }

    @Tool(name = "getGitCommitsByJiraKey", description = "Get all GitHub commits linked to a specific Jira issue key, e.g. 'SCRUM-5'.")
    public List<GitCommit> getGitCommitsByJiraKey(String jiraKey) {
        log.info("[MCP] getGitCommitsByJiraKey called with key: {}", jiraKey);
        return gitCommitRepository.findByJiraKey(jiraKey);
    }

    @Tool(name = "getGitCommitsByAuthor", description = "Get all GitHub commits by a specific GitHub username/author.")
    public List<GitCommit> getGitCommitsByAuthor(String githubUsername) {
        log.info("[MCP] getGitCommitsByAuthor called with username: {}", githubUsername);
        return gitCommitRepository.findByAuthorGithubUsername(githubUsername);
    }

    @Tool(name = "getLinkedGitCommits", description = "Get all GitHub commits that are linked to a Jira ticket (have a Jira key in their message).")
    public List<GitCommit> getLinkedGitCommits() {
        log.info("[MCP] getLinkedGitCommits called");
        return gitCommitRepository.findByJiraKeyIsNotNull();
    }

    @Tool(name = "getUnlinkedGitCommits", description = "Get all GitHub commits that are NOT linked to any Jira ticket.")
    public List<GitCommit> getUnlinkedGitCommits() {
        log.info("[MCP] getUnlinkedGitCommits called");
        return gitCommitRepository.findByJiraKeyIsNull();
    }

    @Tool(name = "syncGitHubCommitsNow", description = "Manually trigger an immediate sync of GitHub commits from all employees with GitHub usernames into the local database. Returns a status message.")
    public String syncGitHubCommitsNow() {
        log.info("[MCP] syncGitHubCommitsNow triggered by MCP client");
        try {
            gitHubSyncService.syncGitHubCommits();
            long total = gitCommitRepository.count();
            return "GitHub commit sync completed successfully. Total commits in DB: " + total;
        } catch (Exception e) {
            return "GitHub commit sync failed: " + e.getMessage();
        }
    }
}
