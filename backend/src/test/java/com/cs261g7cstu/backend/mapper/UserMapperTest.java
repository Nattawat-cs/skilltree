package com.cs261g7cstu.backend.mapper;

import com.cs261g7cstu.backend.dto.TuVerifyResponseDTO;
import com.cs261g7cstu.backend.dto.UserDTO;
import com.cs261g7cstu.backend.entity.User;
import com.cs261g7cstu.backend.enums.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class UserMapperTest {

    private UserMapper userMapper;

    @BeforeEach
    void setUp() {
        userMapper = new UserMapper();
    }

    @Test
    void toEntity_shouldMapTuVerifyResponseToUserWithStudentRole() {
        TuVerifyResponseDTO response = new TuVerifyResponseDTO(
                true,
                "Success",
                "student",
                "6709681234",
                "ปกติ",
                "10",
                "สมชาย ใจดี",
                "Somchai Jaidee",
                "somchai.jai@dome.tu.ac.th",
                "วิทยาการคอมพิวเตอร์",
                "คณะวิทยาศาสตร์และเทคโนโลยี"
        );

        User user = userMapper.toEntity(response);

        assertNotNull(user);
        assertEquals("6709681234", user.getStudentId());
        assertEquals("สมชาย ใจดี", user.getDisplayNameTh());
        assertEquals("Somchai Jaidee", user.getDisplayNameEn());
        assertEquals("somchai.jai@dome.tu.ac.th", user.getEmail());
        assertEquals("ปกติ", user.getTuStatus());
        assertEquals("คณะวิทยาศาสตร์และเทคโนโลยี", user.getFaculty());
        assertEquals("วิทยาการคอมพิวเตอร์", user.getDepartment());
        assertEquals(Role.STUDENT, user.getRole());
    }

    @Test
    void toDTO_shouldMapUserEntityToUserDTO() {
        UUID userId = UUID.randomUUID();
        User user = new User();
        user.setId(userId);
        user.setStudentId("6709681234");
        user.setDisplayNameTh("สมชาย ใจดี");
        user.setDisplayNameEn("Somchai Jaidee");
        user.setEmail("somchai.jai@dome.tu.ac.th");
        user.setTuStatus("ปกติ");
        user.setFaculty("คณะวิทยาศาสตร์และเทคโนโลยี");
        user.setDepartment("วิทยาการคอมพิวเตอร์");
        user.setRole(Role.STUDENT);

        UserDTO dto = userMapper.toDTO(user);

        assertNotNull(dto);
        assertEquals(userId, dto.id());
        assertEquals("6709681234", dto.studentId());
        assertEquals("สมชาย ใจดี", dto.displayNameTh());
        assertEquals("Somchai Jaidee", dto.displayNameEn());
        assertEquals("somchai.jai@dome.tu.ac.th", dto.email());
        assertEquals("ปกติ", dto.tuStatus());
        assertEquals("คณะวิทยาศาสตร์และเทคโนโลยี", dto.faculty());
        assertEquals("วิทยาการคอมพิวเตอร์", dto.department());
    }
}

