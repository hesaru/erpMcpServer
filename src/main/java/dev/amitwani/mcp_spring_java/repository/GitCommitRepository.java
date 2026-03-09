package dev.amitwani.mcp_spring_java.repository;

import dev.amitwani.mcp_spring_java.Entity.GitCommit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GitCommitRepository extends JpaRepository<GitCommit, Long> {

    Optional<GitCommit> findBySha(String sha);

    List<GitCommit> findByJiraKey(String jiraKey);

    List<GitCommit> findByAuthorGithubUsername(String authorGithubUsername);

    List<GitCommit> findByRepositoryName(String repositoryName);

    List<GitCommit> findByJiraKeyIsNotNull();

    List<GitCommit> findByJiraKeyIsNull();

    boolean existsBySha(String sha);
}
