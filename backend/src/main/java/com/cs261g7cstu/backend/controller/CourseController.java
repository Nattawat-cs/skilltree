package com.cs261g7cstu.backend.controller;

import com.cs261g7cstu.backend.dto.CourseDetailDTO;
import com.cs261g7cstu.backend.dto.SkillTreeDTO;
import com.cs261g7cstu.backend.service.CourseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping("/skill-tree")
    public ResponseEntity<SkillTreeDTO> getSkillTree() {
        return ResponseEntity.ok(courseService.getSkillTree());
    }

    @GetMapping("/courses/{courseId}")
    public ResponseEntity<CourseDetailDTO> getCourseDetail(@PathVariable UUID courseId) {
        return ResponseEntity.ok(courseService.getCourseDetail(courseId));
    }
}
