package dev.amitwani.mcp_spring_java.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private String username;
    private String password;
    private String role; // MANAGER or EMPLOYEE
    private String firstName;
    private String lastName;
    private String email;
    private String position;
    private String jiraAccountId;
    private String githubUsername;
}
