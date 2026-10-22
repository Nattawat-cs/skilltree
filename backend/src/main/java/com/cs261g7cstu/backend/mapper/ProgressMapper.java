package com.cs261g7cstu.backend.mapper;

import com.cs261g7cstu.backend.dto.CourseProgressCount;
import com.cs261g7cstu.backend.dto.CourseProgressDTO;
import com.cs261g7cstu.backend.dto.ProgressDTO;
import com.cs261g7cstu.backend.entity.Progress;
import org.springframework.stereotype.Component;

@Component
public class ProgressMapper {

    public ProgressDTO toDTO(Progress progress) {
        return new ProgressDTO(progress.getId().getTopicId(), progress.getDoneAt());
    }

    public CourseProgressDTO toCourseProgressDTO(CourseProgressCount count) {
        int percent = count.totalTopics() == 0
                ? 0
                : (int) (count.doneTopics() * 100 / count.totalTopics());
        return new CourseProgressDTO(
                count.courseId(),
                count.code(),
                count.name(),
                count.totalTopics(),
                count.doneTopics(),
                percent
        );
    }
}
