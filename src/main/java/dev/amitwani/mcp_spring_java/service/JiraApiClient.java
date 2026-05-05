package dev.amitwani.mcp_spring_java.service;

import dev.amitwani.mcp_spring_java.config.JiraProperties;
import dev.amitwani.mcp_spring_java.dto.jira.CreateJiraIssueRequest;
import dev.amitwani.mcp_spring_java.dto.jira.CreateJiraIssueResponse;
import dev.amitwani.mcp_spring_java.dto.jira.JiraSearchResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Reactive WebClient-based client for the Atlassian Jira REST API v3.
 */
@Service
@Slf4j
public class JiraApiClient {

    private final WebClient webClient;
    private final JiraProperties jiraProperties;

    @Autowired
    public JiraApiClient(JiraProperties jiraProperties, WebClient.Builder webClientBuilder) {
        this.jiraProperties = jiraProperties;
        this.webClient = webClientBuilder
                .baseUrl(jiraProperties.getBaseUrl())
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Basic " + jiraProperties.getAuthToken())
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    /**
     * Search for Jira issues using JQL via POST /rest/api/3/search/jql
     */
    public Mono<JiraSearchResponse> searchIssues(String jql, int maxResults, List<String> fields) {
        Map<String, Object> body = new HashMap<>();
        body.put("jql", jql);
        body.put("maxResults", maxResults);
        body.put("fields", fields != null ? fields : List.of("summary", "status", "assignee", "issuetype"));

        log.debug("Calling Jira search API with JQL: {}", jql);

        return webClient.post()
                .uri("/rest/api/3/search/jql")
                .bodyValue(body)
                .retrieve()
                .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                        clientResponse -> clientResponse.bodyToMono(String.class)
                                .doOnNext(errorBody -> log.error("Jira search API error {}: {}",
                                        clientResponse.statusCode(), errorBody))
                                .flatMap(errorBody -> Mono.error(
                                        new RuntimeException("Jira search failed [" + clientResponse.statusCode() + "]: " + errorBody))))
                .bodyToMono(JiraSearchResponse.class)
                .doOnSuccess(resp -> log.debug("Jira search returned {} issues",
                        resp != null && resp.getIssues() != null ? resp.getIssues().size() : 0))
                .doOnError(err -> log.error("Jira search API error: {}", err.getMessage()));
    }

    /**
     * Create a new Jira issue via POST /rest/api/3/issue.
     * The request is assembled from user-provided fields and project config.
     * If Jira rejects the assignee (stale/invalid account ID), automatically
     * retries without the assignee so the ticket is still created.
     */
    public Mono<CreateJiraIssueResponse> createIssue(CreateJiraIssueRequest request) {
        String issueTypeName = (request.getIssueType() != null && !request.getIssueType().isBlank())
                ? request.getIssueType()
                : jiraProperties.getDefaultIssueType();

        // Build the Atlassian-style request body
        Map<String, Object> fields = new HashMap<>();
        fields.put("project", Map.of("key", jiraProperties.getProjectKey()));
        fields.put("summary", request.getSummary());
        fields.put("issuetype", Map.of("name", issueTypeName));

        if (request.getDescription() != null && !request.getDescription().isBlank()) {
            // Jira accepts Atlassian Document Format (ADF) for description
            fields.put("description", buildAdfDescription(request.getDescription()));
        }

        if (request.getAssigneeAccountId() != null && !request.getAssigneeAccountId().isBlank()) {
            fields.put("assignee", Map.of("accountId", request.getAssigneeAccountId()));
        }

        if (request.getPriority() != null && !request.getPriority().isBlank()) {
            fields.put("priority", Map.of("name", request.getPriority()));
        }

        Map<String, Object> body = Map.of("fields", fields);

        log.info("Creating Jira issue in project {}: {} (assignee={})",
                jiraProperties.getProjectKey(), request.getSummary(), request.getAssigneeAccountId());

        return webClient.post()
                .uri("/rest/api/3/issue")
                .bodyValue(body)
                .retrieve()
                .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                        clientResponse -> clientResponse.bodyToMono(String.class)
                                .doOnNext(errorBody -> log.error("Jira create issue API error {}: {}",
                                        clientResponse.statusCode(), errorBody))
                                .flatMap(errorBody -> Mono.error(
                                        new RuntimeException("Jira create failed [" + clientResponse.statusCode() + "]: " + errorBody))))
                .bodyToMono(CreateJiraIssueResponse.class)
                .doOnSuccess(resp -> log.info("Created Jira issue: {}", resp != null ? resp.getKey() : "unknown"))
                .onErrorResume(err -> {
                    // If the error mentions assignee/accountId or is a 400, retry without assignee
                    String msg = err.getMessage() != null ? err.getMessage() : "";
                    if (request.getAssigneeAccountId() != null && !request.getAssigneeAccountId().isBlank()
                            && (msg.contains("assignee") || msg.contains("accountId") || msg.contains("400"))) {
                        log.warn("Jira rejected assignee '{}' — retrying without assignee. Error: {}",
                                request.getAssigneeAccountId(), msg);
                        return createIssueWithoutAssignee(request, issueTypeName);
                    }
                    return Mono.error(err);
                });
    }

    /**
     * Fallback: creates the Jira issue without the assignee field.
     * Used automatically when the stored jiraAccountId is invalid/stale
     * (e.g. after switching Jira accounts without updating the Employee table).
     */
    private Mono<CreateJiraIssueResponse> createIssueWithoutAssignee(CreateJiraIssueRequest request,
            String issueTypeName) {
        Map<String, Object> fields = new HashMap<>();
        fields.put("project", Map.of("key", jiraProperties.getProjectKey()));
        fields.put("summary", request.getSummary());
        fields.put("issuetype", Map.of("name", issueTypeName));

        if (request.getDescription() != null && !request.getDescription().isBlank()) {
            fields.put("description", buildAdfDescription(request.getDescription()));
        }
        if (request.getPriority() != null && !request.getPriority().isBlank()) {
            fields.put("priority", Map.of("name", request.getPriority()));
        }

        Map<String, Object> body = Map.of("fields", fields);

        return webClient.post()
                .uri("/rest/api/3/issue")
                .bodyValue(body)
                .retrieve()
                .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                        clientResponse -> clientResponse.bodyToMono(String.class)
                                .doOnNext(errorBody -> log.error("Jira create (no-assignee) error {}: {}",
                                        clientResponse.statusCode(), errorBody))
                                .flatMap(errorBody -> Mono.error(
                                        new RuntimeException("Jira create (no-assignee) failed [" + clientResponse.statusCode() + "]: " + errorBody))))
                .bodyToMono(CreateJiraIssueResponse.class)
                .doOnSuccess(resp -> log.info("Created Jira issue (unassigned fallback): {}",
                        resp != null ? resp.getKey() : "unknown"))
                .doOnError(err -> log.error("Jira create (no-assignee) error: {}", err.getMessage()));
    }

    /**
     * Builds a minimal Atlassian Document Format (ADF) description node for plain
     * text.
     */
    private Map<String, Object> buildAdfDescription(String text) {
        Map<String, Object> content = new HashMap<>();
        content.put("type", "doc");
        content.put("version", 1);

        Map<String, Object> paragraph = new HashMap<>();
        paragraph.put("type", "paragraph");

        Map<String, Object> textNode = new HashMap<>();
        textNode.put("type", "text");
        textNode.put("text", text);

        List<Map<String, Object>> paragraphContent = new ArrayList<>();
        paragraphContent.add(textNode);

        paragraph.put("content", paragraphContent);

        List<Map<String, Object>> docContent = new ArrayList<>();
        docContent.add(paragraph);

        content.put("content", docContent);
        return content;
    }
}
