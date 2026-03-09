package dev.amitwani.mcp_spring_java.dto.jira;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO representing a single Jira issue from the Atlassian API response.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class JiraIssueDto {

    @JsonProperty("id")
    private String id;

    @JsonProperty("key")
    private String key;

    @JsonProperty("self")
    private String self;

    @JsonProperty("fields")
    private Fields fields;

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getSelf() {
        return self;
    }

    public void setSelf(String self) {
        this.self = self;
    }

    public Fields getFields() {
        return fields;
    }

    public void setFields(Fields fields) {
        this.fields = fields;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Fields {

        @JsonProperty("summary")
        private String summary;

        @JsonProperty("status")
        private Status status;

        @JsonProperty("assignee")
        private Assignee assignee;

        @JsonProperty("issuetype")
        private IssueType issueType;

        public String getSummary() {
            return summary;
        }

        public void setSummary(String summary) {
            this.summary = summary;
        }

        public Status getStatus() {
            return status;
        }

        public void setStatus(Status status) {
            this.status = status;
        }

        public Assignee getAssignee() {
            return assignee;
        }

        public void setAssignee(Assignee assignee) {
            this.assignee = assignee;
        }

        public IssueType getIssueType() {
            return issueType;
        }

        public void setIssueType(IssueType issueType) {
            this.issueType = issueType;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Status {

        @JsonProperty("name")
        private String name;

        @JsonProperty("statusCategory")
        private StatusCategory statusCategory;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public StatusCategory getStatusCategory() {
            return statusCategory;
        }

        public void setStatusCategory(StatusCategory statusCategory) {
            this.statusCategory = statusCategory;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class StatusCategory {

        @JsonProperty("name")
        private String name;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Assignee {

        @JsonProperty("accountId")
        private String accountId;

        @JsonProperty("displayName")
        private String displayName;

        public String getAccountId() {
            return accountId;
        }

        public void setAccountId(String accountId) {
            this.accountId = accountId;
        }

        public String getDisplayName() {
            return displayName;
        }

        public void setDisplayName(String displayName) {
            this.displayName = displayName;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class IssueType {

        @JsonProperty("name")
        private String name;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }
}
