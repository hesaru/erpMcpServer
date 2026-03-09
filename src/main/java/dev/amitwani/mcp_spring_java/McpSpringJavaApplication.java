package dev.amitwani.mcp_spring_java;

import dev.amitwani.mcp_spring_java.config.GitHubProperties;
import dev.amitwani.mcp_spring_java.config.JiraProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableConfigurationProperties({ JiraProperties.class, GitHubProperties.class })
public class McpSpringJavaApplication {

	public static void main(String[] args) {
		SpringApplication.run(McpSpringJavaApplication.class, args);
	}

}
