package com.cs261g7cstu.backend.mapper;

import com.cs261g7cstu.backend.dto.CourseDetailDTO;
import com.cs261g7cstu.backend.dto.CourseItemDTO;
import com.cs261g7cstu.backend.dto.PrerequisiteDTO;
import com.cs261g7cstu.backend.dto.SkillTreeDTO;
import com.cs261g7cstu.backend.dto.TopicItemDTO;
import com.cs261g7cstu.backend.entity.Course;
import com.cs261g7cstu.backend.entity.CourseTopic;
import com.cs261g7cstu.backend.entity.Prerequisite;
import com.cs261g7cstu.backend.entity.Topic;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CourseMapper {

    public SkillTreeDTO toSkillTreeDTO(List<Course> courses, List<Prerequisite> prerequisites) {
        return new SkillTreeDTO(
                courses.stream().map(this::toCourseItemDTO).toList(),
                prerequisites.stream().map(this::toPrerequisiteDTO).toList()
        );
    }

    public CourseItemDTO toCourseItemDTO(Course course) {
        return new CourseItemDTO(course.getId(), course.getCode(), course.getName(), course.getDesc());
    }

    public PrerequisiteDTO toPrerequisiteDTO(Prerequisite prerequisite) {
        return new PrerequisiteDTO(prerequisite.getCourseId(), prerequisite.getPrerequisiteId());
    }

    public CourseDetailDTO toDetailDTO(Course course, List<CourseTopic> courseTopics) {
        return new CourseDetailDTO(
                course.getId(),
                course.getCode(),
                course.getName(),
                course.getDesc(),
                courseTopics.stream().map(this::toTopicItemDTO).toList()
        );
    }

    public TopicItemDTO toTopicItemDTO(CourseTopic courseTopic) {
        Topic topic = courseTopic.getTopic();
        return new TopicItemDTO(topic.getId(), topic.getName(), topic.getDesc(), courseTopic.getSeqNo());
    }
}
