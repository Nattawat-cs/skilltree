package com.cs261g7cstu.backend.controller;

import com.cs261g7cstu.backend.dto.CourseDetailDTO;
import com.cs261g7cstu.backend.dto.CourseItemDTO;
import com.cs261g7cstu.backend.dto.PrerequisiteDTO;
import com.cs261g7cstu.backend.dto.SkillTreeDTO;
import com.cs261g7cstu.backend.dto.TopicItemDTO;
import com.cs261g7cstu.backend.service.CourseService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CourseController.class)
class CourseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CourseService courseService;

    @Test
    void getSkillTree_shouldReturn200AndSkillTreeDTO() throws Exception {
        UUID course1Id = UUID.randomUUID();
        UUID course2Id = UUID.randomUUID();

        SkillTreeDTO skillTreeDTO = new SkillTreeDTO(
                List.of(
                        new CourseItemDTO(course1Id, "CS101", "Intro to CS", "Basic CS"),
                        new CourseItemDTO(course2Id, "CS102", "OOP", "Java OOP")
                ),
                List.of(new PrerequisiteDTO(course2Id, course1Id))
        );

        when(courseService.getSkillTree()).thenReturn(skillTreeDTO);

        mockMvc.perform(get("/skill-tree"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.courses.length()").value(2))
                .andExpect(jsonPath("$.courses[0].id").value(course1Id.toString()))
                .andExpect(jsonPath("$.courses[0].code").value("CS101"))
                .andExpect(jsonPath("$.prerequisites.length()").value(1))
                .andExpect(jsonPath("$.prerequisites[0].courseId").value(course2Id.toString()))
                .andExpect(jsonPath("$.prerequisites[0].prerequisiteId").value(course1Id.toString()));
    }

    @Test
    void getCourseDetail_whenFound_shouldReturn200AndCourseDetailDTO() throws Exception {
        UUID courseId = UUID.randomUUID();
        UUID topicId = UUID.randomUUID();

        CourseDetailDTO detailDTO = new CourseDetailDTO(
                courseId,
                "CS261",
                "Software Engineering",
                "SE fundamentals",
                List.of(new TopicItemDTO(topicId, "Requirements", "User stories", 1))
        );

        when(courseService.getCourseDetail(courseId)).thenReturn(detailDTO);

        mockMvc.perform(get("/courses/{courseId}", courseId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(courseId.toString()))
                .andExpect(jsonPath("$.code").value("CS261"))
                .andExpect(jsonPath("$.name").value("Software Engineering"))
                .andExpect(jsonPath("$.topics.length()").value(1))
                .andExpect(jsonPath("$.topics[0].id").value(topicId.toString()))
                .andExpect(jsonPath("$.topics[0].seqNo").value(1));
    }

    @Test
    void getCourseDetail_whenNotFound_shouldReturn404() throws Exception {
        UUID courseId = UUID.randomUUID();

        when(courseService.getCourseDetail(courseId))
                .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND));

        mockMvc.perform(get("/courses/{courseId}", courseId))
                .andExpect(status().isNotFound());
    }
}

