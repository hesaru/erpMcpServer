package dev.amitwani.mcp_spring_java.model;

import java.time.LocalDateTime;

public class JiraComment {
    private User commenter;
    private String message;
    private LocalDateTime timestamp;

    // All-args constructor
    public JiraComment(User commenter, String message, LocalDateTime timestamp) {
        this.commenter = commenter;
        this.message = message;
        this.timestamp = timestamp;
    }

    // Getters and Setters
    public User getCommenter() {
        return commenter;
    }

    public void setCommenter(User commenter) {
        this.commenter = commenter;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
