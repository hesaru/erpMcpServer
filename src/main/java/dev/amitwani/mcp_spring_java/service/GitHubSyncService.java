package dev.amitwani.mcp_spring_java.service;

import dev.amitwani.mcp_spring_java.Entity.Employee;
import dev.amitwani.mcp_spring_java.Entity.GitCommit;
import dev.amitwani.mcp_spring_java.dto.github.GitHubCommitDto;
import dev.amitwani.mcp_spring_java.dto.github.GitHubCommitSearchResponse;
import dev.amitwani.mcp_spring_java.repository.EmployeeRepository;
import dev.amitwani.mcp_spring_java.repository.GitCommitRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Service responsible for periodically syncing GitHub commits into the local
 * database. Runs on server startup (after a short delay) and every 10 minutes.
 *
 * For each Employee that has a GitHub username, it calls the GitHub Commit
 * Search API, upserts commits by SHA, and extracts Jira ticket IDs from commit
 * messages when present (e.g., "SCRUM-5:some description").
 */
@Service
@Slf4j
public class GitHubSyncService {

    /**
     * Regex to extract a Jira-style key from the beginning of a commit message.
     * Matches patterns like: "SCRUM-5:", "PROJ-123:", "AB-1:" etc.
     * The key MUST be followed by a colon.
     */
    private static final Pattern JIRA_KEY_PATTERN = Pattern.compile("^([A-Z][A-Z0-9]+-\\d+)\\s*:");

    private final GitHubApiClient gitHubApiClient;
    private final GitCommitRepository gitCommitRepository;
    private final EmployeeRepository employeeRepository;

    @Autowired
    public GitHubSyncService(GitHubApiClient gitHubApiClient,
            GitCommitRepository gitCommitRepository,
            EmployeeRepository employeeRepository) {
        this.gitHubApiClient = gitHubApiClient;
        this.gitCommitRepository = gitCommitRepository;
        this.employeeRepository = employeeRepository;
    }

    /**
     * Scheduled task: syncs all GitHub commits every 10 minutes.
     * Initial delay of 10 seconds allows the application to finish booting.
     */
    @Scheduled(fixedDelay = 600000, initialDelay = 10000)
    @Transactional
    public void syncGitHubCommits() {
        log.info("=== Starting scheduled GitHub commit sync ===");
        try {
            // Find all employees that have a GitHub username
            List<Employee> employees = employeeRepository.findAllByGithubUsernameIsNotNull();
            if (employees.isEmpty()) {
                log.info("No employees with GitHub usernames found — skipping GitHub sync");
                return;
            }

            int totalCreated = 0, totalUpdated = 0;

            for (Employee employee : employees) {
                String ghUsername = employee.getGithubUsername();
                if (ghUsername == null || ghUsername.isBlank()) {
                    continue;
                }

                log.info("Syncing GitHub commits for employee: {} (GitHub: {})",
                        employee.getFirstName() + " " + employee.getLastName(), ghUsername);

                try {
                    int[] counts = syncCommitsForUser(ghUsername);
                    totalCreated += counts[0];
                    totalUpdated += counts[1];
                } catch (Exception e) {
                    log.error("Failed to sync commits for GitHub user {}: {}", ghUsername, e.getMessage(), e);
                }
            }

            log.info("=== GitHub commit sync complete: {} created, {} updated ===", totalCreated, totalUpdated);
        } catch (Exception e) {
            log.error("GitHub commit sync failed: {}", e.getMessage(), e);
        }
    }

    /**
     * Sync commits for a single GitHub username across all pages.
     *
     * @return int[]{created, updated}
     */
    private int[] syncCommitsForUser(String githubUsername) {
        int created = 0, updated = 0;
        int page = 1;
        int perPage = 30; // Keep response size manageable
        boolean hasMore = true;

        while (hasMore) {
            GitHubCommitSearchResponse response = gitHubApiClient
                    .searchCommitsByAuthor(githubUsername, page, perPage)
                    .block();

            if (response == null || response.getItems() == null || response.getItems().isEmpty()) {
                break;
            }

            for (GitHubCommitDto dto : response.getItems()) {
                Optional<GitCommit> existing = gitCommitRepository.findBySha(dto.getSha());
                GitCommit commit = existing.orElse(new GitCommit());

                mapDtoToEntity(dto, commit, githubUsername);
                gitCommitRepository.save(commit);

                if (existing.isPresent()) {
                    updated++;
                } else {
                    created++;
                }
            }

            // If the items returned are less than perPage, we've reached the end
            if (response.getItems().size() < perPage) {
                hasMore = false;
            } else {
                page++;
                // GitHub Search API has a rate limit; cap at 10 pages (1000 commits) per user
                if (page > 10) {
                    log.warn("Reached page limit (10) for GitHub user {}. Stopping pagination.", githubUsername);
                    hasMore = false;
                }
            }
        }

        log.info("GitHub sync for user {}: {} created, {} updated", githubUsername, created, updated);
        return new int[] { created, updated };
    }

    /**
     * Maps a GitHubCommitDto from the GitHub API into a local GitCommit entity.
     */
    private void mapDtoToEntity(GitHubCommitDto dto, GitCommit entity, String githubUsername) {
        entity.setSha(dto.getSha());
        entity.setHtmlUrl(dto.getHtmlUrl());
        entity.setAuthorGithubUsername(
                dto.getAuthor() != null ? dto.getAuthor().getLogin() : githubUsername);

        if (dto.getCommit() != null) {
            entity.setMessage(dto.getCommit().getMessage());

            if (dto.getCommit().getAuthor() != null) {
                entity.setAuthorEmail(dto.getCommit().getAuthor().getEmail());
                entity.setAuthorName(dto.getCommit().getAuthor().getName());

                // Parse commit date from ISO-8601
                if (dto.getCommit().getAuthor().getDate() != null) {
                    try {
                        OffsetDateTime odt = OffsetDateTime.parse(
                                dto.getCommit().getAuthor().getDate(), DateTimeFormatter.ISO_OFFSET_DATE_TIME);
                        entity.setCommitDate(odt.toLocalDateTime());
                    } catch (Exception e) {
                        log.warn("Could not parse commit date '{}': {}", dto.getCommit().getAuthor().getDate(),
                                e.getMessage());
                    }
                }
            }

            // Extract Jira key from the commit message
            String jiraKey = extractJiraKey(dto.getCommit().getMessage());
            entity.setJiraKey(jiraKey);
        }

        if (dto.getRepository() != null) {
            entity.setRepositoryName(dto.getRepository().getFullName());
        }
    }

    /**
     * Extracts a Jira issue key from the beginning of a commit message.
     * E.g., "SCRUM-5:Development of trace log" → "SCRUM-5"
     *
     * @return the Jira key if found, or null otherwise
     */
    public static String extractJiraKey(String commitMessage) {
        if (commitMessage == null || commitMessage.isBlank()) {
            return null;
        }
        Matcher matcher = JIRA_KEY_PATTERN.matcher(commitMessage.trim());
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }
}
