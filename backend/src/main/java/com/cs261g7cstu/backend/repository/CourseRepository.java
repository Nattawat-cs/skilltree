package com.cs261g7cstu.backend.repository;

import com.cs261g7cstu.backend.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CourseRepository extends JpaRepository<Course, UUID> {
}
