package dev.amitwani.mcp_spring_java.service;

import dev.amitwani.mcp_spring_java.config.GitHubProperties;
import dev.amitwani.mcp_spring_java.dto.github.GitHubCommitSearchResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

/**
 * Reactive WebClient-based client for the GitHub REST API.
 * Uses the Commit Search endpoint to fetch commits by author.
 */
@Service
@Slf4j
public class GitHubApiClient {

        private final WebClient webClient;

        @Autowired
        public GitHubApiClient(GitHubProperties gitHubProperties, WebClient.Builder webClientBuilder) {
                // GitHub search responses can be large; increase the buffer from 256KB to 10MB
                ExchangeStrategies strategies = ExchangeStrategies.builder()
                                .codecs(cfg -> cfg.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
                                .build();

                // IMPORTANT: clone() the shared builder to avoid mutating it for other beans
                // (MCP server, JiraApiClient, etc.)
                this.webClient = webClientBuilder.clone()
                                .baseUrl(gitHubProperties.getApiUrl())
                                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + gitHubProperties.getToken())
                                .defaultHeader(HttpHeaders.ACCEPT, "application/vnd.github.cloak-preview+json")
                                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                                .exchangeStrategies(strategies)
                                .build();
        }

        /**
         * Search for commits by a given GitHub author username.
         *
         * @param authorUsername GitHub username (e.g. "sathirauop")
         * @param page           1-based page number
         * @param perPage        results per page (max 100)
         * @return Mono of the search response
         */
        public Mono<GitHubCommitSearchResponse> searchCommitsByAuthor(String authorUsername, int page, int perPage) {
                String query = "author:" + authorUsername;
                log.debug("Calling GitHub Commit Search API for author: {}, page: {}, perPage: {}", authorUsername,
                                page,
                                perPage);

                return webClient.get()
                                .uri(uriBuilder -> uriBuilder
                                                .path("/search/commits")
                                                .queryParam("q", query)
                                                .queryParam("sort", "author-date")
                                                .queryParam("order", "desc")
                                                .queryParam("page", page)
                                                .queryParam("per_page", perPage)
                                                .build())
                                .retrieve()
                                .bodyToMono(GitHubCommitSearchResponse.class)
                                .doOnSuccess(resp -> log.debug("GitHub search returned {} items (total_count={})",
                                                resp != null && resp.getItems() != null ? resp.getItems().size() : 0,
                                                resp != null ? resp.getTotalCount() : 0))
                                .doOnError(err -> log.error("GitHub Commit Search API error: {}", err.getMessage()));
        }
}
