package dev.amitwani.mcp_spring_java.service;

import dev.amitwani.mcp_spring_java.model.CommitHistory;
import dev.amitwani.mcp_spring_java.model.User;
import dev.amitwani.mcp_spring_java.model.JiraTicket;
import dev.amitwani.mcp_spring_java.model.JiraComment;
import dev.amitwani.mcp_spring_java.model.JiraHistory;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import dev.amitwani.mcp_spring_java.repository.EmployeeRepository;
import dev.amitwani.mcp_spring_java.Entity.Employee;
import org.springframework.beans.factory.annotation.Autowired;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@Slf4j
public class UserService {

  private final List<CommitHistory> commitList = new ArrayList<>();
  private final List<JiraTicket> jiraTickets = new ArrayList<>();

  private final EmployeeRepository employeeRepository;

  private final String[] randomCommentTexts = {
      "Initial analysis done, starting implementation.",
      "Facing some issues, investigating root cause.",
      "Code review completed, waiting for merge.",
      "Deployed to staging for testing.",
      "Fixed the bugs reported during QA.",
      "Performance optimized based on feedback.",
      "Updating documentation and comments.",
      "Pending approvals from project manager.",
      "Final testing underway before release.",
      "Refactoring some modules for better clarity."
  };

  @Autowired
  public UserService(EmployeeRepository employeeRepository) {
    this.employeeRepository = employeeRepository;

    List<Employee> dbEmployees = employeeRepository.findAll();
    String[] dbUserNames;
    if (dbEmployees != null && !dbEmployees.isEmpty()) {
      dbUserNames = dbEmployees.stream().map(Employee::getUserName).toArray(String[]::new);
    } else {
      dbUserNames = new String[] { "alice", "bob", "charlie", "diana", "eric" };
    }

    User user1 = new User(dbUserNames[0], LocalDate.of(1990, 1, 5), LocalDate.of(2020, 2, 15), "Software Engineer");
    User user2 = new User(dbUserNames[1], LocalDate.of(1988, 4, 22), LocalDate.of(2019, 8, 12), "Senior Developer");
    User user3 = new User(dbUserNames[2], LocalDate.of(1992, 11, 30), LocalDate.of(2021, 1, 1), "DevOps Engineer");
    User user4 = new User(dbUserNames[3], LocalDate.of(1995, 6, 18), LocalDate.of(2022, 3, 20), "QA Analyst");
//    User user5 = new User(dbUserNames[0] LocalDate.of(1985, 9, 9), LocalDate.of(2018, 5, 10), "Team Lead");

    List<CommitHistory> originalCommits = List.of(
        new CommitHistory(user1, "Refactored login module", "DEV-101", LocalDateTime.of(2025, 7, 1, 10, 15)),
        new CommitHistory(user2, "Added user profile page", "DEV-102", LocalDateTime.of(2025, 7, 2, 14, 30)),
        new CommitHistory(user1, "Fixed null pointer in payment", "BUG-301", LocalDateTime.of(2025, 7, 3, 9, 45)),
        new CommitHistory(user3, "Improved dashboard load time", "PERF-105", LocalDateTime.of(2025, 7, 5, 16, 10)),
        new CommitHistory(user4, "Updated API version", "MAINT-200", LocalDateTime.of(2025, 7, 6, 11, 5)),

        new CommitHistory(user2, "Implemented JWT auth", "SEC-112", LocalDateTime.of(2025, 7, 1, 11, 20)),
        new CommitHistory(user2, "Migrated DB schema", "DB-220", LocalDateTime.of(2025, 7, 2, 15, 0)),
        new CommitHistory(user2, "Fixed caching issue", "BUG-302", LocalDateTime.of(2025, 7, 3, 12, 25)),
        new CommitHistory(user2, "Optimized report generator", "PERF-110", LocalDateTime.of(2025, 7, 4, 18, 40)),
        new CommitHistory(user2, "Removed deprecated endpoints", "CLEAN-404", LocalDateTime.of(2025, 7, 5, 17, 55)),

        new CommitHistory(user3, "Added CI/CD pipeline", "DEVOPS-500", LocalDateTime.of(2025, 7, 1, 8, 50)),
        new CommitHistory(user3, "Enabled blue-green deployment", "DEVOPS-501", LocalDateTime.of(2025, 7, 2, 9, 10)),
        new CommitHistory(user3, "Dockerized payment service", "DOCKER-333", LocalDateTime.of(2025, 7, 3, 10, 20)),
        new CommitHistory(user3, "Set up monitoring dashboard", "MON-404", LocalDateTime.of(2025, 7, 4, 13, 35)),
        new CommitHistory(user3, "Upgraded Kubernetes version", "K8S-221", LocalDateTime.of(2025, 7, 6, 14, 15)),

        new CommitHistory(user4, "Wrote test cases for login", "QA-123", LocalDateTime.of(2025, 7, 1, 16, 40)),
        new CommitHistory(user4, "Automated regression suite", "QA-124", LocalDateTime.of(2025, 7, 2, 11, 50)),
        new CommitHistory(user4, "Logged issue for UI misalignment", "BUG-400", LocalDateTime.of(2025, 7, 3, 9, 5)),
        new CommitHistory(user4, "Improved test coverage to 85%", "QA-125", LocalDateTime.of(2025, 7, 4, 15, 25)),
        new CommitHistory(user4, "Updated test data source", "QA-126", LocalDateTime.of(2025, 7, 6, 13, 10)));

//        new CommitHistory(user5, "Reviewed PRs and merged", "MGMT-101", LocalDateTime.of(2025, 7, 1, 10, 10)),
//        new CommitHistory(user5, "Assigned tasks for sprint 45", "MGMT-102", LocalDateTime.of(2025, 7, 2, 10, 30)),
//        new CommitHistory(user5, "Fixed blocker issue", "BUG-333", LocalDateTime.of(2025, 7, 3, 14, 0)),
//        new CommitHistory(user5, "Planned feature roadmap", "PLAN-111", LocalDateTime.of(2025, 7, 5, 16, 20)),
//        new CommitHistory(user5, "Conducted code review", "REVIEW-210", LocalDateTime.of(2025, 7, 6, 12, 45)));

    int jiraCounter = 1000;

    for (CommitHistory commit : originalCommits) {
      // Generate Jira History with random but varied changes
      List<JiraHistory> history = new ArrayList<>();
      String[] fields = { "status", "effort", "priority", "assignee" };
      String[][] values = {
          { "To Do", "In Progress", "In Review", "Done" },
          { "2h", "4h", "8h", "16h" },
          { "Low", "Medium", "High", "Critical" },
          dbUserNames
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
        } while (newValue.equals(oldValue)); // ensure change

        LocalDateTime changedAt = baseTime.plusHours(i * 12L + ThreadLocalRandom.current().nextInt(0, 6));
        history.add(new JiraHistory(field, oldValue, newValue, changedAt));
      }

      // Generate random comments (2-4 per ticket)
      int commentCount = ThreadLocalRandom.current().nextInt(2, 5);
      List<JiraComment> comments = new ArrayList<>();
      for (int i = 0; i < commentCount; i++) {
        String text = randomCommentTexts[ThreadLocalRandom.current().nextInt(randomCommentTexts.length)];
        LocalDateTime commentTime = commit.getCommitTime().minusHours(ThreadLocalRandom.current().nextInt(1, 24));
        comments.add(new JiraComment(commit.getUser(), text, commentTime));
      }

      JiraTicket jiraTicket = new JiraTicket(
          "JIRA-" + jiraCounter++,
          "Task related to " + commit.getDevelopmentReference(),
          commit.getCommitTime().minusDays(3),
          8.0,
          6.5,
          history,
          comments);

      // Link JiraTicket to CommitHistory
      commit.setJiraTicket(jiraTicket);

      // Add to service lists
      commitList.add(commit);
      jiraTickets.add(jiraTicket);
    }
  }

  // Legacy data accessors (no longer exposed as MCP tools — real data tools are in
  // GitHubMcpTools, JiraMcpTools, and WellBeingMcpTools)

  public List<CommitHistory> getCommitHistoryByUser(String userName) {
    return commitList.stream()
        .filter(commit -> commit.getUser().getUserName().equalsIgnoreCase(userName))
        .collect(Collectors.toList());
  }

  public List<User> getAllUsers() {
    return commitList.stream()
        .map(CommitHistory::getUser)
        .distinct()
        .collect(Collectors.toList());
  }

  public List<CommitHistory> getAllCommits() {
    return commitList;
  }

  public List<JiraTicket> getAllJiraTickets() {
    return jiraTickets;
  }

  public List<JiraTicket> getJiraTicketsByUser(String userName) {
    return jiraTickets.stream()
        .filter(ticket -> ticket.getComments().stream()
            .anyMatch(comment -> comment.getCommenter().getUserName().equalsIgnoreCase(userName)))
        .collect(Collectors.toList());
  }
}
