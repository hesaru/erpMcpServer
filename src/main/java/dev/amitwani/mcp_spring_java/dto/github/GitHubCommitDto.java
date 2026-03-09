package dev.amitwani.mcp_spring_java.dto.github;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO representing a single commit item from the GitHub Commit Search API.
 *
 * Response shape (simplified):
 * {
 * "sha": "abc123...",
 * "html_url": "https://github.com/...",
 * "commit": {
 * "message": "SCRUM-5:Development of trace log auto enable mechanism",
 * "author": { "name": "...", "email": "...", "date": "2025-06-01T10:30:00Z" }
 * },
 * "author": { "login": "sathirauop" },
 * "repository": { "full_name": "owner/repo" }
 * }
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class GitHubCommitDto {

    @JsonProperty("sha")
    private String sha;

    @JsonProperty("html_url")
    private String htmlUrl;

    @JsonProperty("commit")
    private CommitDetail commit;

    @JsonProperty("author")
    private GitHubUser author;

    @JsonProperty("repository")
    private Repository repository;

    // ------- Getters & Setters -------
    public String getSha() {
        return sha;
    }

    public void setSha(String sha) {
        this.sha = sha;
    }

    public String getHtmlUrl() {
        return htmlUrl;
    }

    public void setHtmlUrl(String htmlUrl) {
        this.htmlUrl = htmlUrl;
    }

    public CommitDetail getCommit() {
        return commit;
    }

    public void setCommit(CommitDetail commit) {
        this.commit = commit;
    }

    public GitHubUser getAuthor() {
        return author;
    }

    public void setAuthor(GitHubUser author) {
        this.author = author;
    }

    public Repository getRepository() {
        return repository;
    }

    public void setRepository(Repository repository) {
        this.repository = repository;
    }

    // ==================================================================
    // Nested classes
    // ==================================================================

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CommitDetail {

        @JsonProperty("message")
        private String message;

        @JsonProperty("author")
        private CommitAuthor author;

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public CommitAuthor getAuthor() {
            return author;
        }

        public void setAuthor(CommitAuthor author) {
            this.author = author;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CommitAuthor {

        @JsonProperty("name")
        private String name;

        @JsonProperty("email")
        private String email;

        @JsonProperty("date")
        private String date; // ISO-8601 string, parsed manually

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class GitHubUser {

        @JsonProperty("login")
        private String login;

        public String getLogin() {
            return login;
        }

        public void setLogin(String login) {
            this.login = login;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Repository {

        @JsonProperty("full_name")
        private String fullName;

        public String getFullName() {
            return fullName;
        }

        public void setFullName(String fullName) {
            this.fullName = fullName;
        }
    }
}
