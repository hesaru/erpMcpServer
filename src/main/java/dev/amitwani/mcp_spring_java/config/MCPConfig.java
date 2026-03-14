package dev.amitwani.mcp_spring_java.config;

import dev.amitwani.mcp_spring_java.service.GitHubMcpTools;
import dev.amitwani.mcp_spring_java.service.JiraMcpTools;
import dev.amitwani.mcp_spring_java.service.WellBeingMcpTools;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class MCPConfig {

    private final JiraMcpTools jiraMcpTools;
    private final GitHubMcpTools gitHubMcpTools;
    private final WellBeingMcpTools wellBeingMcpTools;

    @Autowired
    public MCPConfig(JiraMcpTools jiraMcpTools, GitHubMcpTools gitHubMcpTools, WellBeingMcpTools wellBeingMcpTools) {
        this.jiraMcpTools = jiraMcpTools;
        this.gitHubMcpTools = gitHubMcpTools;
        this.wellBeingMcpTools = wellBeingMcpTools;
    }

    @Bean
    ToolCallbackProvider userTools() {
        return MethodToolCallbackProvider
                .builder()
                .toolObjects(jiraMcpTools, gitHubMcpTools, wellBeingMcpTools)
                .build();
    }

}
