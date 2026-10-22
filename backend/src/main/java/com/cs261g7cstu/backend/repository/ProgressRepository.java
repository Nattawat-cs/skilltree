package com.cs261g7cstu.backend.repository;

import com.cs261g7cstu.backend.dto.CourseProgressCount;
import com.cs261g7cstu.backend.entity.Progress;
import com.cs261g7cstu.backend.entity.ProgressId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ProgressRepository extends JpaRepository<Progress, ProgressId> {

    List<Progress> findByIdUserId(UUID userId);

    @Query("""
            select new com.cs261g7cstu.backend.dto.CourseProgressCount(
                c.id, c.code, c.name, count(ct.id), count(p.doneAt))
            from Course c
            left join CourseTopic ct on ct.courseId = c.id
            left join Progress p on p.id.topicId = ct.topic.id and p.id.userId = :userId
            group by c.id, c.code, c.name
            order by c.code
            """)
    List<CourseProgressCount> findCourseProgressCounts(@Param("userId") UUID userId);
}
