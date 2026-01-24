package dev.amitwani.mcp_spring_java.service;

import dev.amitwani.mcp_spring_java.model.CommitHistory;
import dev.amitwani.mcp_spring_java.model.User;
import dev.amitwani.mcp_spring_java.model.JiraTicket;
import dev.amitwani.mcp_spring_java.model.JiraComment;
import dev.amitwani.mcp_spring_java.model.JiraHistory;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import jakarta.annotation.PostConstruct;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@Slf4j
public class UserService {

  private final List<CommitHistory> commitList = new ArrayList<>();
  private final List<JiraTicket> jiraTickets = new ArrayList<>();
  private final WebClient githubWebClient;
  private final WebClient jiraWebClient;

  @Value("${github.repo.owner}")
  private String githubOwner;
  @Value("${github.repo.name}")
  private String githubRepo;
  @Value("${github.token}")
  private String githubToken;

  @Value("${jira.url}")
  private String jiraUrl;
  @Value("${jira.username}")
  private String jiraUsername;
  @Value("${jira.api-key}")
  private String jiraApiKey;

  public UserService(WebClient.Builder webClientBuilder) {
    this.githubWebClient = webClientBuilder.baseUrl("https://api.github.com").build();
    this.jiraWebClient = webClientBuilder.build();
  }

  @PostConstruct
  public void init() {
    log.info("Initializing UserService. Fetching commits for {}/{}", githubOwner, githubRepo);
    List<GitHubCommit> gitHubCommits = fetchCommits();

    if (gitHubCommits != null) {
      log.info("Fetched {} commits from GitHub. Processing...", gitHubCommits.size());
      processCommits(gitHubCommits);
    } else {
      log.warn("No commits fetched from GitHub.");
    }
  }

  private List<GitHubCommit> fetchCommits() {
    try {
      return githubWebClient.get()
          .uri("/repos/{owner}/{repo}/commits", githubOwner, githubRepo)
          .header("Authorization", "Bearer " + githubToken)
          .header("Accept", "application/vnd.github+json")
          .header("X-GitHub-Api-Version", "2022-11-28")
          .retrieve()
          .bodyToFlux(GitHubCommit.class)
          .collectList()
          .block();
    } catch (Exception e) {
      log.error("Error fetching commits from GitHub", e);
      return Collections.emptyList();
    }
  }

  private void processCommits(List<GitHubCommit> gitHubCommits) {
    Map<String, User> userCache = new HashMap<>();

    for (GitHubCommit ghCommit : gitHubCommits) {
      String authorName = ghCommit.commit.author.name;
      User user = userCache.computeIfAbsent(authorName, name -> {
        return new User(name,
            LocalDate.of(1990 + ThreadLocalRandom.current().nextInt(10), 1, 1),
            LocalDate.of(2020 + ThreadLocalRandom.current().nextInt(3), 1, 1),
            "Developer");
      });

      String message = ghCommit.commit.message;
      String devReference = extractDevReference(message);

      log.debug("Commit: {}, Extracted Key: {}", message.replace("\n", " "), devReference);

      LocalDateTime commitTime = LocalDateTime.parse(ghCommit.commit.author.date, DateTimeFormatter.ISO_DATE_TIME);
      CommitHistory commit = new CommitHistory(user, message, devReference, commitTime);

      JiraTicket jiraTicket = null;
      if (devReference != null) {
        jiraTicket = fetchJiraTicket(devReference, commitTime);
      }

      if (jiraTicket == null) {
        log.debug("Falling back to dummy ticket for commit: {}", devReference);
        jiraTicket = generateDummyJiraTicket(
            devReference != null ? devReference : "JIRA-" + ThreadLocalRandom.current().nextInt(1000, 9999), commit);
      } else {
        log.info("Successfully fetched real Jira ticket: {}", jiraTicket.getTicketId());
      }

      commit.setJiraTicket(jiraTicket);
      commitList.add(commit);
      jiraTickets.add(jiraTicket);
    }
    log.info("Loaded {} commits and tickets", commitList.size());
  }

  private String extractDevReference(String message) {
    // Case-insensitive matching for standard Jira keys like PROJ-123
    Pattern pattern = Pattern.compile("([A-Za-z]+-\\d+)");
    Matcher matcher = pattern.matcher(message);
    if (matcher.find()) {
      return matcher.group(1).toUpperCase();
    }
    return null;
  }

  private JiraTicket fetchJiraTicket(String issueKey, LocalDateTime commitTime) {
    try {
      String plainCreds = jiraUsername + ":" + jiraApiKey;
      String auth = Base64.getEncoder().encodeToString(plainCreds.getBytes());

      String baseUrl = jiraUrl.endsWith("/") ? jiraUrl.substring(0, jiraUrl.length() - 1) : jiraUrl;
      String fullUrl = baseUrl + "/rest/api/3/issue/" + issueKey;

      log.debug("Fetching Jira ticket from: {}", fullUrl);

      JiraIssue issue = jiraWebClient.get()
          .uri(fullUrl)
          .header("Authorization", "Basic " + auth)
          .header("Accept", "application/json")
          .retrieve()
          .bodyToMono(JiraIssue.class)
          .block();

      if (issue != null && issue.fields != null) {
        return mapToJiraTicket(issue, commitTime);
      }
    } catch (Exception e) {
      log.warn("Failed to fetch Jira ticket {}: {}", issueKey, e.getMessage());
    }
    return null;
  }

  private JiraTicket mapToJiraTicket(JiraIssue issue, LocalDateTime commitTime) {
    // Map basic fields
    List<JiraHistory> history = new ArrayList<>();
    List<JiraComment> comments = new ArrayList<>();

    return new JiraTicket(
        issue.key,
        issue.fields.summary != null ? issue.fields.summary : "No Summary",
        commitTime.minusDays(2),
        8.0,
        4.0,
        history,
        comments);
  }

  private JiraTicket generateDummyJiraTicket(String key, CommitHistory commit) {
    List<JiraHistory> history = new ArrayList<>();
    String[] fields = { "status", "effort", "priority", "assignee" };
    String[][] values = {
        { "To Do", "In Progress", "In Review", "Done" },
        { "2h", "4h", "8h", "16h" },
        { "Low", "Medium", "High", "Critical" },
        { "alice", "bob", "charlie", "diana", "eric" }
    };

    int changesCount = ThreadLocalRandom.current().nextInt(2, 5);
    LocalDateTime baseTime = commit.getCommitTime().minusDays(5);

    for (int i = 0; i < changesCount; i++) {
      int fieldIndex = i % fields.length;
      String field = fields[fieldIndex];
      String oldValue = values[fieldIndex][ThreadLocalRandom.current().nextInt(values[fieldIndex].length)];
      String newValue;
      do {
        newValue = values[fieldIndex][ThreadLocalRandom.current().nextInt(values[fieldIndex].length)];
      } while (newValue.equals(oldValue));

      LocalDateTime changedAt = baseTime.plusHours(i * 12L + ThreadLocalRandom.current().nextInt(0, 6));
      history.add(new JiraHistory(field, oldValue, newValue, changedAt));
    }

    return new JiraTicket(key, "Task related to " + key, commit.getCommitTime().minusDays(1), 8.0, 0.0, history,
        new ArrayList<>());
  }

  // DTOs for GitHub API response
  record GitHubCommit(CommitDetail commit) {
  }

  record CommitDetail(Author author, String message) {
  }

  record Author(String name, String date) {
  }

  // DTOs for Jira
  record JiraIssue(String key, JiraFields fields) {
  }

  record JiraFields(String summary, String status) {
  }

  @Tool(name = "getUserGitCommitsByUserName", description = "Get a user's git commit history. These commits may reflect performance and stress levels.")
  public List<CommitHistory> getCommitHistoryByUser(String userName) {
    return commitList.stream()
        .filter(commit -> commit.getUser().getUserName().equalsIgnoreCase(userName))
        .collect(Collectors.toList());
  }

  @Tool(name = "getAllUsers", description = "Get the list of all users in the system.")
  public List<User> getAllUsers() {
    return commitList.stream()
        .map(CommitHistory::getUser)
        .distinct()
        .collect(Collectors.toList());
  }

  @Tool(name = "getAllCommits", description = "Get the list of all git commits by all users.")
  public List<CommitHistory> getAllCommits() {
    return commitList;
  }

  @Tool(name = "getAllJiraTickets", description = "Get the list of all Jira tickets.")
  public List<JiraTicket> getAllJiraTickets() {
    return jiraTickets;
  }

  @Tool(name = "getJiraTicketsByUser", description = "Get Jira tickets assigned to a user based on their comments.")
  public List<JiraTicket> getJiraTicketsByUser(String userName) {
    return jiraTickets.stream()
        .filter(ticket -> ticket.getComments().stream()
            .anyMatch(comment -> comment.getCommenter().getUserName().equalsIgnoreCase(userName)))
        .collect(Collectors.toList());
  }
}
