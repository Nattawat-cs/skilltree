package com.cs261g7cstu.backend.service;

import com.cs261g7cstu.backend.dto.TuVerifyResponseDTO;
import com.cs261g7cstu.backend.dto.UserDTO;
import com.cs261g7cstu.backend.entity.User;
import com.cs261g7cstu.backend.mapper.UserMapper;
import com.cs261g7cstu.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private UserService userService;

    @Test
    void getOrCreate_whenUserAlreadyExists_shouldReturnExistingUserWithoutSaving() {
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

        UUID userId = UUID.randomUUID();
        User existingUser = new User();
        existingUser.setId(userId);
        existingUser.setStudentId("6709681234");

        UserDTO expectedDto = new UserDTO(
                userId,
                "6709681234",
                "สมชาย ใจดี",
                "Somchai Jaidee",
                "somchai.jai@dome.tu.ac.th",
                "ปกติ",
                "คณะวิทยาศาสตร์และเทคโนโลยี",
                "วิทยาการคอมพิวเตอร์"
        );

        when(userRepository.findByStudentId("6709681234")).thenReturn(Optional.of(existingUser));
        when(userMapper.toDTO(existingUser)).thenReturn(expectedDto);

        UserDTO result = userService.getOrCreate(response);

        assertNotNull(result);
        assertEquals(expectedDto, result);
        verify(userRepository).findByStudentId("6709681234");
        verify(userRepository, never()).save(any());
        verify(userMapper, never()).toEntity(any());
        verify(userMapper).toDTO(existingUser);
    }

    @Test
    void getOrCreate_whenUserDoesNotExist_shouldCreateAndSaveNewUser() {
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

        User newUser = new User();
        newUser.setStudentId("6709681234");

        UUID savedId = UUID.randomUUID();
        User savedUser = new User();
        savedUser.setId(savedId);
        savedUser.setStudentId("6709681234");

        UserDTO expectedDto = new UserDTO(
                savedId,
                "6709681234",
                "สมชาย ใจดี",
                "Somchai Jaidee",
                "somchai.jai@dome.tu.ac.th",
                "ปกติ",
                "คณะวิทยาศาสตร์และเทคโนโลยี",
                "วิทยาการคอมพิวเตอร์"
        );

        when(userRepository.findByStudentId("6709681234")).thenReturn(Optional.empty());
        when(userMapper.toEntity(response)).thenReturn(newUser);
        when(userRepository.save(newUser)).thenReturn(savedUser);
        when(userMapper.toDTO(savedUser)).thenReturn(expectedDto);

        UserDTO result = userService.getOrCreate(response);

        assertNotNull(result);
        assertEquals(expectedDto, result);
        verify(userRepository).findByStudentId("6709681234");
        verify(userMapper).toEntity(response);
        verify(userRepository).save(newUser);
        verify(userMapper).toDTO(savedUser);
    }
}

