package dev.amitwani.mcp_spring_java.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuration properties for the GitHub REST API integration.
 * Mapped from the "github" prefix in application.properties.
 */
@Component
@ConfigurationProperties(prefix = "github")
public class GitHubProperties {

    /** GitHub Personal Access Token (PAT) for authentication. */
    private String token;

    /** GitHub API base URL. Default: https://api.github.com */
    private String apiUrl = "https://api.github.com";

    // Getters and Setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getApiUrl() {
        return apiUrl;
    }

    public void setApiUrl(String apiUrl) {
        this.apiUrl = apiUrl;
    }
}
