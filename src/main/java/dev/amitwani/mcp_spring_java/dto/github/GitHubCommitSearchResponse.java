package dev.amitwani.mcp_spring_java.dto.github;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * DTO mapping the top-level response from the GitHub Commit Search API.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class GitHubCommitSearchResponse {

    @JsonProperty("total_count")
    private int totalCount;

    @JsonProperty("incomplete_results")
    private boolean incompleteResults;

    @JsonProperty("items")
    private List<GitHubCommitDto> items;

    // Getters and Setters
    public int getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(int totalCount) {
        this.totalCount = totalCount;
    }

    public boolean isIncompleteResults() {
        return incompleteResults;
    }

    public void setIncompleteResults(boolean incompleteResults) {
        this.incompleteResults = incompleteResults;
    }

    public List<GitHubCommitDto> getItems() {
        return items;
    }

    public void setItems(List<GitHubCommitDto> items) {
        this.items = items;
    }
}
