package dev.amitwani.mcp_spring_java.service;

import dev.amitwani.mcp_spring_java.Entity.BackLogTask;
import dev.amitwani.mcp_spring_java.Entity.TaskPriority;
import dev.amitwani.mcp_spring_java.Entity.TaskStatus;
import dev.amitwani.mcp_spring_java.repository.BackLogTaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Service
@Slf4j
@RequiredArgsConstructor
public class BackLogTaskService {

    @Autowired
    private BackLogTaskRepository backLogTaskRepository;

    @Autowired
    @Lazy
    private JiraSyncService jiraSyncService;

    @Transactional
    public BackLogTask createTask(BackLogTask task) {
        log.info("Creating new backlog task: {}", task.getTitle());
        BackLogTask saved = backLogTaskRepository.save(task);
        // If the task has an assignee, push to Jira on a boundedElastic thread.
        // Mono.fromCallable ensures the ENTIRE pushIssueToJira() — including .block() —
        // runs off the reactor-http-epoll thread, which does not allow blocking.
        if (saved.getAssignee() != null) {
            log.info("Task has assignee — pushing to Jira on boundedElastic thread");
            Mono.fromCallable(() -> jiraSyncService.pushIssueToJira(saved))
                    .subscribeOn(Schedulers.boundedElastic())
                    .subscribe(
                            key -> log.info("Jira push complete, key: {}", key),
                            err -> log.error("Jira push failed: {}", err.getMessage(), err)
                    );
        }
        return saved;
    }

    public List<BackLogTask> getAllTasks() {
        log.info("Fetching all backlog tasks");
        return backLogTaskRepository.findAll();
    }

    public Optional<BackLogTask> getTaskById(Long id) {
        log.info("Fetching backlog task with id: {}", id);
        return backLogTaskRepository.findById(id);
    }

    public List<BackLogTask> getTasksByStatus(TaskStatus status) {
        log.info("Fetching tasks with status: {}", status);
        return backLogTaskRepository.findByStatus(status);
    }

    public List<BackLogTask> getTasksByPriority(TaskPriority priority) {
        log.info("Fetching tasks with priority: {}", priority);
        return backLogTaskRepository.findByPriority(priority);
    }

    public List<BackLogTask> getTasksByAssignee(Long assigneeId) {
        log.info("Fetching tasks assigned to employee id: {}", assigneeId);
        return backLogTaskRepository.findByAssigneeId(assigneeId);
    }

    public List<BackLogTask> getTasksBySource(String source) {
        log.info("Fetching tasks from source: {}", source);
        return backLogTaskRepository.findBySource(source);
    }

    public List<BackLogTask> getTasksByStatusAndPriority(TaskStatus status, TaskPriority priority) {
        log.info("Fetching tasks with status: {} and priority: {}", status, priority);
        return backLogTaskRepository.findByStatusAndPriority(status, priority);
    }

    public List<BackLogTask> getTasksByAssigneeAndStatus(Long assigneeId, TaskStatus status) {
        log.info("Fetching tasks for assignee id: {} with status: {}", assigneeId, status);
        return backLogTaskRepository.findByAssigneeIdAndStatus(assigneeId, status);
    }

    @Transactional
    public Optional<BackLogTask> updateTask(Long id, BackLogTask updatedTask) {
        log.info("Updating backlog task with id: {}", id);
        return backLogTaskRepository.findById(id)
                .map(existingTask -> {
                    if (updatedTask.getTitle() != null) {
                        existingTask.setTitle(updatedTask.getTitle());
                    }
                    if (updatedTask.getDescription() != null) {
                        existingTask.setDescription(updatedTask.getDescription());
                    }
                    if (updatedTask.getStatus() != null) {
                        existingTask.setStatus(updatedTask.getStatus());
                    }
                    if (updatedTask.getPriority() != null) {
                        existingTask.setPriority(updatedTask.getPriority());
                    }
                    if (updatedTask.getAssignee() != null) {
                        existingTask.setAssignee(updatedTask.getAssignee());
                    }
                    if (updatedTask.getStoryPoints() != null) {
                        existingTask.setStoryPoints(updatedTask.getStoryPoints());
                    }
                    if (updatedTask.getDueDate() != null) {
                        existingTask.setDueDate(updatedTask.getDueDate());
                    }
                    if (updatedTask.getSource() != null) {
                        existingTask.setSource(updatedTask.getSource());
                    }
                    return backLogTaskRepository.save(existingTask);
                });
    }

    @Transactional
    public boolean deleteTask(Long id) {
        log.info("Deleting backlog task with id: {}", id);
        if (backLogTaskRepository.existsById(id)) {
            backLogTaskRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
