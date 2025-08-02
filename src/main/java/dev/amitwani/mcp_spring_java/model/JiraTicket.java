package dev.amitwani.mcp_spring_java.model;

import java.time.LocalDateTime;
import java.util.List;

public class JiraTicket {
    private String ticketId;
    private String summary;
    private LocalDateTime assignedDate;
    private double originalEffort; // in hours
    private double consumedEffort;

    private List<JiraHistory> history;  // status changes, etc.
    private List<JiraComment> comments; // user comments

    // All-args constructor
    public JiraTicket(String ticketId, String summary, LocalDateTime assignedDate,
                      double originalEffort, double consumedEffort,
                      List<JiraHistory> history, List<JiraComment> comments) {
        this.ticketId = ticketId;
        this.summary = summary;
        this.assignedDate = assignedDate;
        this.originalEffort = originalEffort;
        this.consumedEffort = consumedEffort;
        this.history = history;
        this.comments = comments;
    }

    // Getters and Setters
    public String getTicketId() {
        return ticketId;
    }

    public void setTicketId(String ticketId) {
        this.ticketId = ticketId;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public LocalDateTime getAssignedDate() {
        return assignedDate;
    }

    public void setAssignedDate(LocalDateTime assignedDate) {
        this.assignedDate = assignedDate;
    }

    public double getOriginalEffort() {
        return originalEffort;
    }

    public void setOriginalEffort(double originalEffort) {
        this.originalEffort = originalEffort;
    }

    public double getConsumedEffort() {
        return consumedEffort;
    }

    public void setConsumedEffort(double consumedEffort) {
        this.consumedEffort = consumedEffort;
    }

    public List<JiraHistory> getHistory() {
        return history;
    }

    public void setHistory(List<JiraHistory> history) {
        this.history = history;
    }

    public List<JiraComment> getComments() {
        return comments;
    }

    public void setComments(List<JiraComment> comments) {
        this.comments = comments;
    }
}
