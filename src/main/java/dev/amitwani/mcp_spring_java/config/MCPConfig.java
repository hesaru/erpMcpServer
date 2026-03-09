package dev.amitwani.mcp_spring_java.config;

import dev.amitwani.mcp_spring_java.service.GitHubMcpTools;
import dev.amitwani.mcp_spring_java.service.JiraMcpTools;
import dev.amitwani.mcp_spring_java.service.UserService;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class MCPConfig {

    private final UserService userService;
    private final JiraMcpTools jiraMcpTools;
    private final GitHubMcpTools gitHubMcpTools;

    @Autowired
    public MCPConfig(UserService userService, JiraMcpTools jiraMcpTools, GitHubMcpTools gitHubMcpTools) {
        this.userService = userService;
        this.jiraMcpTools = jiraMcpTools;
        this.gitHubMcpTools = gitHubMcpTools;
    }

    @Bean
    ToolCallbackProvider userTools() {
        return MethodToolCallbackProvider
                .builder()
                .toolObjects(userService, jiraMcpTools, gitHubMcpTools)
                .build();
    }

}
