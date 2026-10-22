package com.cs261g7cstu.backend.service;

import com.cs261g7cstu.backend.dto.CourseDetailDTO;
import com.cs261g7cstu.backend.dto.CourseItemDTO;
import com.cs261g7cstu.backend.dto.PrerequisiteDTO;
import com.cs261g7cstu.backend.dto.SkillTreeDTO;
import com.cs261g7cstu.backend.dto.TopicItemDTO;
import com.cs261g7cstu.backend.entity.Course;
import com.cs261g7cstu.backend.entity.CourseTopic;
import com.cs261g7cstu.backend.entity.Prerequisite;
import com.cs261g7cstu.backend.mapper.CourseMapper;
import com.cs261g7cstu.backend.repository.CourseRepository;
import com.cs261g7cstu.backend.repository.CourseTopicRepository;
import com.cs261g7cstu.backend.repository.PrerequisiteRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CourseServiceTest {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private CourseTopicRepository courseTopicRepository;

    @Mock
    private PrerequisiteRepository prerequisiteRepository;

    @Mock
    private CourseMapper courseMapper;

    @InjectMocks
    private CourseService courseService;

    @Test
    void getSkillTree_shouldFetchCoursesAndPrerequisitesAndReturnSkillTreeDTO() {
        Course course = new Course();
        course.setId(UUID.randomUUID());
        Prerequisite prerequisite = new Prerequisite();
        prerequisite.setId(UUID.randomUUID());

        List<Course> courses = List.of(course);
        List<Prerequisite> prerequisites = List.of(prerequisite);

        SkillTreeDTO expectedDto = new SkillTreeDTO(
                List.of(new CourseItemDTO(course.getId(), "CS101", "Intro", "Desc")),
                List.of(new PrerequisiteDTO(UUID.randomUUID(), course.getId()))
        );

        when(courseRepository.findAll()).thenReturn(courses);
        when(prerequisiteRepository.findAll()).thenReturn(prerequisites);
        when(courseMapper.toSkillTreeDTO(courses, prerequisites)).thenReturn(expectedDto);

        SkillTreeDTO result = courseService.getSkillTree();

        assertNotNull(result);
        assertEquals(expectedDto, result);
        verify(courseRepository).findAll();
        verify(prerequisiteRepository).findAll();
        verify(courseMapper).toSkillTreeDTO(courses, prerequisites);
    }

    @Test
    void getCourseDetail_whenCourseNotFound_shouldThrowNotFoundException() {
        UUID courseId = UUID.randomUUID();
        when(courseRepository.findById(courseId)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> courseService.getCourseDetail(courseId)
        );

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        verifyNoInteractions(courseTopicRepository);
    }

    @Test
    void getCourseDetail_whenCourseExists_shouldReturnCourseDetailDTO() {
        UUID courseId = UUID.randomUUID();
        Course course = new Course();
        course.setId(courseId);
        course.setCode("CS261");
        course.setName("Software Engineering");
        course.setDesc("SE course");

        CourseTopic ct = new CourseTopic();
        ct.setId(UUID.randomUUID());
        ct.setCourseId(courseId);
        ct.setSeqNo(1);
        List<CourseTopic> courseTopics = List.of(ct);

        CourseDetailDTO expectedDto = new CourseDetailDTO(
                courseId,
                "CS261",
                "Software Engineering",
                "SE course",
                List.of(new TopicItemDTO(UUID.randomUUID(), "Topic 1", "Desc", 1))
        );

        when(courseRepository.findById(courseId)).thenReturn(Optional.of(course));
        when(courseTopicRepository.findByCourseIdOrderBySeqNoAsc(courseId)).thenReturn(courseTopics);
        when(courseMapper.toDetailDTO(course, courseTopics)).thenReturn(expectedDto);

        CourseDetailDTO result = courseService.getCourseDetail(courseId);

        assertNotNull(result);
        assertEquals(expectedDto, result);
        verify(courseRepository).findById(courseId);
        verify(courseTopicRepository).findByCourseIdOrderBySeqNoAsc(courseId);
        verify(courseMapper).toDetailDTO(course, courseTopics);
    }
}

