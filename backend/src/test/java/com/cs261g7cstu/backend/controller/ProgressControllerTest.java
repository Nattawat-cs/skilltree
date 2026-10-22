package com.cs261g7cstu.backend.controller;

import com.cs261g7cstu.backend.dto.CourseProgressDTO;
import com.cs261g7cstu.backend.dto.ProgressDTO;
import com.cs261g7cstu.backend.service.ProgressService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProgressController.class)
class ProgressControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProgressService progressService;

    @Test
    void getProgress_whenNoSession_shouldReturn401() throws Exception {
        mockMvc.perform(get("/progress"))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(progressService);
    }

    @Test
    void getProgress_whenAuthenticated_shouldReturn200AndProgressList() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID topicId = UUID.randomUUID();
        LocalDateTime doneAt = LocalDateTime.of(2026, 10, 20, 12, 0);

        when(progressService.getProgress(userId))
                .thenReturn(List.of(new ProgressDTO(topicId, doneAt)));

        mockMvc.perform(get("/progress").sessionAttr("userId", userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].topicId").value(topicId.toString()));
    }

    @Test
    void getCourseProgress_whenNoSession_shouldReturn401() throws Exception {
        mockMvc.perform(get("/progress/courses"))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(progressService);
    }

    @Test
    void getCourseProgress_whenAuthenticated_shouldReturn200AndCourseProgressList() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();

        when(progressService.getCourseProgress(userId))
                .thenReturn(List.of(new CourseProgressDTO(courseId, "CS101", "Intro", 4L, 2L, 50)));

        mockMvc.perform(get("/progress/courses").sessionAttr("userId", userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].courseId").value(courseId.toString()))
                .andExpect(jsonPath("$[0].code").value("CS101"))
                .andExpect(jsonPath("$[0].percent").value(50));
    }

    @Test
    void markDone_whenNoSession_shouldReturn401() throws Exception {
        UUID topicId = UUID.randomUUID();

        mockMvc.perform(put("/progress/topics/{topicId}", topicId))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(progressService);
    }

    @Test
    void markDone_whenTopicNotFound_shouldReturn404() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID topicId = UUID.randomUUID();

        when(progressService.markDone(userId, topicId))
                .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND));

        mockMvc.perform(put("/progress/topics/{topicId}", topicId)
                        .sessionAttr("userId", userId))
                .andExpect(status().isNotFound());
    }

    @Test
    void markDone_whenAuthenticatedAndValidTopic_shouldReturn200AndProgressDTO() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID topicId = UUID.randomUUID();
        LocalDateTime doneAt = LocalDateTime.of(2026, 10, 20, 12, 30);

        when(progressService.markDone(userId, topicId))
                .thenReturn(new ProgressDTO(topicId, doneAt));

        mockMvc.perform(put("/progress/topics/{topicId}", topicId)
                        .sessionAttr("userId", userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.topicId").value(topicId.toString()));
    }

    @Test
    void unmarkDone_whenNoSession_shouldReturn401() throws Exception {
        UUID topicId = UUID.randomUUID();

        mockMvc.perform(delete("/progress/topics/{topicId}", topicId))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(progressService);
    }

    @Test
    void unmarkDone_whenAuthenticated_shouldReturn204NoContent() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID topicId = UUID.randomUUID();

        doNothing().when(progressService).unmarkDone(userId, topicId);

        mockMvc.perform(delete("/progress/topics/{topicId}", topicId)
                        .sessionAttr("userId", userId))
                .andExpect(status().isNoContent());

        verify(progressService).unmarkDone(userId, topicId);
    }
}

