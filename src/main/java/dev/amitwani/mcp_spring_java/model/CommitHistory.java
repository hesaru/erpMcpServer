package dev.amitwani.mcp_spring_java.model;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@AllArgsConstructor
@Data
public class CommitHistory {

    private User user;
    private String gitMessage;
    private String developmentReference;
    private LocalDateTime commitTime;
    private JiraTicket jiraTicket;

    public CommitHistory( User user, String gitMessage, String developmentReference, LocalDateTime commitTime )
    {
        this.user = user;
        this.gitMessage = gitMessage;
        this.developmentReference = developmentReference;
        this.commitTime = commitTime;
    }

    public JiraTicket getJiraTicket() {
        return jiraTicket;
    }

    public void setJiraTicket(JiraTicket jiraTicket) {
        this.jiraTicket = jiraTicket;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getGitMessage() {
        return gitMessage;
    }

    public void setGitMessage(String gitMessage) {
        this.gitMessage = gitMessage;
    }

    public String getDevelopmentReference() {
        return developmentReference;
    }

    public void setDevelopmentReference(String developmentReference) {
        this.developmentReference = developmentReference;
    }

    public LocalDateTime getCommitTime() {
        return commitTime;
    }

    public void setCommitTime(LocalDateTime commitTime) {
        this.commitTime = commitTime;
    }
}
