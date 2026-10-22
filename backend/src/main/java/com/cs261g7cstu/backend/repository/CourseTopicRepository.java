package com.cs261g7cstu.backend.repository;

import com.cs261g7cstu.backend.entity.CourseTopic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CourseTopicRepository extends JpaRepository<CourseTopic, UUID> {

    List<CourseTopic> findByCourseIdOrderBySeqNoAsc(UUID courseId);
}
