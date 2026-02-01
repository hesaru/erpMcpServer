package dev.amitwani.mcp_spring_java.controller;

import dev.amitwani.mcp_spring_java.Entity.BackLogTask;
import dev.amitwani.mcp_spring_java.Entity.TaskPriority;
import dev.amitwani.mcp_spring_java.Entity.TaskStatus;
import dev.amitwani.mcp_spring_java.service.BackLogTaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/backlog-tasks")
@Slf4j
@RequiredArgsConstructor
public class BackLogTaskController {

    private final BackLogTaskService backLogTaskService;

    @PostMapping
    public ResponseEntity<BackLogTask> createTask(@Valid @RequestBody BackLogTask task) {
        log.info("REST request to create backlog task: {}", task.getTitle());
        BackLogTask createdTask = backLogTaskService.createTask(task);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTask);
    }

    @GetMapping
    public ResponseEntity<List<BackLogTask>> getAllTasks(
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) TaskPriority priority,
            @RequestParam(required = false) Long assigneeId,
            @RequestParam(required = false) String source) {

        log.info(
                "REST request to get all backlog tasks with filters - status: {}, priority: {}, assigneeId: {}, source: {}",
                status, priority, assigneeId, source);

        List<BackLogTask> tasks;

        if (status != null && priority != null) {
            tasks = backLogTaskService.getTasksByStatusAndPriority(status, priority);
        } else if (assigneeId != null && status != null) {
            tasks = backLogTaskService.getTasksByAssigneeAndStatus(assigneeId, status);
        } else if (status != null) {
            tasks = backLogTaskService.getTasksByStatus(status);
        } else if (priority != null) {
            tasks = backLogTaskService.getTasksByPriority(priority);
        } else if (assigneeId != null) {
            tasks = backLogTaskService.getTasksByAssignee(assigneeId);
        } else if (source != null) {
            tasks = backLogTaskService.getTasksBySource(source);
        } else {
            tasks = backLogTaskService.getAllTasks();
        }

        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BackLogTask> getTaskById(@PathVariable Long id) {
        log.info("REST request to get backlog task with id: {}", id);
        return backLogTaskService.getTaskById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<BackLogTask> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody BackLogTask task) {
        log.info("REST request to update backlog task with id: {}", id);
        return backLogTaskService.updateTask(id, task)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        log.info("REST request to delete backlog task with id: {}", id);
        boolean deleted = backLogTaskService.deleteTask(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
