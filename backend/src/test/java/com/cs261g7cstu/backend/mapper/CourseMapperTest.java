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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class CourseMapperTest {

    private CourseMapper courseMapper;

    @BeforeEach
    void setUp() {
        courseMapper = new CourseMapper();
    }

    @Test
    void toCourseItemDTO_shouldMapAllFields() {
        UUID courseId = UUID.randomUUID();
        Course course = new Course();
        course.setId(courseId);
        course.setCode("CS101");
        course.setName("Introduction to Programming");
        course.setDesc("Basic programming concepts");

        CourseItemDTO result = courseMapper.toCourseItemDTO(course);

        assertNotNull(result);
        assertEquals(courseId, result.id());
        assertEquals("CS101", result.code());
        assertEquals("Introduction to Programming", result.name());
        assertEquals("Basic programming concepts", result.desc());
    }

    @Test
    void toPrerequisiteDTO_shouldMapAllFields() {
        UUID courseId = UUID.randomUUID();
        UUID prereqId = UUID.randomUUID();
        Prerequisite prerequisite = new Prerequisite();
        prerequisite.setId(UUID.randomUUID());
        prerequisite.setCourseId(courseId);
        prerequisite.setPrerequisiteId(prereqId);
        prerequisite.setTimestamp(LocalDateTime.now());

        PrerequisiteDTO result = courseMapper.toPrerequisiteDTO(prerequisite);

        assertNotNull(result);
        assertEquals(courseId, result.courseId());
        assertEquals(prereqId, result.prerequisiteId());
    }

    @Test
    void toSkillTreeDTO_shouldMapCoursesAndPrerequisites() {
        UUID course1Id = UUID.randomUUID();
        UUID course2Id = UUID.randomUUID();

        Course course1 = new Course();
        course1.setId(course1Id);
        course1.setCode("CS101");
        course1.setName("Intro to CS");
        course1.setDesc("Course 1");

        Course course2 = new Course();
        course2.setId(course2Id);
        course2.setCode("CS102");
        course2.setName("Object-Oriented Programming");
        course2.setDesc("Course 2");

        Prerequisite prereq = new Prerequisite();
        prereq.setId(UUID.randomUUID());
        prereq.setCourseId(course2Id);
        prereq.setPrerequisiteId(course1Id);
        prereq.setTimestamp(LocalDateTime.now());

        SkillTreeDTO result = courseMapper.toSkillTreeDTO(List.of(course1, course2), List.of(prereq));

        assertNotNull(result);
        assertEquals(2, result.courses().size());
        assertEquals("CS101", result.courses().get(0).code());
        assertEquals("CS102", result.courses().get(1).code());
        assertEquals(1, result.prerequisites().size());
        assertEquals(course2Id, result.prerequisites().get(0).courseId());
        assertEquals(course1Id, result.prerequisites().get(0).prerequisiteId());
    }

    @Test
    void toTopicItemDTO_shouldMapTopicAndSeqNo() {
        UUID topicId = UUID.randomUUID();
        Topic topic = new Topic();
        topic.setId(topicId);
        topic.setName("Variables and Data Types");
        topic.setDesc("Primitive types in Java");

        CourseTopic courseTopic = new CourseTopic();
        courseTopic.setId(UUID.randomUUID());
        courseTopic.setCourseId(UUID.randomUUID());
        courseTopic.setTopic(topic);
        courseTopic.setSeqNo(1);

        TopicItemDTO result = courseMapper.toTopicItemDTO(courseTopic);

        assertNotNull(result);
        assertEquals(topicId, result.id());
        assertEquals("Variables and Data Types", result.name());
        assertEquals("Primitive types in Java", result.desc());
        assertEquals(1, result.seqNo());
    }

    @Test
    void toDetailDTO_shouldMapCourseAndOrderedTopics() {
        UUID courseId = UUID.randomUUID();
        Course course = new Course();
        course.setId(courseId);
        course.setCode("CS261");
        course.setName("Software Engineering");
        course.setDesc("SE fundamentals");

        Topic topic1 = new Topic();
        topic1.setId(UUID.randomUUID());
        topic1.setName("Requirements");
        topic1.setDesc("User stories");

        Topic topic2 = new Topic();
        topic2.setId(UUID.randomUUID());
        topic2.setName("Architecture");
        topic2.setDesc("Class and sequence diagrams");

        CourseTopic ct1 = new CourseTopic();
        ct1.setId(UUID.randomUUID());
        ct1.setCourseId(courseId);
        ct1.setTopic(topic1);
        ct1.setSeqNo(1);

        CourseTopic ct2 = new CourseTopic();
        ct2.setId(UUID.randomUUID());
        ct2.setCourseId(courseId);
        ct2.setTopic(topic2);
        ct2.setSeqNo(2);

        CourseDetailDTO result = courseMapper.toDetailDTO(course, List.of(ct1, ct2));

        assertNotNull(result);
        assertEquals(courseId, result.id());
        assertEquals("CS261", result.code());
        assertEquals("Software Engineering", result.name());
        assertEquals("SE fundamentals", result.desc());
        assertEquals(2, result.topics().size());
        assertEquals("Requirements", result.topics().get(0).name());
        assertEquals(1, result.topics().get(0).seqNo());
        assertEquals("Architecture", result.topics().get(1).name());
        assertEquals(2, result.topics().get(1).seqNo());
    }
}

