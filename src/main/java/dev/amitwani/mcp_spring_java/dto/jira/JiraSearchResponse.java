package dev.amitwani.mcp_spring_java.dto.jira;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * Wrapper for the Atlassian POST /rest/api/3/search/jql response.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class JiraSearchResponse {

    @JsonProperty("issues")
    private List<JiraIssueDto> issues;

    @JsonProperty("isLast")
    private boolean isLast;

    @JsonProperty("total")
    private int total;

    public List<JiraIssueDto> getIssues() {
        return issues;
    }

    public void setIssues(List<JiraIssueDto> issues) {
        this.issues = issues;
    }

    public boolean isLast() {
        return isLast;
    }

    public void setLast(boolean last) {
        isLast = last;
    }

    public int getTotal() {
        return total;
    }

    public void setTotal(int total) {
        this.total = total;
    }
}
