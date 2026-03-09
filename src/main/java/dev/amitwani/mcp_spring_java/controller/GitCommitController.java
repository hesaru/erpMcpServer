package dev.amitwani.mcp_spring_java.controller;

import dev.amitwani.mcp_spring_java.Entity.GitCommit;
import dev.amitwani.mcp_spring_java.repository.GitCommitRepository;
import dev.amitwani.mcp_spring_java.service.GitHubSyncService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for GitHub commit data.
 *
 * Endpoints:
 * GET /api/github/commits — all commits (optional filters: ?jiraKey=, ?author=)
 * GET /api/github/commits/{sha} — single commit by SHA
 * GET /api/github/commits/by-jira/{jiraKey} — commits linked to a Jira issue
 * GET /api/github/commits/by-author/{username} — commits by GitHub author
 * GET /api/github/commits/linked — commits with a Jira key
 * GET /api/github/commits/unlinked — commits without a Jira key
 * POST /api/github/sync — trigger manual sync
 */
@RestController
@RequestMapping("/api/github")
@Slf4j
public class GitCommitController {

    private final GitCommitRepository gitCommitRepository;
    private final GitHubSyncService gitHubSyncService;

    @Autowired
    public GitCommitController(GitCommitRepository gitCommitRepository,
            GitHubSyncService gitHubSyncService) {
        this.gitCommitRepository = gitCommitRepository;
        this.gitHubSyncService = gitHubSyncService;
    }

    /**
     * GET /api/github/commits
     * Optional query params: ?jiraKey=SCRUM-5 or ?author=sathirauop
     */
    @GetMapping("/commits")
    public ResponseEntity<List<GitCommit>> getCommits(
            @RequestParam(required = false) String jiraKey,
            @RequestParam(required = false) String author) {

        List<GitCommit> commits;
        if (jiraKey != null && !jiraKey.isBlank()) {
            log.info("REST: getCommits filtered by jiraKey={}", jiraKey);
            commits = gitCommitRepository.findByJiraKey(jiraKey);
        } else if (author != null && !author.isBlank()) {
            log.info("REST: getCommits filtered by author={}", author);
            commits = gitCommitRepository.findByAuthorGithubUsername(author);
        } else {
            log.info("REST: getCommits - all commits");
            commits = gitCommitRepository.findAll();
        }
        return ResponseEntity.ok(commits);
    }

    /**
     * GET /api/github/commits/{sha}
     */
    @GetMapping("/commits/{sha}")
    public ResponseEntity<GitCommit> getCommitBySha(@PathVariable String sha) {
        log.info("REST: getCommitBySha sha={}", sha);
        return gitCommitRepository.findBySha(sha)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/github/commits/by-jira/{jiraKey}
     * e.g., GET /api/github/commits/by-jira/SCRUM-5
     */
    @GetMapping("/commits/by-jira/{jiraKey}")
    public ResponseEntity<List<GitCommit>> getCommitsByJiraKey(@PathVariable String jiraKey) {
        log.info("REST: getCommitsByJiraKey jiraKey={}", jiraKey);
        List<GitCommit> commits = gitCommitRepository.findByJiraKey(jiraKey);
        return ResponseEntity.ok(commits);
    }

    /**
     * GET /api/github/commits/by-author/{username}
     */
    @GetMapping("/commits/by-author/{username}")
    public ResponseEntity<List<GitCommit>> getCommitsByAuthor(@PathVariable String username) {
        log.info("REST: getCommitsByAuthor username={}", username);
        List<GitCommit> commits = gitCommitRepository.findByAuthorGithubUsername(username);
        return ResponseEntity.ok(commits);
    }

    /**
     * GET /api/github/commits/linked
     * Returns only commits that have a Jira key linked.
     */
    @GetMapping("/commits/linked")
    public ResponseEntity<List<GitCommit>> getLinkedCommits() {
        log.info("REST: getLinkedCommits");
        return ResponseEntity.ok(gitCommitRepository.findByJiraKeyIsNotNull());
    }

    /**
     * GET /api/github/commits/unlinked
     * Returns only commits that do NOT have a Jira key linked.
     */
    @GetMapping("/commits/unlinked")
    public ResponseEntity<List<GitCommit>> getUnlinkedCommits() {
        log.info("REST: getUnlinkedCommits");
        return ResponseEntity.ok(gitCommitRepository.findByJiraKeyIsNull());
    }

    /**
     * POST /api/github/sync
     * Manually trigger an immediate GitHub commit sync.
     */
    @PostMapping("/sync")
    public ResponseEntity<Map<String, Object>> triggerSync() {
        log.info("REST: manual GitHub sync triggered");
        try {
            gitHubSyncService.syncGitHubCommits();
            long total = gitCommitRepository.count();
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "GitHub commit sync completed",
                    "totalCommitsInDb", total));
        } catch (Exception e) {
            log.error("Manual GitHub sync failed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", e.getMessage()));
        }
    }
}
