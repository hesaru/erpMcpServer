package dev.amitwani.mcp_spring_java.repository;

import dev.amitwani.mcp_spring_java.Entity.BackLogTask;
import dev.amitwani.mcp_spring_java.Entity.TaskPriority;
import dev.amitwani.mcp_spring_java.Entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BackLogTaskRepository extends JpaRepository<BackLogTask, Long> {

    List<BackLogTask> findByStatus(TaskStatus status);

    List<BackLogTask> findByPriority(TaskPriority priority);

    List<BackLogTask> findByAssigneeId(Long assigneeId);

    List<BackLogTask> findBySource(String source);

    List<BackLogTask> findByStatusAndPriority(TaskStatus status, TaskPriority priority);

    List<BackLogTask> findByAssigneeIdAndStatus(Long assigneeId, TaskStatus status);
}
