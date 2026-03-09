package dev.amitwani.mcp_spring_java.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "jira")
public class JiraProperties {

    private String baseUrl;
    private String authToken;
    private String projectKey;
    private String reporterAccountId;
    private String defaultIssueType;
    private String jql;
    private int maxResults = 50;

    // Getters and Setters
    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public String getAuthToken() {
        return authToken;
    }

    public void setAuthToken(String authToken) {
        this.authToken = authToken;
    }

    public String getProjectKey() {
        return projectKey;
    }

    public void setProjectKey(String projectKey) {
        this.projectKey = projectKey;
    }

    public String getReporterAccountId() {
        return reporterAccountId;
    }

    public void setReporterAccountId(String reporterAccountId) {
        this.reporterAccountId = reporterAccountId;
    }

    public String getDefaultIssueType() {
        return defaultIssueType;
    }

    public void setDefaultIssueType(String defaultIssueType) {
        this.defaultIssueType = defaultIssueType;
    }

    public String getJql() {
        return jql;
    }

    public void setJql(String jql) {
        this.jql = jql;
    }

    public int getMaxResults() {
        return maxResults;
    }

    public void setMaxResults(int maxResults) {
        this.maxResults = maxResults;
    }
}
