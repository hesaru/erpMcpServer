package dev.amitwani.mcp_spring_java.model;

import java.time.LocalDateTime;

public class JiraHistory {
    private String fieldChanged; // e.g., status, effort
    private String oldValue;
    private String newValue;
    private LocalDateTime changedAt;

    // All-args constructor
    public JiraHistory(String fieldChanged, String oldValue, String newValue, LocalDateTime changedAt) {
        this.fieldChanged = fieldChanged;
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.changedAt = changedAt;
    }

    // Getters and Setters
    public String getFieldChanged() {
        return fieldChanged;
    }

    public void setFieldChanged(String fieldChanged) {
        this.fieldChanged = fieldChanged;
    }

    public String getOldValue() {
        return oldValue;
    }

    public void setOldValue(String oldValue) {
        this.oldValue = oldValue;
    }

    public String getNewValue() {
        return newValue;
    }

    public void setNewValue(String newValue) {
        this.newValue = newValue;
    }

    public LocalDateTime getChangedAt() {
        return changedAt;
    }

    public void setChangedAt(LocalDateTime changedAt) {
        this.changedAt = changedAt;
    }
}
