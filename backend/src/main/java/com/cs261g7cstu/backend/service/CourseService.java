package com.cs261g7cstu.backend.service;

import com.cs261g7cstu.backend.dto.CourseDetailDTO;
import com.cs261g7cstu.backend.dto.SkillTreeDTO;
import com.cs261g7cstu.backend.entity.Course;
import com.cs261g7cstu.backend.entity.CourseTopic;
import com.cs261g7cstu.backend.entity.Prerequisite;
import com.cs261g7cstu.backend.mapper.CourseMapper;
import com.cs261g7cstu.backend.repository.CourseRepository;
import com.cs261g7cstu.backend.repository.CourseTopicRepository;
import com.cs261g7cstu.backend.repository.PrerequisiteRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final CourseTopicRepository courseTopicRepository;
    private final PrerequisiteRepository prerequisiteRepository;
    private final CourseMapper courseMapper;

    public CourseService(CourseRepository courseRepository,
                         CourseTopicRepository courseTopicRepository,
                         PrerequisiteRepository prerequisiteRepository,
                         CourseMapper courseMapper) {
        this.courseRepository = courseRepository;
        this.courseTopicRepository = courseTopicRepository;
        this.prerequisiteRepository = prerequisiteRepository;
        this.courseMapper = courseMapper;
    }

    @Cacheable("skillTree")
    public SkillTreeDTO getSkillTree() {
        List<Course> courses = courseRepository.findAll();
        List<Prerequisite> prerequisites = prerequisiteRepository.findAll();
        return courseMapper.toSkillTreeDTO(courses, prerequisites);
    }

    @Cacheable(value = "courseDetails", key = "#courseId")
    public CourseDetailDTO getCourseDetail(UUID courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        List<CourseTopic> courseTopics = courseTopicRepository.findByCourseIdOrderBySeqNoAsc(courseId);
        return courseMapper.toDetailDTO(course, courseTopics);
    }
}
