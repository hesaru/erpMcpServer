package dev.amitwani.mcp_spring_java.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String username;
    private String role;
    private boolean mustChangePassword;
    private Long employeeId;
    private String fullName;
}
