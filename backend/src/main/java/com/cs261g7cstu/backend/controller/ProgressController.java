package com.cs261g7cstu.backend.controller;

import com.cs261g7cstu.backend.dto.CourseProgressDTO;
import com.cs261g7cstu.backend.dto.ProgressDTO;
import com.cs261g7cstu.backend.service.ProgressService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/progress")
public class ProgressController {

    private final ProgressService progressService;

    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    @GetMapping
    public ResponseEntity<List<ProgressDTO>> getProgress(HttpSession session) {
        UUID userId = (UUID) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(progressService.getProgress(userId));
    }

    @GetMapping("/courses")
    public ResponseEntity<List<CourseProgressDTO>> getCourseProgress(HttpSession session) {
        UUID userId = (UUID) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(progressService.getCourseProgress(userId));
    }

    @PutMapping("/topics/{topicId}")
    public ResponseEntity<ProgressDTO> markDone(@PathVariable UUID topicId, HttpSession session) {
        UUID userId = (UUID) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(progressService.markDone(userId, topicId));
    }

    @DeleteMapping("/topics/{topicId}")
    public ResponseEntity<Void> unmarkDone(@PathVariable UUID topicId, HttpSession session) {
        UUID userId = (UUID) session.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        progressService.unmarkDone(userId, topicId);
        return ResponseEntity.noContent().build();
    }
}
